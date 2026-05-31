from dataclasses import dataclass

from app.ai.model_loader import PNEUMONIA_INDEX, load_pneumonia_model
from app.ai.preprocess import preprocess_xray_image
from app.config import AI_MODEL_PATH, AI_PNEUMONIA_THRESHOLD


@dataclass(frozen=True)
class PneumoniaPrediction:
    prediction_result: str
    confidence_score: float
    confidence_percentage: int
    model_name: str


def predict_pneumonia(file_bytes: bytes) -> PneumoniaPrediction:
    import torch

    model = load_pneumonia_model(AI_MODEL_PATH)
    image_tensor = preprocess_xray_image(file_bytes)

    with torch.no_grad():
        logits = model(image_tensor)
        probabilities = torch.sigmoid(logits).squeeze(0)

    pneumonia_probability = float(probabilities[PNEUMONIA_INDEX].item())
    is_pneumonia = pneumonia_probability >= AI_PNEUMONIA_THRESHOLD
    confidence_score = (
        pneumonia_probability if is_pneumonia else 1.0 - pneumonia_probability
    )
    confidence_score = max(0.0, min(1.0, confidence_score))

    return PneumoniaPrediction(
        prediction_result="Pneumonia" if is_pneumonia else "Normal",
        confidence_score=round(confidence_score, 4),
        confidence_percentage=round(confidence_score * 100),
        model_name="chexnet-densenet121-pneumonia",
    )
