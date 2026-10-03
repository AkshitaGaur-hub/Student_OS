import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
from dotenv import load_dotenv
from jose import jwt, JWTError
import bcrypt

backend_env = Path(__file__).resolve().parent.parent.parent / ".env"
if backend_env.exists():
    load_dotenv(dotenv_path=backend_env, override=False)

SECRET_KEY = (
    os.getenv("JWT_SECRET")
    or os.getenv("SECRET_KEY")
    or "buybu8894buer87948bvvbh9023jnd"
).strip()
ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    pwd_bytes = password.encode("utf-8")[:72]
    return bcrypt.hashpw(pwd_bytes, bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8")[:72],
            hashed_password.encode("utf-8"),
        )
    except Exception:
        return False


def create_access_token(user_id, role: str = "member") -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=1)
    payload = {
        "sub": str(user_id),
        "user_id": user_id,
        "role": str(role).lower(),
        "exp": expire,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if "user_id" not in payload and "sub" in payload:
            try:
                payload["user_id"] = int(payload["sub"])
            except Exception:
                pass
        return payload
    except Exception:
        return None