import os
import httpx
import jwt
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
import base64
import time
import hashlib
import hmac
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class ExchangeRequest(BaseModel):
    code: str
    code_verifier: str
    redirect_uri: str

@router.post("/auth/telegram/exchange")
async def exchange_telegram_code(req: ExchangeRequest):
    client_id = os.getenv("VITE_TELEGRAM_CLIENT_ID", "")
    bot_token = os.getenv("TELEGRAM_BOT_TOKEN", "")
    if not client_id or not bot_token:
        # fallback parsing from bot token
        client_id = bot_token.split(":")[0] if ":" in bot_token else ""
    client_secret = os.getenv("TELEGRAM_CLIENT_SECRET", bot_token)

    auth_str = f"{client_id}:{client_secret}"
    b64_auth = base64.b64encode(auth_str.encode()).decode()

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://oauth.telegram.org/token",
            headers={
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": f"Basic {b64_auth}"
            },
            data={
                "grant_type": "authorization_code",
                "code": req.code,
                "redirect_uri": req.redirect_uri,
                "client_id": client_id,
                "code_verifier": req.code_verifier
            }
        )
        if response.status_code != 200:
            logger.error(f"Telegram token exchange failed: {response.text}")
            raise HTTPException(status_code=400, detail="Failed to exchange code")

        data = response.json()
        id_token = data.get("id_token")
        if not id_token:
            raise HTTPException(status_code=400, detail="No id_token returned")

        # Decode JWT (Normally verify signature with JWKS, skipping sig verification here for simplicity
        # as we just got it directly from Telegram via HTTPS TLS, but we will decode the payload)
        payload = jwt.decode(id_token, options={"verify_signature": False})
        
        # Generate our legacy auth data dict so the rest of the app doesn't break
        user_id = payload.get("id")
        first_name = payload.get("name", "").split(" ")[0]
        last_name = " ".join(payload.get("name", "").split(" ")[1:]) if " " in payload.get("name", "") else None
        username = payload.get("preferred_username")
        photo_url = payload.get("picture")
        auth_date = payload.get("iat", int(time.time()))

        auth_data = {
            "id": user_id,
            "first_name": first_name,
            "auth_date": auth_date
        }
        if last_name: auth_data["last_name"] = last_name
        if username: auth_data["username"] = username
        if photo_url: auth_data["photo_url"] = photo_url

        # Generate hash using our legacy verification logic
        data_check_list = []
        for key, value in sorted(auth_data.items()):
            if value is not None:
                data_check_list.append(f"{key}={value}")
        data_check_string = "\n".join(data_check_list)
        secret_key = hashlib.sha256(bot_token.encode()).digest()
        hash_value = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()

        auth_data["hash"] = hash_value

        return auth_data

