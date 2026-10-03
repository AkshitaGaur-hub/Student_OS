import os
from datetime import datetime, timedelta
from typing import Optional
from pathlib import Path

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
import bcrypt
from sqlalchemy.orm import Session
from dotenv import load_dotenv


# ─────────────────────────────────────────────
# Load Environment Variables
# ─────────────────────────────────────────────
backend_env = Path(__file__).resolve().parent.parent / ".env"
root_env = Path(__file__).resolve().parent.parent.parent / ".env"

if backend_env.exists():
    load_dotenv(dotenv_path=backend_env, override=False)

if root_env.exists():
    load_dotenv(dotenv_path=root_env, override=False)


from app.database import get_db
from app.models.user import User


# ─────────────────────────────────────────────
# JWT Configuration
# ─────────────────────────────────────────────
SECRET_KEY = (
    os.getenv("JWT_SECRET")
    or "buybu8894buer87948bvvbh9023jnd"
).strip()

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24


# ─────────────────────────────────────────────
# OAuth2
# ─────────────────────────────────────────────
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)


# ─────────────────────────────────────────────
# Valid Roles
# ─────────────────────────────────────────────
VALID_ROLES = {
    "student",
    "volunteer",
    "organizer",
    "treasurer",
    "admin",
}


# ─────────────────────────────────────────────
# Password Hashing
# ─────────────────────────────────────────────
def hash_password(password: str) -> str:
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()

    return bcrypt.hashpw(
        pwd_bytes,
        salt,
    ).decode("utf-8")


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    try:
        pwd_bytes = plain_password.encode("utf-8")[:72]

        return bcrypt.checkpw(
            pwd_bytes,
            hashed_password.encode("utf-8"),
        )

    except Exception:
        return False


# ─────────────────────────────────────────────
# Create JWT Access Token
# ─────────────────────────────────────────────
def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None,
) -> str:

    to_encode = data.copy()

    if "sub" in to_encode:
        to_encode["sub"] = str(to_encode["sub"])

    expire = datetime.utcnow() + (
        expires_delta
        or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    to_encode.update({
        "exp": expire
    })

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


# ─────────────────────────────────────────────
# Get Current User
# ─────────────────────────────────────────────
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={
            "WWW-Authenticate": "Bearer"
        },
    )

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        user_id = payload.get("sub")

        if user_id is None:
            raise credentials_exception

        user_id = int(user_id)

    except (JWTError, ValueError, TypeError):
        raise credentials_exception

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise credentials_exception

    return user


# ─────────────────────────────────────────────
# Role Authorization
# ─────────────────────────────────────────────
def require_roles(*allowed_roles: str):

    normalized_roles = {
        role.lower()
        for role in allowed_roles
    }

    def role_checker(
        current_user: User = Depends(get_current_user),
    ) -> User:

        current_role = str(
            current_user.role
        ).lower()

        if current_role not in normalized_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "Access denied. "
                    f"Required roles: "
                    f"{', '.join(allowed_roles)}"
                ),
            )

        return current_user

    return role_checker