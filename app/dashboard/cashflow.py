from fastapi import APIRouter, Depends
from app.auth.dependencies import get_current_user
from app.database.connection import transactions_collection
from datetime import datetime, timedelta
from collections import defaultdict

router = APIRouter()


@router.get("/dashboard/cashflow")
def cashflow(current_user=Depends(get_current_user)):

    user_id = current_user.get("user_id")

    transactions = list(
        transactions_collection.find({"user_id": user_id})
    )

    if not transactions:
        return {
            "labels": [],
            "income": [],
            "expense": []
        }

    
    income_map = defaultdict(float)
    expense_map = defaultdict(float)

    for t in transactions:

        amount = t.get("amount", 0)

        
        date = t.get("date")

        if not date:
            date = datetime.utcnow().date().isoformat()
        else:
            date = str(date)[:10]  # strip time if exists

        if t.get("type") == "income":
            income_map[date] += amount
        else:
            expense_map[date] += amount

    
    all_dates = sorted(
        set(list(income_map.keys()) + list(expense_map.keys()))
    )

    income_series = []
    expense_series = []

    for d in all_dates:
        income_series.append(income_map.get(d, 0))
        expense_series.append(expense_map.get(d, 0))

    return {
        "labels": all_dates,
        "income": income_series,
        "expense": expense_series
    }