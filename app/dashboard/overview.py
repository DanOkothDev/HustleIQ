from fastapi import APIRouter, Depends
from app.auth.dependencies import get_current_user
from app.database.connection import transactions_collection
from app.services.analytics import compute_financial_overview

router = APIRouter()


@router.get("/dashboard/overview")
def dashboard_overview(current_user=Depends(get_current_user)):
    user_id = current_user.get("user_id")
    transactions = list(transactions_collection.find({"user_id": user_id}))
    overview = compute_financial_overview(transactions)

    if overview["transactions_count"] == 0:
        return {
            "status": "no_data",
            "message": "No transactions found",
            "summary": overview
        }

    health_score = 100
    if overview["profit"] < 0:
        health_score -= 30
    if overview["volatility"] > overview["average_transaction"] * 0.8 and overview["average_transaction"] > 0:
        health_score -= 20
    if overview["top_category_ratio"] > 0.7:
        health_score -= 15
    health_score = max(0, min(100, health_score))

    ai_summary = []
    if overview["profit"] < 0:
        ai_summary.append("Your expenses exceed income.")
    ai_summary.append(f"Top activity is '{overview['top_category']}'.")
    if health_score > 70:
        ai_summary.append("Overall financial health is stable.")
    else:
        ai_summary.append("Your financial stability needs attention.")

    return {
        "user_id": user_id,
        "summary": {
            "income": overview["total_income"],
            "expense": overview["total_expense"],
            "profit": overview["profit"],
            "transactions": overview["transactions_count"],
        },
        "health_score": health_score,
        "risk_level": "low" if health_score > 70 else "medium",
        "top_category": overview["top_category"],
        "ai_summary": " ".join(ai_summary)
    }