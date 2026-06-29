import asyncio
import os
import sys
import argparse
import asyncpg
from dotenv import load_dotenv

load_dotenv()

async def get_db_url() -> str:
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        db_user = os.getenv("DB_USER", "user")
        db_password = os.getenv("DB_PASSWORD", "password")
        db_name = os.getenv("DB_NAME", "postgres")
        db_host = os.getenv("DB_HOST", "localhost")
        db_port = os.getenv("LOCAL_DB_PORT", "5432")
        database_url = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    return database_url

async def run(args):
    url = await get_db_url()
    conn = None
    try:
        conn = await asyncpg.connect(url)
    except Exception as e:
        print(f"Error connecting to database: {e}", file=sys.stderr)
        sys.exit(1)

    try:
        # Resolve user by ID or Username / Email
        user = None
        user_id = args.user_id
        
        # Look up by ID
        user = await conn.fetchrow(
            "SELECT id, email, first_name, last_name FROM aphantasia_users WHERE id = $1", 
            user_id
        )
        
        # If not found, try lookup by email/username
        if not user:
            user = await conn.fetchrow(
                "SELECT id, email, first_name, last_name FROM aphantasia_users WHERE email = $1", 
                user_id
            )
        
        if not user:
            print(f"User '{user_id}' not found in database.", file=sys.stderr)
            sys.exit(1)
            
        resolved_id = user["id"]
        email = user["email"] or "N/A"
        name = f"{user['first_name'] or ''} {user['last_name'] or ''}".strip() or "N/A"
        
        print(f"\nFound User:")
        print(f"  ID:    {resolved_id}")
        print(f"  Email: {email}")
        print(f"  Name:  {name}")
        
        if args.mode == "results-only":
            count = await conn.fetchval(
                "SELECT COUNT(*) FROM test_results WHERE user_id = $1", 
                resolved_id
            )
            print(f"\nThis will delete {count} test result(s) for user {resolved_id}.")
            if not args.yes:
                confirm = input("Are you sure? (y/N): ")
                if confirm.lower() != 'y':
                    print("Aborted.")
                    sys.exit(0)
            
            await conn.execute("DELETE FROM test_results WHERE user_id = $1", resolved_id)
            print(f"Successfully deleted all test results for user {resolved_id}.")
            
        elif args.mode == "full-user":
            print(f"\nThis will delete user {resolved_id} and all related database records (cascading).")
            if not args.yes:
                confirm = input("Are you sure? (y/N): ")
                if confirm.lower() != 'y':
                    print("Aborted.")
                    sys.exit(0)
            
            # Cascade deletes automatically since ON DELETE CASCADE is configured on all referencing tables.
            await conn.execute("DELETE FROM aphantasia_users WHERE id = $1", resolved_id)
            print(f"Successfully deleted user {resolved_id} and all their associated data.")

    finally:
        if conn:
            await conn.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Delete user database records (tests or profile)")
    parser.add_argument("user_id", help="The Telegram User ID or Email to target")
    parser.add_argument(
        "--mode", 
        choices=["results-only", "full-user"], 
        default="results-only",
        help="Whether to delete only test results (results-only) or full user profile + results (full-user)"
    )
    parser.add_argument("-y", "--yes", action="store_true", help="Confirm action without interactive prompt")
    args = parser.parse_args()
    
    asyncio.run(run(args))
