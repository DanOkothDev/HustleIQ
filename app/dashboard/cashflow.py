from fastapi import APIRouter, Depends
from app.auth.dependencies import get_current_user
from app.database.connection import transactions_collection
from app.services.analytics import build_cashflow_series, build_expense_breakdown

router = APIRouter()


@router.get("/dashboard/cashflow")
def cashflow(current_user=Depends(get_current_user)):
    user_id = current_user.get("user_id")
    transactions = list(transactions_collection.find({"user_id": user_id}))

    return {
        "series": build_cashflow_series(transactions),
        "expenses_breakdown": build_expense_breakdown(transactions)
    }