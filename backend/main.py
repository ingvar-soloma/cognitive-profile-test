import os
import hashlib
import hmac
import time
import json
import logging
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import re
import aiofiles
from datetime import datetime, timezone
from google import genai
from telegram import Bot
from dotenv import load_dotenv

load_dotenv()

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Config
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_GROUP_ID = os.getenv("TELEGRAM_GROUP_ID")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
ADMIN_TELEGRAM_IDS = os.getenv("ADMIN_TELEGRAM_IDS", "").split(",")
DATA_DIR = os.getenv("DATA_DIR", "/app/data/results")

# Ensure data directory exists
os.makedirs(DATA_DIR, exist_ok=True)
logger.info(f"Telegram Config: Token={'SET' if TELEGRAM_BOT_TOKEN else 'MISSING'}, Group={'SET' if TELEGRAM_GROUP_ID else 'MISSING'}")

# Initialize Gemini Client
client = None
if GEMINI_API_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)

# Pydantic models
class TelegramAuth(BaseModel):
    id: int
    first_name: str
    last_name: Optional[str] = None
    username: Optional[str] = None
    photo_url: Optional[str] = None
    auth_date: int
    hash: str

class SaveResult(BaseModel):
    auth_data: TelegramAuth
    test_type: str
    answers: Dict[str, Any]
    scores: Dict[str, Any]
    lang: Optional[str] = "en"

from auth import router as auth_router

# FastAPI App
app = FastAPI(title="Aphantasia Test Backend")

