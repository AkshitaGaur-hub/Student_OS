import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in the environment variables.")

# Ensure psycopg2 driver is used (works with the installed psycopg2-binary package).
# Neon and standard PostgreSQL URLs may come in as "postgresql://" which SQLAlchemy
# can try to map to psycopg v3. Forcing "+psycopg2" avoids that.
def _normalise_db_url(url: str) -> str:
    if url.startswith("postgresql://") or url.startswith("postgres://"):
        return url.replace("://", "+psycopg2://", 1)
    return url

_db_url = _normalise_db_url(DATABASE_URL)

engine = create_engine(_db_url)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()