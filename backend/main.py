import os
import hashlib
import hmac
import time
import json
import logging
import asyncio
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Depends, Request, BackgroundTasks
from fastapi.responses import StreamingResponse, HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import re
import aiofiles
import jwt
import asyncpg
from datetime import datetime, timezone
from google import genai
from telegram import Bot
from dotenv import load_dotenv

load_dotenv()

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Config
AUTH_SECRET = os.getenv("AUTH_SECRET", os.getenv("TELEGRAM_BOT_TOKEN", "default-secret-for-hmac"))
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_GROUP_ID = os.getenv("TELEGRAM_GROUP_ID")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
ADMIN_USER_IDS = [id.strip() for id in os.getenv("ADMIN_USER_IDS", os.getenv("ADMIN_TELEGRAM_IDS", "")).split(",") if id.strip()]
DATA_DIR = os.getenv("DATA_DIR", "/app/data/results")

# Initialize Telegram Bot Singleton
bot = Bot(token=TELEGRAM_BOT_TOKEN) if TELEGRAM_BOT_TOKEN else None

# Ensure data directory exists
from db import init_db, get_db

# Initialize Gemini Client
client = None
if GEMINI_API_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)

# Pydantic models
class UserAuth(BaseModel):
    id: str | int
    first_name: str
    last_name: Optional[str] = None
    username: Optional[str] = None
    photo_url: Optional[str] = None
    auth_date: int
    hash: str

class SaveResult(BaseModel):
    auth_data: UserAuth
    test_type: str
    answers: Dict[str, Any]
    scores: Dict[str, Any]
    lang: Optional[str] = "en"
    tone: Optional[str] = "professional"
    referred_by: Optional[str] = None
    is_public: Optional[bool] = False
    public_nickname: Optional[str] = None

class Badge(BaseModel):
    id: Optional[int] = None
    code: str
    name: str
    icon: Optional[str] = None
    description: Optional[str] = None
    is_active: bool = True
    is_secret: bool = False

class ProfileUpdate(BaseModel):
    auth_data: UserAuth
    is_public: bool
    public_nickname: Optional[str] = None

class UserBadgeAssign(BaseModel):
    user_id: str
    badge_id: int

from auth import router as auth_router

# FastAPI App
app = FastAPI(title="Aphantasia Test Backend")