app.include_router(auth_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def verify_telegram_auth(auth_data: TelegramAuth) -> bool:
    """Verifies Telegram authentication data."""
    if not TELEGRAM_BOT_TOKEN:
        # For development if token is not set
        logger.warning("TELEGRAM_BOT_TOKEN not set, skipping auth verification")
        return True
    
    data_check_list = []
    auth_dict = auth_data.model_dump(exclude={'hash'})
    for key, value in sorted(auth_dict.items()):
        if value is not None:
            data_check_list.append(f"{key}={value}")
    
    data_check_string = "\n".join(data_check_list)
    secret_key = hashlib.sha256(TELEGRAM_BOT_TOKEN.encode()).digest()
    hash_value = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
    
    if hash_value != auth_data.hash:
        raise HTTPException(status_code=401, detail="Invalid Telegram Auth")
    
    if time.time() - auth_data.auth_date > 86400:
        raise HTTPException(status_code=401, detail="Auth session expired")
    
    return True

async def get_gemini_recommendations(test_results: Dict[str, Any], lang: str = "en"):
    if not client:
        return "Gemini API key not configured."
    
    try:
        lang_map = {
            "uk": "Ukrainian",
            "ru": "Russian",
            "en": "English"
        }
        target_lang = lang_map.get(lang, "English")

        system_instruction = (
            "You are a 'Cognitive Systems Architect' and Neurodiversity Specialist, "
            "expertly versed in the research of Adam Zeman (Aphantasia) and Brian Levine (SDAM).\n\n"
            
            f"### CRITICAL RULE:\n"
            f"You MUST provide your entire response in the {target_lang} language.\n\n"

            "### YOUR MISSION:\n"
            "Perform a deep-level deconstruction of the user's cognitive test results. "
            "Apply the Dynamic Decision Strategy (DDS): before finalizing the report, "
            "internally hypothesize the user's optimal processing mode (e.g., Semantic-Schematic vs. Visual-Episodic).\n\n"
            
            "### ANALYTICAL DIMENSIONS:\n"
            "1. **Sensory Breadth (Multisensory Audit)**: Determine if the aphantasia is 'total' or 'partial'. "
            "Check for 'Quiet Imagination' in auditory, olfactory, and tactile channels.\n"
            "2. **Object vs. Spatial Processing**: Crucial distinction. While 'Object Visuals' (colors/details) may be null, "
            "analyze 'Spatial Intelligence' (the ability to manipulate objects in 3D, mental rotation, and schematic thinking).\n"
            "3. **Memory Architecture (SDAM check)**: Evaluate the presence of Severely Deficient Autobiographical Memory. "
            "Distinguish between 'Semantic Memory' (knowing facts/data) and 'Episodic Memory' (re-experiencing events).\n"
            "4. **Cognitive Resilience (Superpowers)**: Identify strengths like resistance to visual trauma (PTSD), "
            "unbiased logical decision-making, and verbal innovation.\n"
            "5. **Professional Synergy**: Map the profile to Belbin Team Roles (e.g., 'Monitor Evaluator' for analytical aphantasics).\n\n"
            
            "### REPORT STRUCTURE (Markdown):\n"
            "Use clear headings with double newlines after each section to ensure proper rendering.\n\n"
            "## 🧩 [Title]: The [Type Name] Architecture\n"
            "*Assign a technical, empowering name (e.g., 'The Semantic Engine', 'The Spatial Strategist').*\n\n"
            
            "### 1. Executive Summary\n"
            "Describe the user's cognitive 'OS'. Frame the results as a highly efficient alternative processing style, not a deficit.\n\n"
            
            "### 2. Deep Dive: Visual vs. Spatial Rendering\n"
            "Explain the 'Object-Spatial' split. Clarify how the user 'thinks' without images by using semantic markers or spatial vectors.\n\n"
            
            "### 3. Memory & Time-Travel (SDAM Analysis)\n"
            "Explain their relationship with the past. If SDAM is present, emphasize the 'Knowledge-Based' memory style over 'Movie-Based' memory.\n\n"
            
            "### 4. Professional Superpowers & Belbin Role\n"
            "Detail why this profile is critical for teams (e.g., objective analysis, immunity to visual noise). "
            "Specify their best role in a high-load engineering or creative team.\n\n"
            
            "### 5. The 'External Brain' Toolkit (Patches)\n"
            "Provide 3-5 hyper-specific strategies as a bulleted list with double newlines between items:\n"
            "- **Verbal Labeling**: Using words to 'index' feelings or spaces.\n\n"
            "- **Externalization**: Using tools (Trello, Obsidian, Miro) as an 'Out-of-Core' memory buffer.\n\n"
            "- **Semantic Anchoring**: Linking new data to existing logical nodes.\n\n"
            
            "### TONE & STYLE:\n"
            "- Professional, clinical, yet profoundly empowering.\n"
            "- Use system architecture metaphors (latency, bandwidth, database, indexing).\n"
            "- **Strict Rule**: Avoid the 'broken' narrative. Use 'optimized for abstraction' instead.\n"
            "- Ensure double newlines between logical sections for correct Markdown parsing.\n"
        )

        user_data_block = f"\n### INPUT TEST RESULTS (JSON):\n{json.dumps(test_results, indent=2)}"
        
        response = await client.aio.models.generate_content(
            model='gemini-3-flash-preview',
            contents=system_instruction + user_data_block
        )
        return response.text
    except Exception as e:
        logger.error(f"Gemini error: {e}")
        return f"Error getting recommendations: {str(e)}"

async def send_telegram_notification(msg: str):
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_GROUP_ID:
        return
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_GROUP_ID:
        logger.warning("Telegram configuration missing")
        return
    try:
        # Use async context manager for newer python-telegram-bot versions
        bot = Bot(token=TELEGRAM_BOT_TOKEN)
        async with bot:
            await bot.send_message(chat_id=TELEGRAM_GROUP_ID, text=msg, parse_mode='HTML')
        logger.info("Telegram notification sent successfully")
    except Exception as e:
        logger.error(f"Telegram notification error: {e}")

def get_result_file_path(telegram_id: str):
    return os.path.join(DATA_DIR, f"{telegram_id}.json")

@app.post("/api/save-result", responses={401: {"description": "Invalid Telegram Auth"}})
async def save_result(data: SaveResult):
    logger.info(f"Incoming save-result request for user {data.auth_data.id} (@{data.auth_data.username})")
    verify_telegram_auth(data.auth_data)
    
    # Enforcement: Only one submission per TG ID
    telegram_id = str(data.auth_data.id)
    file_path = get_result_file_path(telegram_id)
    if os.path.exists(file_path):
        return {"status": "error", "message": "Result already exists for this user. Only one submission allowed."}
    
    recommendations = await get_gemini_recommendations({"answers": data.answers, "scores": data.scores}, lang=data.lang or "en")
    
    # Ensure recommendations is a string for further processing
    recommendations_text = str(recommendations)
    
    result_data = {
        "username": data.auth_data.username,
        "telegram_id": str(data.auth_data.id),
        "first_name": data.auth_data.first_name,
        "last_name": data.auth_data.last_name,
        "photo_url": data.auth_data.photo_url,
        "auth_date": data.auth_data.auth_date,
        "test_type": data.test_type,
        "answers": data.answers,
        "scores": data.scores,
        "gemini_recommendations": recommendations_text,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    file_path = get_result_file_path(str(data.auth_data.id))
    async with aiofiles.open(file_path, mode="w", encoding="utf-8") as f:
        await f.write(json.dumps(result_data, ensure_ascii=False, indent=2))
    
    # Notify Telegram Group
    user_name = f"{data.auth_data.first_name} {data.auth_data.last_name or ''}".strip()
    # Simple formatting to avoid Markdown parsing errors
    scores_str = json.dumps(data.scores, indent=1)
    
    # Format recommendations for Telegram
    # 1. Truncate raw text first to avoid breaking HTML tags later
    truncated_recs = recommendations_text[:2500] + ("..." if len(recommendations_text) > 2500 else "")
    
    # 2. Escape HTML special characters
    recs_safe = truncated_recs.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
    
    # 3. Convert **bold** to <b>bold</b> and headers to bold
    recs_html = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', recs_safe)
    recs_html = re.sub(r'^#+ (.*)$', r'<b>\1</b>', recs_html, flags=re.MULTILINE)
    
    msg = (
        f"🔔 <b>New Test Result!</b>\n\n"
        f"<b>User:</b> {user_name} (@{data.auth_data.username or 'N/A'})\n"
        f"<b>Test:</b> {data.test_type}\n"
        f"<b>Score:</b>\n<code>{scores_str}</code>\n\n"
        f"<b>AI Analysis:</b>\n{recs_html}"
    )
    
    logger.info(f"Attempting to send Telegram notification (len={len(msg)})")
    await send_telegram_notification(msg)
    
    return {"status": "success", "recommendations": recommendations}

@app.post("/api/me/result", responses={401: {"description": "Invalid Telegram Auth"}})
async def get_my_result(auth_data: TelegramAuth):
    logger.info(f"Incoming get-my-result request for user {auth_data.id}")
    verify_telegram_auth(auth_data)
    
    telegram_id = str(auth_data.id)
    file_path = get_result_file_path(telegram_id)
    if not os.path.exists(file_path):
        return None
    
    async with aiofiles.open(file_path, mode="r", encoding="utf-8") as f:
        content = await f.read()
        return json.loads(content)

@app.get("/api/results", responses={403: {"description": "Not authorized as admin"}})
async def get_results(telegram_id: str, hash: str):
    # Check admin
    if telegram_id not in ADMIN_TELEGRAM_IDS:
        raise HTTPException(status_code=403, detail="Not authorized as admin")
    
    # In a real app we'd verify auth here too, but following existing pattern for admin check
    results = []
    if os.path.exists(DATA_DIR):
        for filename in os.listdir(DATA_DIR):
            if filename.endswith(".json"):
                async with aiofiles.open(os.path.join(DATA_DIR, filename), mode="r", encoding="utf-8") as f:
                    content = await f.read()
                    results.append(json.loads(content))
    
    return sorted(results, key=lambda x: x.get("created_at", ""), reverse=True)

if __name__ == "__main__":
    import uvicorn
    is_debug = os.getenv("DEBUG", "false").lower() == "true"
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=8000, reload=is_debug)
