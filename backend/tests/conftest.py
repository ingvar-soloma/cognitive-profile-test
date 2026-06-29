"""
conftest.py — Shared fixtures for pytest.

Provides:
- JWT token factory for creating valid/expired/tampered tokens
- FastAPI TestClient with mocked DB and no real IO
- In-memory fake asyncpg connection
"""

import sys
import os
import time
import pytest
import jwt
from unittest.mock import AsyncMock, MagicMock, patch

# Allow importing backend.main directly
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

TEST_SECRET = "test_secret_key_for_pytest"
TEST_USER_ID = "12345678"

os.environ["AUTH_SECRET"] = TEST_SECRET
os.environ["TELEGRAM_BOT_TOKEN"] = ""
os.environ["GEMINI_API_KEY"] = ""
os.environ["DATABASE_URL"] = "postgresql://user:password@localhost:5432/test"


def make_jwt(user_id: str = TEST_USER_ID, secret: str = TEST_SECRET, exp_offset: int = 3600) -> str:
    """Create a JWT signed with the test secret. exp_offset < 0 = already expired."""
    payload = {"id": user_id, "iat": int(time.time()), "exp": int(time.time()) + exp_offset}
    return jwt.encode(payload, secret, algorithm="HS256")


def make_auth_data(user_id: str = TEST_USER_ID, token: str | None = None) -> dict:
    """Build a minimal valid UserAuth payload dict."""
    return {
        "id": user_id,
        "first_name": "Test",
        "last_name": "User",
        "username": "testuser@example.com",
        "auth_date": int(time.time()),
        "hash": token or make_jwt(user_id),
    }


@pytest.fixture
def valid_auth():
    return make_auth_data()


@pytest.fixture
def valid_token():
    return make_jwt()


@pytest.fixture
def expired_token():
    return make_jwt(exp_offset=-10)


@pytest.fixture
def wrong_secret_token():
    return make_jwt(secret="wrong_secret")


@pytest.fixture
def mismatched_token():
    """Token with different user_id than what's in the payload."""
    return make_jwt(user_id="99999999")


@pytest.fixture
def mock_db():
    """Async mock that acts like an asyncpg Connection."""
    conn = AsyncMock()
    conn.fetchrow = AsyncMock(return_value=None)
    conn.fetchval = AsyncMock(return_value=None)
    conn.fetch = AsyncMock(return_value=[])
    conn.execute = AsyncMock(return_value="UPDATE 1")
    return conn


@pytest.fixture
def client(mock_db):
    """FastAPI TestClient with real app but mocked DB dependency and init_db mock."""
    from fastapi.testclient import TestClient
    from main import app, get_db

    async def _override_get_db():
        yield mock_db

    app.dependency_overrides[get_db] = _override_get_db
    
    with patch("main.init_db", new_callable=AsyncMock) as mock_init:
        with TestClient(app, raise_server_exceptions=False) as c:
            yield c
            
    app.dependency_overrides.clear()