app.include_router(auth_router, prefix="/api", tags=["auth"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await init_db()
    logger.info(f"Telegram Config: Bot={'SET' if bot else 'MISSING'}, Group={'SET' if TELEGRAM_GROUP_ID else 'MISSING'}")

@app.middleware("http")
async def add_coop_header(request: Request, call_next):
    response = await call_next(request)
    response.headers["Cross-Origin-Opener-Policy"] = "same-origin-allow-popups"
    return response

def verify_auth(auth_data: UserAuth) -> bool:
    """Verifies user authentication data or JWT token."""
    if not AUTH_SECRET:
        logger.warning("AUTH_SECRET not set, skipping auth verification")
        return True

    try:
        token = auth_data.hash
        payload = jwt.decode(token, AUTH_SECRET, algorithms=["HS256"])
        if str(payload.get("id")) != str(auth_data.id):
            raise HTTPException(status_code=401, detail="Token mismatch")
        return True
    except jwt.PyJWTError as e:
        logger.error(f"JWT Verification failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid Session Token")

def migrate_answers(flat_answers: Dict[str, Any]) -> Dict[str, Dict[str, Any]]:
    if not isinstance(flat_answers, dict):
        return {}
    if any(isinstance(v, dict) and "questionId" not in v for v in flat_answers.values()):
         return flat_answers

    new_answers = {}
    for q_id, ans in flat_answers.items():
        test_type = "full_aphantasia_profile"
        if q_id.startswith("demo_"):
            test_type = "express_demo"
        if test_type not in new_answers:
            new_answers[test_type] = {}
        new_answers[test_type][q_id] = ans
    return new_answers

def migrate_scores(flat_scores: Dict[str, Any]) -> Dict[str, Dict[str, Any]]:
    if not isinstance(flat_scores, dict):
        return {}
    if any(isinstance(v, dict) for v in flat_scores.values()):
        return flat_scores

    has_demo = any("demo" in k.lower() for k in flat_scores.keys())
    test_type = "express_demo" if has_demo else "full_aphantasia_profile"
    return {test_type: flat_scores}

async def stream_gemini_recommendations(test_results: Dict[str, Any], lang: str = "en", tone: str = "professional", model_name: str = 'gemini-3-flash'):
    if not client:
        yield "Gemini API key not configured."
        return

    try:
        lang_map = {"uk": "Ukrainian", "ru": "Russian", "en": "English"}
        target_lang = lang_map.get(lang, "English")

        system_instruction = (
            "You are a 'Cognitive Systems Architect' and Neurodiversity Specialist, "
            "expertly versed in the research of Adam Zeman (Aphantasia) and Brian Levine (SDAM).\n\n"
            f"### CRITICAL RULE:\nYou MUST provide your entire response in the {target_lang} language.\n\n"
            "### YOUR MISSION:\nPerform a deep-level deconstruction of the user's cognitive test results.\n\n"
            "### ANALYTICAL DIMENSIONS:\n1. Sensory Breadth. 2. Object vs. Spatial. 3. Memory Architecture. 4. Cognitive Resilience. 5. Belbin Roles.\n\n"
            "### REPORT STRUCTURE (Markdown):\n## 🧩 [Title]: The [Type Name] Architecture\n### 1. Executive Summary\n### 2. Deep Dive\n### 3. Memory Analysis\n### 4. Professional Superpowers\n### 5. The 'External Brain' Toolkit\n\n"
            "### TONE & STYLE:\n"
            f"- {'Professional/Clinical Tone: precise, analytical, architecture metaphors.' if tone == 'professional' else 'Friendly/Personal Tone: warm, encouraging, accessible.'}\n"
            "- Ensure double newlines between sections."
        )

        from google.genai import types
        import base64

        content_parts = []
        answers = test_results.get("answers", {})
        image_count = 0
        for q_id, ans in answers.items():
            val = ans.get("value")
            if isinstance(val, str) and val.startswith("data:image/") and image_count < 5:
                try:
                    header, encoded = val.split(",", 1)
                    mime_type = header.split(";")[0].split(":")[1]
                    img_data = base64.b64decode(encoded)
                    content_parts.append(f"\nUser drawing for question {q_id}:")
                    content_parts.append(types.Part.from_bytes(data=img_data, mime_type=mime_type))
                    image_count += 1
                except Exception as img_err:
                    logger.error(f"Failed to parse image for {q_id}: {img_err}")

        # Wrap user data in XML-like tags to prevent injection
        user_json = json.dumps(test_results, indent=2)
        content_parts.append(f"\n<user_data>\n{user_json}\n</user_data>")

        response = await client.aio.models.generate_content_stream(
            model=model_name,
            contents=content_parts,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction
            )
        )

        async for chunk in response:
            if chunk.text:
                yield chunk.text

    except Exception as e:
        logger.error(f"Gemini streaming error: {e}")
        yield f"\n\nError getting recommendations: {str(e)}"

async def send_telegram_notification(msg: str):
    if not bot or not TELEGRAM_GROUP_ID:
        return
    try:
        await bot.send_message(chat_id=TELEGRAM_GROUP_ID, text=msg, parse_mode='HTML')
        logger.info("Telegram notification sent successfully")
    except Exception as e:
        logger.error(f"Telegram notification error: {e}")

def get_result_file_path(user_id: str):
    return os.path.join(DATA_DIR, f"{user_id}.json")

@app.post("/api/save-result", responses={401: {"description": "Invalid Auth"}})
async def save_result(data: SaveResult, conn: asyncpg.Connection = Depends(get_db)):
    verify_auth(data.auth_data)
    user_id = str(data.auth_data.id)
    file_path = get_result_file_path(user_id)

    # 1. Database User Management & Referral Logic
    is_new_user = False
    user_exists = await conn.fetchrow("SELECT id, referred_by FROM aphantasia_users WHERE id = $1", user_id)
    
    if not user_exists:
        is_new_user = True
        await conn.execute('''
            INSERT INTO aphantasia_users (id, email, first_name, last_name, photo_url, is_public, public_nickname, referred_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ''', user_id, None, data.auth_data.first_name, data.auth_data.last_name, data.auth_data.photo_url, 
            data.is_public, data.public_nickname, data.referred_by)
        
        # Increment referral count for the referrer if this is a new conversion
        if data.referred_by:
            await conn.execute("UPDATE aphantasia_users SET referral_count = referral_count + 1 WHERE id = $1", data.referred_by)
            
            # Check for Node Expander badge
            ref_row = await conn.fetchrow("SELECT referral_count FROM aphantasia_users WHERE id = $1", data.referred_by)
            if ref_row and ref_row['referral_count'] >= 3:
                badge = await conn.fetchrow("SELECT id FROM badges WHERE code = 'node_expander'")
                if badge:
                    await conn.execute('''
                        INSERT INTO user_badges (user_id, badge_id) 
                        VALUES ($1, $2) ON CONFLICT DO NOTHING
                    ''', data.referred_by, badge['id'])
        
        # Award 'early_adopter' automatically for new users (or anyone saving)
        early_badge = await conn.fetchrow("SELECT id FROM badges WHERE code = 'early_adopter'")
        if early_badge:
            await conn.execute('''
                INSERT INTO user_badges (user_id, badge_id) 
                VALUES ($1, $2) ON CONFLICT DO NOTHING
            ''', user_id, early_badge['id'])
    else:
        # Update existing user settings
        await conn.execute('''
            UPDATE aphantasia_users SET
                photo_url = $2,
                is_public = $3,
                public_nickname = $4
            WHERE id = $1
        ''', user_id, data.auth_data.photo_url, data.is_public, data.public_nickname)

    # 2. File-based Result Storage
    existing_data = {}
    if os.path.exists(file_path):
        async with aiofiles.open(file_path, mode="r", encoding="utf-8") as f:
            content = await f.read()
            existing_data = json.loads(content)

    recs = existing_data.get("gemini_recommendations", {})
    if isinstance(recs, str):
        recs = {existing_data.get("test_type", "unknown"): recs} if recs.strip() else {}

    all_answers = migrate_answers(existing_data.get("answers", {}))
    all_answers[data.test_type] = data.answers

    all_scores = migrate_scores(existing_data.get("scores", {}))
    all_scores[data.test_type] = data.scores

    result_data = {
        "username": data.auth_data.username,
        "user_id": user_id,
        "first_name": data.auth_data.first_name,
        "last_name": data.auth_data.last_name,
        "photo_url": data.auth_data.photo_url,
        "auth_date": data.auth_data.auth_date,
        "test_type": data.test_type,
        "answers": all_answers,
        "scores": all_scores,
        "tone": data.tone,
        "gemini_recommendations": recs,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "is_public": data.is_public,
        "public_nickname": data.public_nickname
    }

    async with aiofiles.open(file_path, mode="w", encoding="utf-8") as f:
        await f.write(json.dumps(result_data, ensure_ascii=False, indent=2))

    return {"status": "success"}

@app.post("/api/me/profile")
async def update_profile_settings(data: ProfileUpdate, conn: asyncpg.Connection = Depends(get_db)):
    verify_auth(data.auth_data)
    user_id = str(data.auth_data.id)
    await conn.execute('''
        UPDATE aphantasia_users SET
            is_public = $2,
            public_nickname = $3
        WHERE id = $1
    ''', user_id, data.is_public, data.public_nickname)
    
    # Also update the metadata in the JSON file for consistency if it exists
    file_path = get_result_file_path(user_id)
    if os.path.exists(file_path):
        async with aiofiles.open(file_path, mode="r", encoding="utf-8") as f:
            res_data = json.loads(await f.read())
        res_data["is_public"] = data.is_public
        res_data["public_nickname"] = data.public_nickname
        async with aiofiles.open(file_path, mode="w", encoding="utf-8") as f:
            await f.write(json.dumps(res_data, ensure_ascii=False, indent=2))
            
    return {"status": "success"}

@app.get("/api/public-results/{user_id}")
async def get_public_result_data(user_id: str, conn: asyncpg.Connection = Depends(get_db)):
    """Explicit JSON endpoint for public results using file-based storage confirmed by DB."""
    # 1. Check user public status in DB
    user = await conn.fetchrow("SELECT id, is_public, public_nickname FROM aphantasia_users WHERE id = $1", user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not user['is_public']:
        raise HTTPException(status_code=403, detail="Profile is private")
    
    # 2. Read result file
    file_path = get_result_file_path(user_id)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Result file not found")

    async with aiofiles.open(file_path, mode="r", encoding="utf-8") as f:
        data = json.loads(await f.read())
        
    return {
        "user_id": user_id,
        "public_nickname": user['public_nickname'],
        "test_type": data.get("test_type", "full_aphantasia_profile"),
        "scores": data.get("scores", {}),
        "answers": data.get("answers", {}),
        "gemini_recommendations": data.get("gemini_recommendations", {}),
        "badges": await get_user_badges(user_id, conn)
    }

@app.get("/results/{user_id}")
async def get_public_result_page(request: Request, user_id: str, conn: asyncpg.Connection = Depends(get_db)):
    """Serve public profile data OR HTML with OG metadata for social crawlers."""
    user = await conn.fetchrow("SELECT id, is_public, public_nickname FROM aphantasia_users WHERE id = $1", user_id)
    if not user or not user['is_public']:
        raise HTTPException(status_code=403, detail="Profile is private.")

    file_path = get_result_file_path(user_id)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404)

    async with aiofiles.open(file_path, mode="r", encoding="utf-8") as f:
        data = json.loads(await f.read())

    # Determine profile title for OG tags
    test_type = data.get("test_type", "Cognitive")
    nickname = user['public_nickname'] or "Anonymous"
    
    accept = request.headers.get("accept", "").lower()
    ua = request.headers.get("User-Agent", "").lower()
    if "text/html" in accept or any(bot in ua for bot in ["linkedin", "reddit", "facebook", "twitter", "whatsapp", "slack", "discord", "bot"]):
        # serve index.html with injected tags
        index_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "index.html")
        if os.path.exists(index_path):
            async with aiofiles.open(index_path, mode="r", encoding="utf-8") as f:
                html = await f.read()
            
            test_names = {
                "full_aphantasia_profile": "Full Cognitive Profile",
                "express_aphantasia_diagnostics": "Express Diagnostics"
            }
            test_type_raw = data.get("test_type", "unknown")
            test_name = test_names.get(test_type_raw, test_type_raw.replace("_", " ").title())
            
            og_title = f"I discovered my {test_name}. What's yours?"
            og_desc = f"I just mapped my sensory architecture. My profile: {test_name}. Explore your own cognitive spectrum and see how you perceive the world!"
            
            # Dynamic Radar Chart Image via QuickChart
            scores = data.get("scores", {})
            labels = list(scores.keys())
            values = list(scores.values())
            
            chart_config = {
                "type": "radar",
                "data": {
                    "labels": [l.upper() for l in labels],
                    "datasets": [{
                        "data": values,
                        "backgroundColor": "rgba(43, 30, 82, 0.4)",
                        "borderColor": "#2B1E52",
                        "borderWidth": 2,
                        "pointRadius": 0
                    }]
                },
                "options": {
                    "legend": {"display": False},
                    "scale": {
                        "ticks": {"min": 0, "max": 5, "display": False},
                        "angleLines": {"color": "rgba(0,0,0,0.1)"},
                        "gridLines": {"color": "rgba(0,0,0,0.1)"},
                        "pointLabels": {"fontSize": 12, "fontStyle": "bold"}
                    }
                }
            }
            import urllib.parse
            config_json = json.dumps(chart_config)
            og_image = f"https://quickchart.io/chart?c={urllib.parse.quote(config_json)}&width=800&height=800"
            
            # Injection
            tags = f'''
                <meta property="og:title" content="{og_title}" />
                <meta property="og:description" content="{og_desc}" />
                <meta property="og:image" content="{og_image}" />
                <meta property="og:url" content="{request.url}" />
                <meta property="og:type" content="article" />
                <meta property="og:site_name" content="Cognitive Profile" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="{og_title}" />
                <meta name="twitter:description" content="{og_desc}" />
                <meta name="twitter:image" content="{og_image}" />
            '''
            html = html.replace("<head>", f"<head>{tags}")
            return HTMLResponse(content=html)

    return {
        "user_id": user_id,
        "is_public": True,
        "public_nickname": nickname,
        "test_type": test_type,
        "scores": data.get("scores"),
        "gemini_recommendations": data.get("gemini_recommendations"),
        "created_at": data.get("created_at"),
        "badges": await get_user_badges(user_id, conn)
    }

