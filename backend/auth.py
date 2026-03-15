import os
import httpx
import jwt
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
import time
import uuid
import os
import logging
from google.oauth2 import id_token
from google.auth.transport import requests
from db import get_db

logger = logging.getLogger(__name__)

router = APIRouter()

class GoogleExchangeRequest(BaseModel):
    credential: str
    guest_id: str | None = None

@router.post("/auth/guest")
async def create_guest_session():
    user_id = f"guest_{uuid.uuid4().hex[:12]}"
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''INSERT INTO aphantasia_users (id, first_name, is_guest, last_login)
                      VALUES (%s, %s, TRUE, CURRENT_TIMESTAMP)''',
                   (user_id, "Guest"))
    conn.commit()
    conn.close()

    auth_secret = os.getenv("AUTH_SECRET", os.getenv("TELEGRAM_BOT_TOKEN", "default-secret-for-hmac"))
    auth_data = {
        "id": user_id,
        "first_name": "Guest",
        "is_guest": True,
        "auth_date": int(time.time())
    }
    
    token = jwt.encode(auth_data, auth_secret, algorithm="HS256")
    auth_data["hash"] = token
    auth_data["access_token"] = token
    return auth_data

@router.post("/auth/google/exchange")
async def exchange_google_code(req: GoogleExchangeRequest):
    client_id = os.getenv("VITE_GOOGLE_CLIENT_ID", "")
    logger.info(f"Exchanging Google code. Client ID: {client_id[:10]}... Length: {len(req.credential)}")
    try:
        idinfo = id_token.verify_oauth2_token(req.credential, requests.Request(), client_id, clock_skew_in_seconds=10)
        
        user_id = str(idinfo['sub'])
        first_name = idinfo.get("given_name", "GoogleUser")
        last_name = idinfo.get("family_name", "")
        username = idinfo.get("email", "")
        photo_url = idinfo.get("picture", "")

        conn = get_db()
        cursor = conn.cursor()
        
        # Check if Google user already exists
        cursor.execute("SELECT * FROM aphantasia_users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        
        if req.guest_id:
            # Check if guest exists
            cursor.execute("SELECT * FROM aphantasia_users WHERE id = %s AND is_guest = TRUE", (req.guest_id,))
            guest = cursor.fetchone()
            if guest and not user:
                # Upgrade guest to this Google user
                cursor.execute('''UPDATE aphantasia_users SET id = %s, email = %s, first_name = %s, last_name = %s, photo_url = %s, is_guest = FALSE, last_login = CURRENT_TIMESTAMP
                                  WHERE id = %s''',
                               (user_id, username, first_name, last_name, photo_url, req.guest_id))
                
                # Attempt to rename guest file if it exists
                DATA_DIR = os.getenv("DATA_DIR", "/app/data/results")
                old_file = os.path.join(DATA_DIR, f"{req.guest_id}.json")
                if os.path.exists(old_file):
                    os.rename(old_file, os.path.join(DATA_DIR, f"{user_id}.json"))
                
                user = True # We effectively created the user by updating the guest
        
        if not user:
            cursor.execute('''INSERT INTO aphantasia_users (id, email, first_name, last_name, photo_url, is_guest, last_login)
                              VALUES (%s, %s, %s, %s, %s, FALSE, CURRENT_TIMESTAMP)''',
                           (user_id, username, first_name, last_name, photo_url))
        elif not req.guest_id or user:
            # We already have the Google user, just update their details
            cursor.execute('''UPDATE aphantasia_users SET email = %s, first_name = %s, last_name = %s, photo_url = %s, is_guest = FALSE, last_login = CURRENT_TIMESTAMP
                              WHERE id = %s''',
                           (username, first_name, last_name, photo_url, user_id))
        conn.commit()
        conn.close()

        auth_secret = os.getenv("AUTH_SECRET", os.getenv("TELEGRAM_BOT_TOKEN", "default-secret-for-hmac"))
        
        auth_data = {
            "id": user_id,
            "first_name": first_name,
            "last_name": last_name,
            "username": username,
            "photo_url": photo_url,
            "auth_date": int(time.time())
        }
        
        # Issue JWT
        token = jwt.encode(auth_data, auth_secret, algorithm="HS256")
        
        # For backward compatibility with the frontend that still assumes UserAuth format with a hash
        auth_data["hash"] = token
        auth_data["access_token"] = token

        return auth_data
    except Exception as e:
        logger.error(f"Google verification failed: {str(e)}")
        # Log more details to help debugging
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=400, detail=f"Invalid Google token: {str(e)}")
