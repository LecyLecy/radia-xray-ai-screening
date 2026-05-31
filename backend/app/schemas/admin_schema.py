from pydantic import BaseModel, Field

from app.schemas.user_schema import Gender


class DoctorProfileResponse(BaseModel):
    id: str | None = None
    user_id: str
    email: str
    full_name: str
    phone_number: str | None = None
    age: int | None = None
    gender: Gender | None = None
    profile_picture_url: str | None = None
    license_number: str | None = None
    specialization: str | None = None


class CreateDoctorRequest(BaseModel):
    email: str = Field(min_length=3)
    password: str = Field(min_length=1)
    full_name: str = Field(min_length=1)
    phone_number: str | None = None
    age: int | None = Field(default=None, ge=0, le=130)
    gender: Gender | None = None
    license_number: str | None = None
    specialization: str | None = None