async def post_process_analysis(full_text: str, data: SaveResult, file_path: str):
    """Background task to handle file saving and notifications after streaming completes."""
    try:
        if os.path.exists(file_path):
            async with aiofiles.open(file_path, mode="r", encoding="utf-8") as f:
                content = await f.read()
                existing_data = json.loads(content)

            recs = existing_data.get("gemini_recommendations", {})
            if isinstance(recs, str):
                recs = {existing_data.get("test_type", "unknown"): recs} if recs.strip() else {}

            recs[data.test_type] = full_text
            existing_data["gemini_recommendations"] = recs

            async with aiofiles.open(file_path, mode="w", encoding="utf-8") as f:
                await f.write(json.dumps(existing_data, ensure_ascii=False, indent=2))

        # Telegram notification
        user_name = f"{data.auth_data.first_name} {data.auth_data.last_name or ''}".strip()
        scores_str = json.dumps(data.scores, indent=1)
        truncated_recs = full_text[:2500] + ("..." if len(full_text) > 2500 else "")
        recs_safe = truncated_recs.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        recs_html = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', recs_safe)
        recs_html = re.sub(r'^#+ (.*)$', r'<b>\1</b>', recs_html, flags=re.MULTILINE)
        msg = (
            f"🔔 <b>New Test Result!</b>\n\n"
            f"<b>User:</b> {user_name} (@{data.auth_data.username or 'N/A'})\n"
            f"<b>Test:</b> {data.test_type}\n"
            f"<b>Score:</b>\n<code>{scores_str}</code>\n\n"
            f"<b>AI Analysis:</b>\n{recs_html}"
        )
        await send_telegram_notification(msg)
    except Exception as e:
        logger.error(f"Error in background post-processing: {e}")

