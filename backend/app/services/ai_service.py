from hashlib import sha256

from fastapi import UploadFile

from app.schemas.examination_schema import MockAIPredictionResponse


MEDICAL_AI_DISCLAIMER = (
    "This AI assisted result is provided for clinical decision support only. "
    "It is not a final medical diagnosis and must not replace professional "
    "medical judgment. The final interpretation and clinical decision remain "
    "the responsibility of the examining doctor."
)

ALLOWED_XRAY_CONTENT_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
}


async def create_mock_prediction(
    xray_image: UploadFile,
    examination_id: int | None = None,
) -> MockAIPredictionResponse:
    file_bytes = await xray_image.read()
    seed_source = file_bytes or (xray_image.filename or "radia-mock").encode()
    seed = int.from_bytes(sha256(seed_source).digest()[:2], "big")

    prediction_result = "Pneumonia" if seed % 2 else "Normal"
    confidence_percentage = 70 + (seed % 26)

    return MockAIPredictionResponse(
        examination_id=examination_id,
        prediction_result=prediction_result,
        confidence_score=round(confidence_percentage / 100, 2),
        confidence_percentage=confidence_percentage,
        model_name="radia-mock-ai-v1",
        is_mock=True,
        disclaimer=MEDICAL_AI_DISCLAIMER,
    )
