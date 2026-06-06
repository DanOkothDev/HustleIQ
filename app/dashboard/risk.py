from fastapi import APIRouter, Depends
from app.auth.dependencies import get_current_user
from app.database.connection import transactions_collection
from app.services.analytics import build_risk_profile

router = APIRouter()


@router.get("/dashboard/risk")
def risk_engine(current_user=Depends(get_current_user)):
    user_id = current_user.get("user_id")
    transactions = list(transactions_collection.find({"user_id": user_id}))
    return build_risk_profile(transactions)
