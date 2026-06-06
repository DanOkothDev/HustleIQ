import os
from jose import jwt, JWTError
from datetime import datetime, timedelta

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey-change-this")
ALGORITHM = "HS256"


def create_access_token(data: dict, expires_minutes: int = 60):
    if not SECRET_KEY:
        raise RuntimeError("SECRET_KEY must be set in the environment")

    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=expires_minutes)
    to_encode.update({"exp": expire})

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str):
    if not SECRET_KEY:
        return None

    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None