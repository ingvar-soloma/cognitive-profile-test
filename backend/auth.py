import os
import httpx
import jwt
from fastapi import APIRouter, HTTPException, Request, Depends, Response
from pydantic import BaseModel
import time
import uuid
import logging
import asyncpg
from google.oauth2 import id_token
from google.auth.transport import requests
from db import get_db

logger = logging.getLogger(__name__)

router = APIRouter()

class GoogleExchangeRequest(BaseModel):
    credential: str
    guest_id: str | None = None

@router.post("/auth/guest")
async def create_guest_session(conn: asyncpg.Connection = Depends(get_db)):
    user_id = f"guest_{uuid.uuid4().hex[:12]}"
    await conn.execute('''INSERT INTO aphantasia_users (id, first_name, is_guest, last_login)
                          VALUES ($1, $2, TRUE, CURRENT_TIMESTAMP)''',
                       user_id, "Guest")
    await conn.execute('''INSERT INTO credit_transactions (user_id, amount, transaction_type, comment) 
                          VALUES ($1, 300, 'registration_bonus', 'Initial guest registration')''', user_id)

    auth_secret = os.getenv("AUTH_SECRET", os.getenv("TELEGRAM_BOT_TOKEN", "default-secret-for-hmac"))
    public_id = await conn.fetchval("SELECT public_id FROM aphantasia_users WHERE id = $1", user_id)
    auth_data = {
        "id": user_id,
        "public_id": str(public_id),
        "first_name": "Guest",
        "is_guest": True,
        "auth_date": int(time.time())
    }
    
    token = jwt.encode(auth_data, auth_secret, algorithm="HS256")
    auth_data["hash"] = token
    auth_data["access_token"] = token
    return auth_data

@router.post("/auth/google/exchange")
async def exchange_google_code(req: GoogleExchangeRequest, response: Response, conn: asyncpg.Connection = Depends(get_db)):
    client_id = os.getenv("VITE_GOOGLE_CLIENT_ID", "")
    logger.info(f"Exchanging Google code. Client ID: {client_id[:10]}... Length: {len(req.credential)}")
    try:
        idinfo = id_token.verify_oauth2_token(req.credential, requests.Request(), client_id, clock_skew_in_seconds=10)
        
        user_id = str(idinfo['sub'])
        first_name = idinfo.get("given_name", "GoogleUser")
        last_name = idinfo.get("family_name", "")
        username = idinfo.get("email", "")
        photo_url = idinfo.get("picture", "")

        # Check if Google user already exists
        user = await conn.fetchrow("SELECT * FROM aphantasia_users WHERE id = $1", user_id)
        
        if req.guest_id:
            # Check if guest exists
            guest = await conn.fetchrow("SELECT * FROM aphantasia_users WHERE id = $1 AND is_guest = TRUE", req.guest_id)
            if guest and not user:
                # Upgrade guest to this Google user
                await conn.execute('''UPDATE aphantasia_users SET id = $1, email = $2, first_name = $3, last_name = $4, photo_url = $5, is_guest = FALSE, last_login = CURRENT_TIMESTAMP
                                      WHERE id = $6''',
                                   user_id, username, first_name, last_name, photo_url, req.guest_id)
                
                # Attempt to rename guest file if it exists
                DATA_DIR = os.getenv("DATA_DIR", "/app/data/results")
                old_file = os.path.join(DATA_DIR, f"{req.guest_id}.json")
                if os.path.exists(old_file):
                    import aiofiles.os
                    await aiofiles.os.rename(old_file, os.path.join(DATA_DIR, f"{user_id}.json"))
                
                user = True # Effectively created/upgraded
        
        if not user:
            await conn.execute('''INSERT INTO aphantasia_users (id, email, first_name, last_name, photo_url, is_guest, last_login)
                                  VALUES ($1, $2, $3, $4, $5, FALSE, CURRENT_TIMESTAMP)''',
                               user_id, username, first_name, last_name, photo_url)
            await conn.execute('''INSERT INTO credit_transactions (user_id, amount, transaction_type, comment) 
                                  VALUES ($1, 300, 'registration_bonus', 'Initial google registration')''', user_id)
        elif not req.guest_id or user:
            # Update detail
            if isinstance(user, asyncpg.Record):
                 await conn.execute('''UPDATE aphantasia_users SET email = $1, first_name = $2, last_name = $3, photo_url = $4, is_guest = FALSE, last_login = CURRENT_TIMESTAMP
                                  WHERE id = $5''',
                               username, first_name, last_name, photo_url, user_id)

        auth_secret = os.getenv("AUTH_SECRET", os.getenv("TELEGRAM_BOT_TOKEN", "default-secret-for-hmac"))
        
        public_id = await conn.fetchval("SELECT public_id FROM aphantasia_users WHERE id = $1", user_id)
        auth_data = {
            "id": user_id,
            "public_id": str(public_id),
            "first_name": first_name,
            "last_name": last_name,
            "username": username,
            "photo_url": photo_url,
            "auth_date": int(time.time()),
            "exp": int(time.time()) + 30 * 24 * 3600
        }
        
        token = jwt.encode(auth_data, auth_secret, algorithm="HS256")
        auth_data["hash"] = token
        auth_data["access_token"] = token
        
        response.set_cookie(
            key="auth_token",
            value=token,
            httponly=True,
            secure=True,
            samesite="lax",
            max_age=30 * 24 * 3600 # 30 days
        )

        return auth_data
    except Exception as e:
        logger.error(f"Google verification failed: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=400, detail=f"Invalid Google token: {str(e)}")

@router.get("/auth/me")
async def get_me(request: Request, conn: asyncpg.Connection = Depends(get_db)):
    """Returns the current user based on the secure cookie."""
    token = request.cookies.get("auth_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        auth_secret = os.getenv("AUTH_SECRET", os.getenv("TELEGRAM_BOT_TOKEN", "default-secret-for-hmac"))
        payload = jwt.decode(token, auth_secret, algorithms=["HS256"])
        return payload
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid session")

@router.post("/auth/logout")
async def logout(response: Response):
    """Clears the auth cookie."""
    response.delete_cookie(key="auth_token")
    return {"status": "success"}
