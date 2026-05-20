from typing import Literal

from pydantic import BaseModel, Field


Gender = Literal["male", "female"]
UserRole = Literal["patient", "doctor", "admin"]


class PatientRegisterRequest(BaseModel):
    email: str = Field(min_length=3)
    password: str = Field(min_length=6)
    full_name: str = Field(min_length=1)
    phone_number: str | None = None
    age: int | None = Field(default=None, ge=0, le=130)
    gender: Gender | None = None
    profile_picture_url: str | None = None


class LoginRequest(BaseModel):
    email: str = Field(min_length=3)
    password: str = Field(min_length=1)


class AuthUserResponse(BaseModel):
    user_id: str
    email: str
    role: UserRole


class AuthSessionResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: Literal["bearer"] = "bearer"
    user: AuthUserResponse
