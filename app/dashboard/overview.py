from fastapi import APIRouter, Depends
from app.auth.dependencies import get_current_user
from app.database.connection import transactions_collection
import statistics

router = APIRouter()


@router.get("/dashboard/overview")
def dashboard_overview(current_user=Depends(get_current_user)):

    user_id = current_user.get("user_id")

    transactions = list(
        transactions_collection.find({"user_id": user_id})
    )

    if not transactions:
        return {
            "status": "no_data",
            "message": "No transactions found"
        }

    income = 0
    expense = 0
    categories = {}
    amounts = []

    for t in transactions:

        amt = t.get("amount", 0)
        amounts.append(amt)

        if t["type"] == "income":
            income += amt
        else:
            expense += amt

        cat = t.get("category", "unknown")
        categories[cat] = categories.get(cat, 0) + amt

    profit = income - expense

   
    avg = statistics.mean(amounts)
    volatility = statistics.stdev(amounts) if len(amounts) > 1 else 0

    health_score = 100

    if profit < 0:
        health_score -= 30

    if volatility > avg * 0.8 and avg > 0:
        health_score -= 20

    if categories and max(categories.values()) / sum(categories.values()) > 0.7:
        health_score -= 15

    health_score = max(0, min(100, health_score))

    top_category = max(categories, key=categories.get)

    
    ai_summary = []

    if profit < 0:
        ai_summary.append("Your expenses exceed income.")

    ai_summary.append(f"Top activity is '{top_category}'.")

    if health_score > 70:
        ai_summary.append("Overall financial health is stable.")
    else:
        ai_summary.append("Your financial stability needs attention.")

    return {
        "user_id": user_id,
        "summary": {
            "income": income,
            "expense": expense,
            "profit": profit
        },
        "health_score": health_score,
        "risk_level": "low" if health_score > 70 else "medium",
        "top_category": top_category,
        "ai_summary": " ".join(ai_summary)
    }