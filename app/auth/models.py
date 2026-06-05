from pydantic import BaseModel, EmailStr


class RegisterUser(BaseModel):
    business_name: str
    first_name: str
    second_name: str
    email: EmailStr
    phone_number: str
    password: str
    confirm_password: str


class LoginUser(BaseModel):
    identifier: str  # email OR phone
    password: str