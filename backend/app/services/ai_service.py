from hashlib import sha256

from fastapi import UploadFile

from app.ai.model_loader import ModelLoadError
from app.ai.predict import predict_pneumonia
from app.schemas.examination_schema import MockAIPredictionResponse


MEDICAL_AI_DISCLAIMER = (
    "This AI assisted result is provided for clinical decision support only. "
    "It is not a final medical diagnosis and must not replace professional "
    "medical judgment. The final interpretation and clinical decision remain "
    "the responsibility of the examining doctor."
)

ALLOWED_XRAY_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
}


async def create_mock_prediction(
    xray_image: UploadFile,
    examination_id: str | None = None,
    file_bytes: bytes | None = None,
) -> MockAIPredictionResponse:
    prediction_bytes = file_bytes if file_bytes is not None else await xray_image.read()
    try:
        prediction = predict_pneumonia(prediction_bytes)
        return MockAIPredictionResponse(
            examination_id=examination_id,
            prediction_result=prediction.prediction_result,
            confidence_score=prediction.confidence_score,
            confidence_percentage=prediction.confidence_percentage,
            model_name=prediction.model_name,
            is_mock=False,
            disclaimer=MEDICAL_AI_DISCLAIMER,
        )
    except (ModelLoadError, RuntimeError, OSError, ValueError):
        pass

    seed_source = prediction_bytes or (xray_image.filename or "radia-mock").encode()
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
