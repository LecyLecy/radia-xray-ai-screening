from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.schemas.user_schema import CurrentUserResponse
from app.services.supabase_service import get_supabase_auth_client


bearer_scheme = HTTPBearer(auto_error=False)


def get_current_auth_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> CurrentUserResponse:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer token.",
        )

    try:
        user_response = get_supabase_auth_client().auth.get_user(credentials.credentials)
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid bearer token.",
        ) from error

    user = user_response.user if user_response else None
    if not user or not user.id or not user.email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid bearer token.",
        )

    return CurrentUserResponse(
        user_id=user.id,
        email=user.email,
        role="patient",
    )
