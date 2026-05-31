from io import BytesIO

from PIL import Image, ImageOps


def preprocess_xray_image(file_bytes: bytes):
    try:
        import torch
        from torchvision import transforms
    except ImportError as error:
        raise RuntimeError("PyTorch image preprocessing dependencies are missing.") from error

    image = Image.open(BytesIO(file_bytes))
    image = ImageOps.exif_transpose(image).convert("RGB")

    transform = transforms.Compose(
        [
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225],
            ),
        ]
    )

    tensor = transform(image).unsqueeze(0)
    return tensor.to(dtype=torch.float32)
