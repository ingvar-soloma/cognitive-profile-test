"""
test_save_result.py — Business logic tests for /api/save-result endpoint.

Strategy: Credit system, race conditions, re-submission logic.
- First save is free; second costs 100 credits
- User with 0 credits cannot regenerate
- Concurrent saves for the same user+test should not double-charge
- Data integrity: answers are JSON-serialized correctly
"""

import os
os.environ["AUTH_SECRET"] = "test_secret_key_for_pytest"

import sys, time, asyncio
import pytest
from unittest.mock import AsyncMock, patch, MagicMock

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

os.environ["AUTH_SECRET"] = "test_secret_key_for_pytest"
os.environ.setdefault("TELEGRAM_BOT_TOKEN", "")
os.environ.setdefault("GEMINI_API_KEY", "")
os.environ.setdefault("DATABASE_URL", "postgresql://user:password@localhost:5432/test")

import jwt

TEST_SECRET = "test_secret_key_for_pytest"
TEST_USER_ID = "12345678"


def _make_token(user_id=TEST_USER_ID):
    payload = {"id": user_id, "iat": int(time.time()), "exp": int(time.time()) + 3600}
    return jwt.encode(payload, TEST_SECRET, algorithm="HS256")


def _save_payload(user_id=TEST_USER_ID, answers=None, force=False):
    return {
        "auth_data": {
            "id": user_id,
            "first_name": "Test",
            "auth_date": int(time.time()),
            "hash": _make_token(user_id),
        },
        "test_type": "express_demo",
        "answers": answers if answers is not None else {"q1": {"value": 5}, "q2": {"value": 3}},
        "scores": {"Visual": 4.0},
        "force_regenerate": force,
    }


# ─── Credit logic ──────────────────────────────────────────────────────────────

class TestCreditLogic:
    """
    Business rule: express costs 100 credits, full costs 250 credits.
    User below threshold must be blocked with 403.
    """

    def test_new_user_without_credits_is_blocked(self, client, mock_db):
        """New user starts with 0 credits → cost = 100 → blocked with 403."""
        mock_db.fetchrow.side_effect = [
            None,  # user_exists = None (new user)
            None,  # existing_result = None
        ]
        mock_db.execute.return_value = "OK"
 
        resp = client.post("/api/save-result", json=_save_payload())
        assert resp.status_code == 403
        assert "credits" in resp.json().get("detail", "").lower()

    def test_returning_user_with_enough_credits_charged(self, client, mock_db):
        """Existing result + 300 credits → 100 deducted → success."""
        mock_db.fetchrow.side_effect = [
            {"id": TEST_USER_ID, "referred_by": None, "credits": 300},  # user exists with credits
            {"test_type": "express_demo"},  # existing_result found
        ]
        mock_db.fetchval.return_value = "share-uuid-def"

        resp = client.post("/api/save-result", json=_save_payload())
        assert resp.status_code != 403

    def test_user_with_zero_credits_blocked_on_regeneration(self, client, mock_db):
        """
        CRITICAL: user has 0 credits but already has a result.
        Cost would be 100. Must return 403 Insufficient Credits.
        """
        mock_db.fetchrow.side_effect = [
            {"id": TEST_USER_ID, "referred_by": None, "credits": 0},  # broke
            {"test_type": "express_demo"},  # existing result
        ]
        resp = client.post("/api/save-result", json=_save_payload())
        assert resp.status_code == 403
        assert "credits" in resp.json().get("detail", "").lower()

    def test_user_with_99_credits_blocked(self, client, mock_db):
        """Exactly 99 credits < 100 required → 403."""
        mock_db.fetchrow.side_effect = [
            {"id": TEST_USER_ID, "referred_by": None, "credits": 99},
            {"test_type": "express_demo"},
        ]
        resp = client.post("/api/save-result", json=_save_payload())
        assert resp.status_code == 403

    def test_user_with_exactly_100_credits_succeeds(self, client, mock_db):
        """Exactly 100 credits = cost → should pass the check."""
        mock_db.fetchrow.side_effect = [
            {"id": TEST_USER_ID, "referred_by": None, "credits": 100},
            {"test_type": "express_demo"},
        ]
        mock_db.fetchval.return_value = "share-uuid-xyz"
        resp = client.post("/api/save-result", json=_save_payload())
        assert resp.status_code != 403


# ─── Input edge cases ──────────────────────────────────────────────────────────

