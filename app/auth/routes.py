from fastapi import APIRouter, HTTPException
from datetime import datetime

from app.database.connection import db
from app.auth.password import hash_password, verify_password
from app.auth.jwt import create_access_token
from app.auth.models import RegisterUser, LoginUser

router = APIRouter()

users_collection = db["users"]



@router.post("/register")
def register(user: RegisterUser):

    # check passwords
    if user.password != user.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    # check duplicates
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already exists")

    if users_collection.find_one({"phone_number": user.phone_number}):
        raise HTTPException(status_code=400, detail="Phone number already exists")

    user_doc = {
        "business_name": user.business_name,
        "first_name": user.first_name,
        "second_name": user.second_name,
        "email": user.email,
        "phone_number": user.phone_number,
        "password_hash": hash_password(user.password),
        "created_at": datetime.utcnow()
    }

    users_collection.insert_one(user_doc)

    return {"message": "User registered successfully"}



@router.post("/login")
def login(user: LoginUser):

    db_user = users_collection.find_one({
        "$or": [
            {"email": user.identifier},
            {"phone_number": user.identifier}
        ]
    })

    if not db_user:
        raise HTTPException(status_code=400, detail="User not found")

    if not verify_password(user.password, db_user["password_hash"]):
        raise HTTPException(status_code=400, detail="Invalid password")

    token = create_access_token({
        "user_id": str(db_user["_id"]),
        "email": db_user["email"]
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "business_name": db_user["business_name"],
            "first_name": db_user["first_name"]
        }
    }