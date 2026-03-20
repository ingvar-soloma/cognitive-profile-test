import os
import logging
import asyncio
import asyncpg
from typing import AsyncGenerator
from seeders import seed_badges, seed_feature_flags, seed_news

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
    retries = 5
    while retries > 0:
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
            await conn.execute("ALTER TABLE aphantasia_users ADD COLUMN IF NOT EXISTS public_id UUID DEFAULT gen_random_uuid()")
            await conn.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_public_id ON aphantasia_users(public_id)")
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

            # Test Results / Share IDs Table
            await conn.execute('''
                CREATE TABLE IF NOT EXISTS test_results (
                    share_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id VARCHAR(255) REFERENCES aphantasia_users(id) ON DELETE CASCADE,
                    test_type VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(user_id, test_type)
                )
            ''')
            await conn.execute("CREATE INDEX IF NOT EXISTS idx_test_results_user ON test_results(user_id)")

            # News Table
            await conn.execute('''
                CREATE TABLE IF NOT EXISTS news (
                    id VARCHAR(255) PRIMARY KEY,
                    date DATE NOT NULL,
                    tag VARCHAR(50),
                    tag_color TEXT,
                    read_min INTEGER,
                    title_uk TEXT,
                    title_en TEXT,
                    title_ru TEXT,
                    excerpt_uk TEXT,
                    excerpt_en TEXT,
                    excerpt_ru TEXT,
                    body_uk TEXT[],
                    body_en TEXT[],
                    body_ru TEXT[],
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')

            logger.info("Async PostgreSQL Database initialized correctly")
            await seed_badges(conn)
            await seed_feature_flags(conn)
            await seed_news(conn)
            await conn.close()
            break  # Exit loop on success
        except Exception as e:
            retries -= 1
            if retries == 0:
                logger.error(f"Failed to initialize PostgreSQL database after all attempts: {e}")
                raise e
            logger.warning(f"Failed to connect to PostgreSQL (retrying {retries} more times): {e}")
            await asyncio.sleep(2)
