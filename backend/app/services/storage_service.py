import re
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import PurePath
from uuid import uuid4

from fastapi import UploadFile, status
from postgrest.exceptions import APIError

from app.config import (
    MAX_PROFILE_PICTURE_BYTES,
    MAX_XRAY_UPLOAD_BYTES,
    STORAGE_BUCKET_PROFILE,
    STORAGE_BUCKET_XRAY,
)
from app.services.supabase_service import get_supabase_client


ALLOWED_XRAY_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
}

ALLOWED_PROFILE_PICTURE_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
}


class StorageServiceError(Exception):
    def __init__(self, message: str, status_code: int) -> None:
        self.message = message
        self.status_code = status_code
        super().__init__(message)


@dataclass(frozen=True)
class XRayUploadData:
    content: bytes
    filename: str
    content_type: str


@dataclass(frozen=True)
class ProfilePictureUploadData:
    content: bytes
    filename: str
    content_type: str


def _read_error_message(error: Exception) -> str:
    if isinstance(error, APIError):
        return error.message
    return str(error)


def _safe_filename(filename: str | None) -> str:
    original_name = PurePath(filename or "xray-image").name
    safe_name = re.sub(r"[^A-Za-z0-9._-]", "_", original_name).strip("._")
    return safe_name or "xray-image"


async def read_valid_xray_upload(xray_image: UploadFile) -> XRayUploadData:
    if xray_image.content_type not in ALLOWED_XRAY_CONTENT_TYPES:
        raise StorageServiceError(
            message="Only JPG, JPEG, and PNG X-Ray images are supported.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    content = await xray_image.read()
    if not content:
        raise StorageServiceError(
            message="Uploaded X-Ray image is empty.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    if len(content) > MAX_XRAY_UPLOAD_BYTES:
        raise StorageServiceError(
            message="X-Ray image exceeds the 10 MB upload limit.",
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
        )

    return XRayUploadData(
        content=content,
        filename=_safe_filename(xray_image.filename),
        content_type=xray_image.content_type,
    )


async def read_valid_profile_picture_upload(
    profile_picture: UploadFile,
) -> ProfilePictureUploadData:
    if profile_picture.content_type not in ALLOWED_PROFILE_PICTURE_CONTENT_TYPES:
        raise StorageServiceError(
            message="Only JPG, PNG, and WEBP profile pictures are supported.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    content = await profile_picture.read()
    if not content:
        raise StorageServiceError(
            message="Uploaded profile picture is empty.",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    if len(content) > MAX_PROFILE_PICTURE_BYTES:
        raise StorageServiceError(
            message="Profile picture exceeds the 2 MB upload limit.",
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
        )

    return ProfilePictureUploadData(
        content=content,
        filename=_safe_filename(profile_picture.filename),
        content_type=profile_picture.content_type,
    )


def upload_xray_image(
    examination_id: str,
    upload_data: XRayUploadData,
) -> str:
    supabase = get_supabase_client()
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    object_path = f"{examination_id}/{timestamp}_{uuid4().hex}_{upload_data.filename}"

    try:
        supabase.storage.from_(STORAGE_BUCKET_XRAY).upload(
            path=object_path,
            file=upload_data.content,
            file_options={
                "content-type": upload_data.content_type,
                "upsert": "false",
            },
        )
    except Exception as error:
        raise StorageServiceError(
            message=_read_error_message(error) or "X-Ray image could not be uploaded.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        ) from error

    return object_path


def upload_profile_picture(
    user_id: str,
    upload_data: ProfilePictureUploadData,
) -> str:
    supabase = get_supabase_client()
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    object_path = f"{user_id}/{timestamp}_{uuid4().hex}_{upload_data.filename}"

    try:
        supabase.storage.from_(STORAGE_BUCKET_PROFILE).upload(
            path=object_path,
            file=upload_data.content,
            file_options={
                "content-type": upload_data.content_type,
                "upsert": "false",
            },
        )
    except Exception as error:
        raise StorageServiceError(
            message=_read_error_message(error) or "Profile picture could not be uploaded.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        ) from error

    return object_path


def create_profile_picture_signed_url(object_path: str | None) -> str | None:
    if not object_path:
        return None

    supabase = get_supabase_client()
    try:
        signed_response = supabase.storage.from_(STORAGE_BUCKET_PROFILE).create_signed_url(
            object_path,
            60 * 10,
        )
    except Exception:
        return None

    if isinstance(signed_response, dict):
        return signed_response.get("signedURL") or signed_response.get("signed_url")

    return getattr(signed_response, "signed_url", None) or getattr(
        signed_response,
        "signedURL",
        None,
    )
