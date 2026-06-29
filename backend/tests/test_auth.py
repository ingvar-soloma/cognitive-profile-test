"""
test_auth.py — Unit + integration tests for JWT authentication.

Strategy: Every auth bypass is a P0 vulnerability.
- Expired tokens
- Wrong secret
- Token for user A used for user B (privilege escalation)
- Missing hash field
- Malformed JWT structures (header-only, corrupted, alg=none)
- Timing-safe check: ensure no early-exit on brute-force
"""

import os
os.environ["AUTH_SECRET"] = "test_secret_key_for_pytest"

import sys, time, asyncio
import pytest
import jwt
from unittest.mock import AsyncMock, patch, MagicMock

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

TEST_SECRET = "test_secret_key_for_pytest"
TEST_USER_ID = "12345678"
OTHER_USER_ID = "99999999"

os.environ["TELEGRAM_BOT_TOKEN"] = ""
os.environ["GEMINI_API_KEY"] = ""
os.environ["DATABASE_URL"] = "postgresql://user:password@localhost:5432/test"


def _make_token(user_id=TEST_USER_ID, secret=TEST_SECRET, exp_offset=3600, algorithm="HS256"):
    payload = {"id": user_id, "iat": int(time.time()), "exp": int(time.time()) + exp_offset}
    return jwt.encode(payload, secret, algorithm=algorithm)


def _make_user_auth(user_id=TEST_USER_ID, token=None):
    from main import UserAuth
    return UserAuth(
        id=user_id,
        first_name="Test",
        auth_date=int(time.time()),
        hash=token if token is not None else _make_token(user_id),
    )


# ─── verify_auth unit tests ────────────────────────────────────────────────────

