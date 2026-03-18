import os
import logging
import asyncio
import asyncpg
from typing import AsyncGenerator

logger = logging.getLogger(__name__)

async def get_db_url() -> str:
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        db_user = os.getenv("DB_USER", "user")
        db_password = os.getenv("DB_PASSWORD", "password")
        db_name = os.getenv("DB_NAME", "postgres")
        db_host = os.getenv("DB_HOST", "host.docker.internal")
        db_port = os.getenv("DB_PORT", os.getenv("LOCAL_DB_PORT", "5432"))
        database_url = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    return database_url

async def get_db() -> AsyncGenerator[asyncpg.Connection, None]:
    database_url = await get_db_url()
    conn = await asyncpg.connect(database_url)
    try:
        yield conn
    finally:
        await conn.close()

async def init_db():
    try:
        database_url = await get_db_url()
        conn = await asyncpg.connect(database_url)
        
        # Users Table
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS aphantasia_users (
                id VARCHAR(255) PRIMARY KEY,
                email VARCHAR(255),
                first_name VARCHAR(255),
                last_name VARCHAR(255),
                photo_url TEXT,
                is_guest BOOLEAN DEFAULT FALSE,
                is_public BOOLEAN DEFAULT FALSE,
                public_nickname VARCHAR(255),
                referral_count INTEGER DEFAULT 0,
                referred_by VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP
            )
        ''')
        
        # Migrations
        await conn.execute("ALTER TABLE aphantasia_users ADD COLUMN IF NOT EXISTS is_guest BOOLEAN DEFAULT FALSE")
        await conn.execute("ALTER TABLE aphantasia_users ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE")
        await conn.execute("ALTER TABLE aphantasia_users ADD COLUMN IF NOT EXISTS public_nickname VARCHAR(255)")
        await conn.execute("ALTER TABLE aphantasia_users ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0")
        await conn.execute("ALTER TABLE aphantasia_users ADD COLUMN IF NOT EXISTS referred_by VARCHAR(255)")

        # Badges Table
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS badges (
                id SERIAL PRIMARY KEY,
                code VARCHAR(255) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                icon VARCHAR(255),
                description TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                is_secret BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # User Badges Table
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS user_badges (
                user_id VARCHAR(255) REFERENCES aphantasia_users(id) ON DELETE CASCADE,
                badge_id INTEGER REFERENCES badges(id) ON DELETE CASCADE,
                assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id, badge_id)
            )
        ''')

        # Feature Flags Table
        await conn.execute('''
            CREATE TABLE IF NOT EXISTS feature_flags (
                code VARCHAR(255) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                is_enabled BOOLEAN DEFAULT FALSE,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        logger.info("Async PostgreSQL Database initialized correctly")
        await seed_badges(conn)
        await seed_feature_flags(conn)
        await conn.close()
    except Exception as e:
        logger.error(f"Failed to initialize PostgreSQL database: {e}")

async def seed_badges(conn: asyncpg.Connection):
    badges = [
        ("founding_member", "Founding Member", "✨", "Recognized as an early contributor who shaped the project's foundation during the initial beta phase.", True, False),
        ("3_sigma_outlier", "3-Sigma Outlier", "📊", "For exceptional cognitive architecture significantly deviating from the mean.", True, False),
        ("ux_pioneer", "UX Pioneer", "🎨", "For helping fix critical mobile UI issues.", True, False),
        ("early_adopter", "Early Adopter", "🚀", "Joined during the initial launch phase of the project.", True, False),
        ("bug_hunter", "Bug Hunter", "🐛", "For reporting critical bugs that were fixed.", True, False),
        ("neurodiversity_advocate", "Neurodiversity Advocate", "🧠", "For contributing to the understanding of cognitive diversity.", True, False),
        ("node_expander", "Node Expander", "📍", "Successfully referred 3 new participants to the cognitive assessment.", True, False)
    ]
    
    try:
        await conn.executemany('''
            INSERT INTO badges (code, name, icon, description, is_active, is_secret)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (code) DO UPDATE SET
                name = EXCLUDED.name,
                icon = EXCLUDED.icon,
                description = EXCLUDED.description
        ''', badges)
        logger.info("Badges seeded successfully")
    except Exception as e:
        logger.error(f"Failed to seed badges: {e}")

async def seed_feature_flags(conn: asyncpg.Connection):
    flags = [
        ("share", "Social Sharing", "Enable/Disable profile sharing and referral links.", True),
        ("multi_survey", "Multi-Survey Management", "Allow users to take multiple tests and manage them in dashboard.", False),
        ("ai_streaming", "AI Analysis Streaming", "Enable real-time streaming of Gemini analysis results.", True)
    ]
    
    try:
        await conn.executemany('''
            INSERT INTO feature_flags (code, name, description, is_enabled)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (code) DO NOTHING
        ''', flags)
        logger.info("Feature flags seeded successfully")
    except Exception as e:
        logger.error(f"Failed to seed feature flags: {e}")