@app.post("/api/analyze-result")
async def analyze_result(data: SaveResult, background_tasks: BackgroundTasks):
    verify_auth(data.auth_data)
    file_path = get_result_file_path(str(data.auth_data.id))

    # Model Selection: gemini-2.0-flash by default, gemini-3.1-pro for full_aphantasia_profile
    # Wait, the prompt said gemini-3.1-pro but gemini-2.0-flash is current. 
    # The user said gemini-3-flash and gemini-3.1-pro. I'll stick to their specific request if they insisted.
    # Ah, "Adjust the default Gemini model to gemini-3-flash ... conditional use of gemini-3.1-pro".
    # I'll use exactly what requested.
    model_to_use = 'gemini-3.1-pro' if data.test_type == 'full_aphantasia_profile' else 'gemini-3-flash'

    async def event_generator():
        full_text = []
        async for chunk in stream_gemini_recommendations(
            {"answers": data.answers, "scores": data.scores},
            lang=data.lang or "en",
            tone=data.tone or "professional",
            model_name=model_to_use
        ):
            full_text.append(chunk)
            yield chunk
        
        # Schedule background tasks
        background_tasks.add_task(post_process_analysis, "".join(full_text), data, file_path)

    return StreamingResponse(event_generator(), media_type="text/plain")

