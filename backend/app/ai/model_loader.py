from functools import lru_cache
from pathlib import Path
import re


CHEXNET_LABELS = [
    "Atelectasis",
    "Cardiomegaly",
    "Effusion",
    "Infiltration",
    "Mass",
    "Nodule",
    "Pneumonia",
    "Pneumothorax",
    "Consolidation",
    "Edema",
    "Emphysema",
    "Fibrosis",
    "Pleural_Thickening",
    "Hernia",
]
PNEUMONIA_INDEX = CHEXNET_LABELS.index("Pneumonia")


class ModelLoadError(RuntimeError):
    pass


def _resolve_model_path(model_path: str) -> Path:
    path = Path(model_path)
    if path.is_absolute():
        return path

    backend_root = Path(__file__).resolve().parents[2]
    resolved_path = backend_root / path
    if resolved_path.exists():
        return resolved_path

    fallback_path = backend_root / "app" / "models" / "model.pth.tar"
    if fallback_path.exists():
        return fallback_path

    return resolved_path


def _normalize_state_key(key: str) -> str:
    cleaned_key = key.removeprefix("module.")
    return re.sub(r"\.(norm|conv)\.([12])\.", r".\1\2.", cleaned_key)


@lru_cache(maxsize=1)
def load_pneumonia_model(model_path: str):
    try:
        import torch
        from torch import nn
        from torchvision import models
    except ImportError as error:
        raise ModelLoadError(
            "PyTorch runtime is not installed. Install backend requirements first."
        ) from error

    resolved_path = _resolve_model_path(model_path)
    if not resolved_path.exists():
        raise ModelLoadError(f"AI model checkpoint was not found at {resolved_path}.")

    class CheXNetDenseNet121(nn.Module):
        def __init__(self) -> None:
            super().__init__()
            self.densenet121 = models.densenet121(weights=None)
            self.densenet121.classifier = nn.Sequential(
                nn.Linear(self.densenet121.classifier.in_features, len(CHEXNET_LABELS))
            )

        def forward(self, image_tensor):
            return self.densenet121(image_tensor)

    checkpoint = torch.load(resolved_path, map_location="cpu", weights_only=True)
    state_dict = checkpoint.get("state_dict") if isinstance(checkpoint, dict) else None
    if not state_dict:
        raise ModelLoadError("AI model checkpoint does not contain a state_dict.")

    cleaned_state = {_normalize_state_key(key): value for key, value in state_dict.items()}

    model = CheXNetDenseNet121()
    model.load_state_dict(cleaned_state)
    model.eval()
    return model
