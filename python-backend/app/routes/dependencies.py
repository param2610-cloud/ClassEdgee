import psycopg2
from typing import Generator
import os
from contextlib import contextmanager

def get_db_settings():
    return {
        "dbname": os.getenv("DB_NAME"),
        "user": os.getenv("DB_USER"),
        "password": os.getenv("DB_PASSWORD"),
        "host": os.getenv("DB_HOST"),
    }

@contextmanager
def get_db_connection():
    conn = psycopg2.connect(
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password= os.getenv("DB_PASSWORD"),
        host=os.getenv("DB_HOST"),
    )
    try:
        yield conn
    finally:
        conn.close()

# Dependency to get DB connection
async def get_db():
    with get_db_connection() as conn:
        try:
            yield conn
        finally:
            conn.close()

# Usage in FastAPI endpoints
# db: Connection = Depends(get_db)