async def get_user_badges(user_id: str, conn: asyncpg.Connection) -> List[Dict[str, Any]]:
    rows = await conn.fetch('''
        SELECT b.* FROM badges b
        JOIN user_badges ub ON b.id = ub.badge_id
        WHERE ub.user_id = $1 AND b.is_active = TRUE
    ''', user_id)
    return [dict(row) for row in rows]

@app.post("/api/me/result")
async def get_my_result(auth_data: UserAuth, conn: asyncpg.Connection = Depends(get_db)):
    verify_auth(auth_data)
    user_id = str(auth_data.id)
    file_path = get_result_file_path(user_id)
    if not os.path.exists(file_path):
        return None

    async with aiofiles.open(file_path, mode="r", encoding="utf-8") as f:
        content = await f.read()
        data = json.loads(content)

    # In-place migration if needed
    ans = data.get("answers", {})
    if ans and any(not isinstance(v, dict) for v in ans.values()):
        data["answers"] = migrate_answers(ans)
    
    scores = data.get("scores", {})
    if scores and (not isinstance(scores, dict) or not any(isinstance(v, dict) for v in scores.values())):
        data["scores"] = migrate_scores(scores)
        
    recs = data.get("gemini_recommendations", {})
    if isinstance(recs, str):
        data["gemini_recommendations"] = {data.get("test_type", "unknown"): recs} if recs.strip() else {}

    data["badges"] = await get_user_badges(user_id, conn)
    return data

