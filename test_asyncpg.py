import asyncio
import asyncpg
from asyncpg.connect_utils import _parse_connect_dsn_and_args

dsn = "postgresql://user:password@db:5432/postgres"
try:
    _parse_connect_dsn_and_args(dsn, None, None, None, None, None, None, None)
    print("Parsed OK")
except Exception as e:
    print(f"Error: {e}")

