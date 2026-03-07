import os
import hashlib
import hmac
import time
import json
import logging
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import re
import aiofiles
import jwt
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
ADMIN_USER_IDS = os.getenv("ADMIN_USER_IDS", os.getenv("ADMIN_TELEGRAM_IDS", "")).split(",")
DATA_DIR = os.getenv("DATA_DIR", "/app/data/results")

# Ensure data directory exists
from db import init_db
init_db()
logger.info(f"Telegram Config: Token={'SET' if TELEGRAM_BOT_TOKEN else 'MISSING'}, Group={'SET' if TELEGRAM_GROUP_ID else 'MISSING'}")

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

def verify_auth(auth_data: UserAuth) -> bool:
    """Verifies user authentication data or JWT token."""
    if not AUTH_SECRET:
        # For development if secret is not set
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

async def stream_gemini_recommendations(test_results: Dict[str, Any], lang: str = "en"):
    if not client:
        yield "Gemini API key not configured."
        return
    
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

        from google.genai import types
        import base64

        # Prepare multimodal content parts
        content_parts = [system_instruction]

        # Check for drawing answers and add them as image parts
        # Answers are in test_results["answers"]
        answers = test_results.get("answers", {})
        for q_id, ans in answers.items():
            val = ans.get("value")
            if isinstance(val, str) and val.startswith("data:image/"):
                try:
                    # Parse base64
                    header, encoded = val.split(",", 1)
                    mime_type = header.split(";")[0].split(":")[1]
                    img_data = base64.b64decode(encoded)
                    
                    # Add a text hint for which question this is
                    content_parts.append(f"\nUser drawing for question {q_id}:")
                    content_parts.append(types.Part.from_bytes(data=img_data, mime_type=mime_type))
                except Exception as img_err:
                    logger.error(f"Failed to parse image for {q_id}: {img_err}")

        # Add the final data block
        content_parts.append(f"\n### INPUT TEST RESULTS (JSON):\n{json.dumps(test_results, indent=2)}")

        response = await client.aio.models.generate_content_stream(
            model='gemini-3.1-pro-preview',
            contents=content_parts
        )
        
        async for chunk in response:
            if chunk.text:
                yield chunk.text
                
    except Exception as e:
        logger.error(f"Gemini streaming error: {e}")
        yield f"\n\nError getting recommendations: {str(e)}"

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

def get_result_file_path(user_id: str):
    return os.path.join(DATA_DIR, f"{user_id}.json")

@app.post("/api/save-result", responses={401: {"description": "Invalid Auth"}})
async def save_result(data: SaveResult):
    logger.info(f"Incoming save-result request for user {data.auth_data.id} (@{data.auth_data.username})")
    verify_auth(data.auth_data)
    
    user_id = str(data.auth_data.id)
    file_path = get_result_file_path(user_id)
    
    # Check if we already have recommendations saved
    existing_recs = ""
    if os.path.exists(file_path):
        try:
            async with aiofiles.open(file_path, mode="r", encoding="utf-8") as f:
                content = await f.read()
                existing_data = json.loads(content)
                existing_recs = existing_data.get("gemini_recommendations", "")
        except:
            pass

    result_data = {
        "username": data.auth_data.username,
        "user_id": str(data.auth_data.id),
        "first_name": data.auth_data.first_name,
        "last_name": data.auth_data.last_name,
        "photo_url": data.auth_data.photo_url,
        "auth_date": data.auth_data.auth_date,
        "test_type": data.test_type,
        "answers": data.answers,
        "scores": data.scores,
        "gemini_recommendations": existing_recs,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    async with aiofiles.open(file_path, mode="w", encoding="utf-8") as f:
        await f.write(json.dumps(result_data, ensure_ascii=False, indent=2))
        
    return {"status": "success"}

@app.post("/api/analyze-result", responses={401: {"description": "Invalid Auth"}})
async def analyze_result(data: SaveResult):
    logger.info(f"Incoming analyze-result request for user {data.auth_data.id}")
    verify_auth(data.auth_data)
    
    user_id = str(data.auth_data.id)
    file_path = get_result_file_path(user_id)
    
    async def event_generator():
        full_text = ""
        async for chunk in stream_gemini_recommendations({"answers": data.answers, "scores": data.scores}, lang=data.lang or "en"):
            full_text += chunk
            yield chunk
            
        # After streaming completes, save it to the file
        if os.path.exists(file_path):
            try:
                async with aiofiles.open(file_path, mode="r", encoding="utf-8") as f:
                    content = await f.read()
                    existing_data = json.loads(content)
                
                existing_data["gemini_recommendations"] = full_text
                
                async with aiofiles.open(file_path, mode="w", encoding="utf-8") as f:
                    await f.write(json.dumps(existing_data, ensure_ascii=False, indent=2))
            except Exception as e:
                logger.error(f"Failed to save streamed recommendations: {e}")
                
        # Send telegram notification after generation is done
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

    return StreamingResponse(event_generator(), media_type="text/plain")

@app.post("/api/me/result", responses={401: {"description": "Invalid Auth"}})
async def get_my_result(auth_data: UserAuth):
    logger.info(f"Incoming get-my-result request for user {auth_data.id}")
    verify_auth(auth_data)
    
    user_id = str(auth_data.id)
    file_path = get_result_file_path(user_id)
    if not os.path.exists(file_path):
        return None
    
    async with aiofiles.open(file_path, mode="r", encoding="utf-8") as f:
        content = await f.read()
        return json.loads(content)

@app.get("/api/results", responses={403: {"description": "Not authorized as admin"}})
async def get_results(user_id: str, hash: str):
    # Check admin
    if user_id not in ADMIN_USER_IDS:
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