@app.get("/api/results")
async def get_results(user_id: str, hash: str, q: Optional[str] = None, target_user_id: Optional[str] = None, conn: asyncpg.Connection = Depends(get_db)):
    if user_id not in ADMIN_USER_IDS:
        raise HTTPException(status_code=403, detail="Not authorized")

    results = []
    if target_user_id:
        file_path = get_result_file_path(target_user_id)
        if os.path.exists(file_path):
            async with aiofiles.open(file_path, mode="r", encoding="utf-8") as f:
                res = json.loads(await f.read())
                res["badges"] = await get_user_badges(target_user_id, conn)
                results.append(res)
        return results

    if os.path.exists(DATA_DIR):
        for filename in os.listdir(DATA_DIR):
            if not filename.endswith(".json") or filename == "subscribers.json":
                continue
            try:
                async with aiofiles.open(os.path.join(DATA_DIR, filename), mode="r", encoding="utf-8") as f:
                    content = await f.read()
                    res = json.loads(content)
                    if not isinstance(res, dict): continue
                    
                    if q:
                        q_low = q.lower()
                        match = any(q_low in str(res.get(k, "")).lower() for k in ["first_name", "last_name", "username", "user_id"])
                        if not match: continue

                    res["badges"] = await get_user_badges(str(res.get("user_id", "")), conn)
                    results.append(res)
            except Exception: pass

    return sorted(results, key=lambda x: x.get("created_at", ""), reverse=True)

# Newsletter Subscriptions
@app.post("/api/subscribe")
async def subscribe_newsletter(request: Request, background_tasks: BackgroundTasks):
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    email = str(body.get("email", "")).strip().lower()
    source = str(body.get("source", "website"))

    if not email or not re.match(r'^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$', email):
        raise HTTPException(status_code=422, detail="Invalid email")

    subscribers_path = os.path.join(DATA_DIR, "subscribers.json")
    subscribers = []
    if os.path.exists(subscribers_path):
        async with aiofiles.open(subscribers_path, mode="r", encoding="utf-8") as f:
            subscribers = json.loads(await f.read())

    if any(s.get("email") == email for s in subscribers):
        return {"status": "already_subscribed"}

    subscribers.append({"email": email, "source": source, "subscribed_at": datetime.now(timezone.utc).isoformat()})
    async with aiofiles.open(subscribers_path, mode="w", encoding="utf-8") as f:
        await f.write(json.dumps(subscribers, ensure_ascii=False, indent=2))

    background_tasks.add_task(send_telegram_notification, f"📧 <b>New Subscriber</b>\n<b>Email:</b> {email}\n<b>Source:</b> {source}")
    return {"status": "subscribed"}

@app.get("/api/subscribers")
async def get_subscribers(user_id: str, hash: str):
    if user_id not in ADMIN_USER_IDS:
        raise HTTPException(status_code=403, detail="Not authorized")
    subscribers_path = os.path.join(DATA_DIR, "subscribers.json")
    if not os.path.exists(subscribers_path): return []
    async with aiofiles.open(subscribers_path, mode="r", encoding="utf-8") as f:
        return json.loads(await f.read())

