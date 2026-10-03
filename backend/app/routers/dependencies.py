from typing import List, Union
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.services.auth_service import decode_access_token

security = HTTPBearer()

ALLOWED_ROLES = {"ADMIN", "OFFICER", "TREASURER", "VOLUNTEER", "MEMBER"}


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    return payload


def require_roles(*allowed_roles: Union[str, List[str]]):
    if len(allowed_roles) == 1 and isinstance(allowed_roles[0], (list, tuple, set)):
        roles = {str(r).upper() for r in allowed_roles[0]}
    else:
        roles = {str(r).upper() for r in allowed_roles}

    def role_checker(current_user: dict = Depends(get_current_user)) -> dict:
        user_role = str(current_user.get("role", "")).upper()
        if user_role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user

    return role_checker
