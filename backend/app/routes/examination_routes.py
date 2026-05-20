from fastapi import APIRouter, File, HTTPException, UploadFile, status

from app.schemas.examination_schema import MockAIPredictionResponse
from app.services.ai_service import ALLOWED_XRAY_CONTENT_TYPES, create_mock_prediction


router = APIRouter(tags=["AI"])


def validate_xray_upload(xray_image: UploadFile) -> None:
    if xray_image.content_type not in ALLOWED_XRAY_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPG, JPEG, and PNG X-Ray images are supported.",
        )


@router.post("/ai/predict/mock", response_model=MockAIPredictionResponse)
async def mock_ai_prediction(
    xray_image: UploadFile = File(...),
) -> MockAIPredictionResponse:
    validate_xray_upload(xray_image)
    return await create_mock_prediction(xray_image=xray_image)


@router.post(
    "/doctor/examinations/{examination_id}/predict",
    response_model=MockAIPredictionResponse,
)
async def mock_doctor_examination_prediction(
    examination_id: int,
    xray_image: UploadFile = File(...),
) -> MockAIPredictionResponse:
    validate_xray_upload(xray_image)
    return await create_mock_prediction(
        xray_image=xray_image,
        examination_id=examination_id,
    )