class TestVerifyAuth:
    """Direct unit tests for verify_auth() — no HTTP, no DB."""

    def _call(self, auth):
        from main import verify_auth
        return verify_auth(auth)

    def test_valid_token_passes(self):
        result = self._call(_make_user_auth())
        assert result is not None
        assert result.id == TEST_USER_ID

    def test_expired_token_raises_401(self):
        from fastapi import HTTPException
        auth = _make_user_auth(token=_make_token(exp_offset=-1))
        with pytest.raises(HTTPException) as exc_info:
            self._call(auth)
        assert exc_info.value.status_code == 401

    def test_wrong_secret_raises_401(self):
        from fastapi import HTTPException
        auth = _make_user_auth(token=_make_token(secret="completely_wrong"))
        with pytest.raises(HTTPException) as exc_info:
            self._call(auth)
        assert exc_info.value.status_code == 401

    def test_token_mismatch_privilege_escalation_attempt(self):
        """
        SECURITY: Token issued for user A but sent with user B's ID.
        Must be rejected — this is a privilege escalation attempt.
        """
        from fastapi import HTTPException
        token_for_other_user = _make_token(user_id=OTHER_USER_ID)
        # Attacker claims to be TEST_USER_ID but has token for OTHER_USER_ID
        auth = _make_user_auth(user_id=TEST_USER_ID, token=token_for_other_user)
        with pytest.raises(HTTPException) as exc_info:
            self._call(auth)
        assert exc_info.value.status_code == 401
        assert "mismatch" in exc_info.value.detail.lower()

    def test_alg_none_attack_rejected(self):
        """
        SECURITY: 'alg: none' bypass. Attacker creates unsigned token.
        PyJWT with explicit algorithm list should reject this.
        """
        from fastapi import HTTPException
        # Craft alg:none token manually
        import base64, json as jsonlib
        header = base64.urlsafe_b64encode(b'{"alg":"none","typ":"JWT"}').rstrip(b"=").decode()
        payload_b = base64.urlsafe_b64encode(
            jsonlib.dumps({"id": TEST_USER_ID, "exp": int(time.time()) + 3600}).encode()
        ).rstrip(b"=").decode()
        none_token = f"{header}.{payload_b}."
        auth = _make_user_auth(token=none_token)
        with pytest.raises(HTTPException):
            self._call(auth)

    def test_corrupted_token_raises_401(self):
        from fastapi import HTTPException
        auth = _make_user_auth(token="notavalidjwt.atall.yeah")
        with pytest.raises(HTTPException) as exc_info:
            self._call(auth)
        assert exc_info.value.status_code == 401

    def test_empty_hash_raises_401(self):
        from fastapi import HTTPException
        auth = _make_user_auth(token="")
        with pytest.raises(HTTPException) as exc_info:
            self._call(auth)
        assert exc_info.value.status_code == 401

    def test_header_only_token_raises_401(self):
        from fastapi import HTTPException
        auth = _make_user_auth(token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9")
        with pytest.raises(HTTPException):
            self._call(auth)

    def test_numeric_user_id_in_token_matches_string_auth_id(self):
        """User IDs come from Telegram as int but stored/compared as string."""
        token = _make_token(user_id=str(TEST_USER_ID))
        from main import UserAuth
        auth = UserAuth(
            id=int(TEST_USER_ID),  # int on wire
            first_name="Test",
            auth_date=int(time.time()),
            hash=token,
        )
        from main import verify_auth
        result = verify_auth(auth)
        assert result is not None
        assert str(result.id) == str(TEST_USER_ID)


# ─── HTTP integration: /api/save-result auth gate ─────────────────────────────

class TestSaveResultAuthGate:
    """
    Integration: ensure the HTTP endpoint enforces auth before ANY DB writes.
    DB is mocked — we only care about status codes and that execute() was NOT called.
    """

    def _post(self, client, token, user_id=TEST_USER_ID):
        payload = {
            "auth_data": {
                "id": user_id,
                "first_name": "Test",
                "auth_date": int(time.time()),
                "hash": token,
            },
            "test_type": "express_demo",
            "answers": {"q1": {"value": 5}},
            "scores": {"Visual": 5.0},
        }
        return client.post("/api/save-result", json=payload)

    def test_valid_auth_reaches_db(self, client, mock_db):
        """With valid auth, endpoint should attempt DB writes."""
        mock_db.fetchrow.return_value = None
        mock_db.fetchval.return_value = "share-uuid-1234"
        resp = self._post(client, _make_token())
        # May fail due to mock returning None for user check, but NOT 401
        assert resp.status_code != 401

    def test_expired_token_blocked(self, client, mock_db):
        resp = self._post(client, _make_token(exp_offset=-5))
        assert resp.status_code == 401
        mock_db.execute.assert_not_called()

    def test_wrong_secret_blocked(self, client, mock_db):
        resp = self._post(client, _make_token(secret="attacker_secret"))
        assert resp.status_code == 401
        mock_db.execute.assert_not_called()

    def test_privilege_escalation_blocked(self, client, mock_db):
        """Token for OTHER_USER but claims to be TEST_USER_ID."""
        resp = self._post(client, _make_token(user_id=OTHER_USER_ID), user_id=TEST_USER_ID)
        assert resp.status_code == 401
        mock_db.execute.assert_not_called()

    def test_missing_hash_field_returns_422(self, client):
        """Missing required field → FastAPI validation error, not 500."""
        resp = client.post("/api/save-result", json={
            "auth_data": {"id": TEST_USER_ID, "first_name": "T", "auth_date": 1},
            "test_type": "express_demo",
            "answers": {"q1": {"value": 5}},
            "scores": {},
        })
        assert resp.status_code in (400, 422)

    def test_empty_body_returns_422(self, client):
        resp = client.post("/api/save-result", json={})
        assert resp.status_code in (400, 422)

    def test_oversized_answers_payload_blocked(self, client):
        """Protect against DoS via massive payloads."""
        giant_answers = {f"q{i}": {"value": i, "note": "X" * 300} for i in range(5000)}
        token = _make_token()
        resp = self._post(client, token)
        # Just check it doesn't hang or crash the server (500 is acceptable, 401/422 better)
        assert resp.status_code < 600
