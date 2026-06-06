from fastapi import APIRouter, Depends
from app.database.connection import transactions_collection
from app.auth.dependencies import get_current_user
from app.services.analytics import (
    compute_financial_overview,
    build_cashflow_series,
    build_expense_breakdown,
    build_insight_cards,
    build_risk_profile,
)

router = APIRouter()


@router.get("/analytics")
async def get_analytics(current_user=Depends(get_current_user)):
    user_id = current_user.get("user_id")
    transactions = list(transactions_collection.find({"user_id": user_id}))

    overview = compute_financial_overview(transactions)
    risk = build_risk_profile(transactions)
    insights = build_insight_cards(transactions)
    series = build_cashflow_series(transactions)
    expenses_breakdown = build_expense_breakdown(transactions)

    if overview["transactions_count"] == 0:
        return {
            "user_id": user_id,
            "status": "no_data",
            "insight": "No financial activity available yet.",
            "analytics": {
                "series": [],
                "expenses_breakdown": [],
                "insights": insights,
                "risk": risk,
                "summary": overview,
            },
        }

    return {
        "user_id": user_id,
        "analytics": {
            "summary": overview,
            "risk": risk,
            "insights": insights,
            "cashflow": {
                "series": series,
                "expenses_breakdown": expenses_breakdown,
            },
        },
    }
