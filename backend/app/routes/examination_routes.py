from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.schemas.examination_schema import (
    MockAIPredictionResponse,
    StoredAIPredictionResponse,
)
from app.schemas.user_schema import CurrentUserResponse
from app.services.ai_service import create_mock_prediction
from app.services.examination_service import (
    ExaminationServiceError,
    create_stored_mock_prediction,
)
from app.services.storage_service import StorageServiceError, read_valid_xray_upload
from app.services.user_service import UserServiceError, require_role
from app.utils.security import get_current_auth_user


router = APIRouter(tags=["AI"])


def require_doctor_or_admin(
    auth_user: CurrentUserResponse = Depends(get_current_auth_user),
) -> CurrentUserResponse:
    try:
        return require_role(auth_user, {"doctor", "admin"})
    except UserServiceError as error:
        raise HTTPException(
            status_code=error.status_code,
            detail=error.message,
        ) from error


@router.post("/ai/predict/mock", response_model=MockAIPredictionResponse)
async def mock_ai_prediction(
    xray_image: UploadFile = File(...),
) -> MockAIPredictionResponse:
    try:
        upload_data = await read_valid_xray_upload(xray_image)
    except StorageServiceError as error:
        raise HTTPException(status_code=error.status_code, detail=error.message) from error

    return await create_mock_prediction(
        xray_image=xray_image,
        file_bytes=upload_data.content,
    )


@router.post(
    "/doctor/examinations/{examination_id}/predict",
    response_model=StoredAIPredictionResponse,
)
async def mock_doctor_examination_prediction(
    examination_id: str,
    xray_image: UploadFile = File(...),
    current_user: CurrentUserResponse = Depends(require_doctor_or_admin),
) -> StoredAIPredictionResponse:
    try:
        return await create_stored_mock_prediction(
            examination_id=examination_id,
            xray_image=xray_image,
            current_user=current_user,
        )
    except ExaminationServiceError as error:
        raise HTTPException(
            status_code=error.status_code,
            detail=error.message,
        ) from error