# --- Feature Flags Endpoints ---

class FeatureFlagToggle(BaseModel):
    user_id: str
    hash: str
    is_enabled: bool

@app.get("/api/feature-flags")
async def get_feature_flags(conn: asyncpg.Connection = Depends(get_db)):
    rows = await conn.fetch("SELECT code, name, description, is_enabled FROM feature_flags ORDER BY code ASC")
    return [dict(r) for r in rows]

@app.post("/api/feature-flags/{code}")
async def toggle_feature_flag(code: str, data: FeatureFlagToggle, conn: asyncpg.Connection = Depends(get_db)):
    if data.user_id not in ADMIN_USER_IDS:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await conn.execute('''
        UPDATE feature_flags SET
            is_enabled = $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE code = $1
    ''', code, data.is_enabled)
    return {"status": "success"}

# --- Badge Endpoints (Async) ---

@app.get("/api/badges")
async def get_all_badges(include_inactive: bool = False, conn: asyncpg.Connection = Depends(get_db)):
    query = "SELECT * FROM badges ORDER BY id ASC" if include_inactive else "SELECT * FROM badges WHERE is_active = TRUE ORDER BY id ASC"
    rows = await conn.fetch(query)
    return [dict(r) for r in rows]

@app.post("/api/badges")
async def create_badge(badge: Badge, user_id: str, hash: str, conn: asyncpg.Connection = Depends(get_db)):
    if user_id not in ADMIN_USER_IDS: raise HTTPException(status_code=403)
    try:
        new_id = await conn.fetchval('''
            INSERT INTO badges (code, name, icon, description, is_active, is_secret)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
        ''', badge.code, badge.name, badge.icon, badge.description, badge.is_active, badge.is_secret)
        return {"status": "success", "id": new_id}
    except Exception as e: raise HTTPException(status_code=400, detail=str(e))

@app.put("/api/badges/{badge_id}")
async def update_badge(badge_id: int, badge: Badge, user_id: str, hash: str, conn: asyncpg.Connection = Depends(get_db)):
    if user_id not in ADMIN_USER_IDS: raise HTTPException(status_code=403)
    await conn.execute('''
        UPDATE badges SET code=$1, name=$2, icon=$3, description=$4, is_active=$5, is_secret=$6 WHERE id=$7
    ''', badge.code, badge.name, badge.icon, badge.description, badge.is_active, badge.is_secret, badge_id)
    return {"status": "success"}

@app.delete("/api/badges/{badge_id}")
async def delete_badge(badge_id: int, user_id: str, hash: str, conn: asyncpg.Connection = Depends(get_db)):
    if user_id not in ADMIN_USER_IDS: raise HTTPException(status_code=403)
    await conn.execute("DELETE FROM badges WHERE id = $1", badge_id)
    return {"status": "success"}

@app.get("/api/users/{target_user_id}/badges")
async def get_user_badges_endpoint(target_user_id: str, conn: asyncpg.Connection = Depends(get_db)):
    return await get_user_badges(target_user_id, conn)

@app.post("/api/user-badges")
async def assign_badge_to_user(req: UserBadgeAssign, user_id: str, hash: str, conn: asyncpg.Connection = Depends(get_db)):
    if user_id not in ADMIN_USER_IDS: raise HTTPException(status_code=403)
    await conn.execute("INSERT INTO user_badges (user_id, badge_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", req.user_id, req.badge_id)
    return {"status": "success"}

@app.delete("/api/user-badges/{target_user_id}/{badge_id}")
async def remove_badge_from_user(target_user_id: str, badge_id: int, user_id: str, hash: str, conn: asyncpg.Connection = Depends(get_db)):
    if user_id not in ADMIN_USER_IDS: raise HTTPException(status_code=403)
    await conn.execute("DELETE FROM user_badges WHERE user_id = $1 AND badge_id = $2", target_user_id, badge_id)
    return {"status": "success"}

if __name__ == "__main__":
    import uvicorn
    is_debug = os.getenv("DEBUG", "false").lower() == "true"
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=8000, reload=is_debug)