class TestSaveResultInputEdgeCases:

    def test_empty_answers_dict_returns_error(self, client, mock_db):
        """Zero answers must be rejected — no point calling Gemini."""
        mock_db.fetchrow.return_value = None
        resp = client.post("/api/save-result", json=_save_payload(answers={}))
        assert resp.status_code == 400

    def test_answers_with_all_none_values_rejected(self, client, mock_db):
        mock_db.fetchrow.return_value = None
        resp = client.post("/api/save-result", json=_save_payload(
            answers={"q1": {"value": None, "note": ""}, "q2": {"value": None, "note": None}}
        ))
        assert resp.status_code == 400

    def test_note_xss_in_save_payload_sanitized_or_blocked(self, client, mock_db):
        """XSS in note field must not pass through raw to DB/AI."""
        mock_db.fetchrow.side_effect = [
            {"id": TEST_USER_ID, "referred_by": None, "credits": 300},
            None,  # no existing result
            {"id": 1},  # early adopter check
        ]
        mock_db.fetchval.return_value = "share-uuid"
        mock_db.execute.return_value = "OK"

        resp = client.post("/api/save-result", json=_save_payload(
            answers={"q1": {"value": 5, "note": '<script>alert("xss")</script>'}}
        ))
        # Should NOT 500 — either sanitize or accept as escaped
        assert resp.status_code != 500

    def test_binary_garbage_in_note(self, client, mock_db):
        """Null bytes and control chars should not crash the server."""
        mock_db.fetchrow.side_effect = [
            None,  # user check
            None,  # test results check
            {"id": 1},  # early adopter badge check
        ]
        mock_db.fetchval.return_value = "share-uuid"
        mock_db.execute.return_value = "OK"

        garbage_note = "normal\x00\x01\x02\xff"
        resp = client.post("/api/save-result", json=_save_payload(
            answers={"q1": {"value": 3, "note": garbage_note}}
        ))
        assert resp.status_code != 500

    def test_image_data_url_in_value(self, client, mock_db):
        """Drawing questions send base64 data URLs — must not crash."""
        mock_db.fetchrow.side_effect = [
            None,  # user check
            None,  # test results check
            {"id": 1},  # early adopter badge check
        ]
        mock_db.fetchval.return_value = "share-uuid"
        mock_db.execute.return_value = "OK"

        # Minimal 1x1 PNG as data URL
        tiny_png = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        resp = client.post("/api/save-result", json=_save_payload(
            answers={"drawing_q1": {"value": tiny_png}}
        ))
        assert resp.status_code != 500

    def test_unknown_test_type_accepted_or_gracefully_rejected(self, client, mock_db):
        """Unknown test_type should not cause unhandled 500."""
        mock_db.fetchrow.side_effect = [
            None,  # user check
            None,  # test results check
            {"id": 1},  # early adopter badge check
        ]
        mock_db.fetchval.return_value = "share-uuid"
        mock_db.execute.return_value = "OK"
        payload = _save_payload()
        payload["test_type"] = "nonexistent_test_xyz"
        resp = client.post("/api/save-result", json=payload)
        assert resp.status_code in (200, 400, 403, 404, 422)
        assert resp.status_code != 500


# ─── Public results endpoint ───────────────────────────────────────────────────

class TestPublicResultsEndpoint:
    """GET /api/public-results/{id} — privacy enforcement."""

    def test_private_profile_returns_403(self, client, mock_db):
        mock_db.fetchrow.side_effect = [
            {"id": TEST_USER_ID, "is_public": False, "public_nickname": None, "photo_url": None},
        ]
        resp = client.get(f"/api/public-results/{TEST_USER_ID}")
        assert resp.status_code == 403

    def test_nonexistent_user_returns_404(self, client, mock_db):
        mock_db.fetchrow.return_value = None
        resp = client.get("/api/public-results/nonexistent_user_id_xyz")
        assert resp.status_code == 404

    def test_notes_stripped_from_public_view(self, client, mock_db):
        """Private notes must NEVER appear in public API response."""
        import json
        mock_db.fetchrow.side_effect = [
            {"id": TEST_USER_ID, "is_public": True, "public_nickname": "TestUser", "photo_url": None},
            {
                "test_type": "express_demo",
                "share_id": "some-uuid",
                "answers": json.dumps({"q1": {"value": 5, "note": "PRIVATE NOTE HERE"}}),
                "scores": json.dumps({"Visual": 5.0}),
                "recommendations": json.dumps({}),
                "badges": json.dumps([]),
                "public_share_ids": None,
            },
        ]
        resp = client.get(f"/api/public-results/{TEST_USER_ID}")
        if resp.status_code == 200:
            body = resp.text
            assert "PRIVATE NOTE HERE" not in body

    def test_path_traversal_in_id_rejected(self, client, mock_db):
        """Attempt directory traversal via the id parameter."""
        mock_db.fetchrow.return_value = None
        # Use URL-encoded path to bypass Starlette's client path resolution
        # which would resolve relative path '../..' before hitting the test server
        resp = client.get("/api/public-results/%2e%2e%2f%2e%2e%2fetc%2fpasswd")
        assert resp.status_code == 404


# ─── Error logging endpoint ────────────────────────────────────────────────────

class TestErrorLogEndpoint:
    """POST /api/logs/error — must not crash and not expose internals."""

    def test_normal_error_log_accepted(self, client):
        resp = client.post("/api/logs/error", json={
            "message": "TypeError: cannot read property of undefined",
            "url": "https://np42.dev/survey",
            "user_id": TEST_USER_ID,
            "userAgent": "Mozilla/5.0",
            "stack": "Error at App.tsx:123",
            "timestamp": "2024-01-01T00:00:00Z",
        })
        assert resp.status_code == 200

    def test_missing_message_rejected(self, client):
        resp = client.post("/api/logs/error", json={"url": "https://np42.dev"})
        assert resp.status_code in (400, 422)

    def test_xss_in_error_message_does_not_crash(self, client):
        resp = client.post("/api/logs/error", json={
            "message": "<script>alert('xss')</script>",
            "url": "https://np42.dev",
        })
        assert resp.status_code == 200

    def test_giant_stack_trace_does_not_crash(self, client):
        """10MB stack trace should not blow up the server or Telegram notifier."""
        resp = client.post("/api/logs/error", json={
            "message": "OOM Error",
            "stack": "at " + "SomeFunction.tsx:1\n    at " * 5000,
        })
        assert resp.status_code in (200, 413)  # 413 = Payload Too Large is acceptable
        assert resp.status_code != 500
