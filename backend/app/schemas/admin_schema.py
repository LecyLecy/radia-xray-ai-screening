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


class AdminCreatePatientRequest(BaseModel):
    email: str = Field(min_length=3)
    password: str = Field(min_length=6)
    full_name: str = Field(min_length=1)
    phone_number: str | None = None
    age: int | None = Field(default=None, ge=0, le=130)
    gender: Gender | None = None


class AdminUpdatePatientRequest(BaseModel):
    full_name: str = Field(min_length=1)
    phone_number: str | None = None
    age: int | None = Field(default=None, ge=0, le=130)
    gender: Gender | None = None


class AdminCreateDoctorRequest(AdminCreatePatientRequest):
    license_number: str | None = None
    specialization: str | None = None


class AdminUpdateDoctorRequest(AdminUpdatePatientRequest):
    license_number: str | None = None
    specialization: str | None = None
