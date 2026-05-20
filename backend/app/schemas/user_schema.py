from typing import Literal

from pydantic import BaseModel


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
