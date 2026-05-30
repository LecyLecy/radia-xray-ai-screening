from typing import Literal

from pydantic import BaseModel, Field


Gender = Literal["male", "female"]
UserRole = Literal["patient", "doctor", "admin"]


class CurrentUserResponse(BaseModel):
    user_id: str
    email: str
    role: UserRole


class PatientProfileResponse(BaseModel):
    id: str | None = None
    user_id: str
    email: str
    full_name: str
    phone_number: str | None = None
    age: int | None = None
    gender: Gender | None = None
    profile_picture_url: str | None = None
    profile_picture_download_url: str | None = None


class UpdatePatientProfileRequest(BaseModel):
    full_name: str = Field(min_length=1)
    phone_number: str | None = None
    age: int | None = Field(default=None, ge=0, le=130)
    gender: Gender | None = None
