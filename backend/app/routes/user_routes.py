from fastapi import APIRouter, Depends, HTTPException

from app.schemas.user_schema import CurrentUserProfileResponse, CurrentUserResponse
from app.services.user_service import UserServiceError, get_current_user_profile
from app.utils.security import get_current_auth_user


router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me/profile", response_model=CurrentUserProfileResponse)
def get_my_profile(
    current_user: CurrentUserResponse = Depends(get_current_auth_user),
) -> CurrentUserProfileResponse:
    try:
        return get_current_user_profile(current_user)
    except UserServiceError as error:
        raise HTTPException(
            status_code=error.status_code,
            detail=error.message,
        ) from error
