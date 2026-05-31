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


class PromotePatientToDoctorRequest(BaseModel):
    patient_id: str = Field(min_length=1)
    license_number: str | None = None
    specialization: str | None = None
