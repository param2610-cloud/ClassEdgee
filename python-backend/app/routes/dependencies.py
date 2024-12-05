
import psycopg2
from typing import Generator
import os

def get_db_settings():
    return {
        "dbname": os.getenv("DB_NAME", "schooldb"),
        "user": os.getenv("DB_USER", "postgres"),
        "password": os.getenv("DB_PASSWORD"),
        "host": os.getenv("DB_HOST", "localhost"),
        "port": os.getenv("DB_PORT", "5432")
    }

def get_db_connection() -> Generator:
    settings = get_db_settings()
    conn = psycopg2.connect(**settings)
    try:
        yield conn
    finally:
        conn.close()

# Dependency to get DB connection
async def get_db():
    conn = next(get_db_connection())
    try:
        yield conn
    finally:
        conn.close()

# Usage in FastAPI endpoints
# db: Connection = Depends(get_db)