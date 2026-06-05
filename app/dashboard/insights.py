from fastapi import APIRouter, Depends
from app.auth.dependencies import get_current_user
from app.database.connection import transactions_collection
from datetime import datetime
import statistics

router = APIRouter()


@router.get("/dashboard/insights")
def insights(current_user=Depends(get_current_user)):

    user_id = current_user.get("user_id")

    transactions = list(
        transactions_collection.find({"user_id": user_id})
    )

    if not transactions:
        return {
            "insights": ["No data available yet"],
            "alerts": [],
            "positives": []
        }

    amounts = []
    income = 0
    expense = 0
    categories = {}

    recent_threshold = datetime.utcnow()

    alerts = []
    insights = []
    positives = []

    
    for t in transactions:

        amt = t.get("amount", 0)
        amounts.append(amt)

        if t.get("type") == "income":
            income += amt
        else:
            expense += amt

        cat = t.get("category", "unknown")
        categories[cat] = categories.get(cat, 0) + amt

        
        if amt > 5000:
            alerts.append("Large transaction detected")

    profit = income - expense

    
    if profit < 0:
        insights.append("Your expenses are higher than your income.")
    else:
        positives.append("You are currently profitable.")

    if categories:
        top_category = max(categories, key=categories.get)
        insights.append(f"Most spending is in '{top_category}'.")

    
    if len(amounts) > 1:
        avg = statistics.mean(amounts)
        stdev = statistics.stdev(amounts)

        if stdev > avg * 0.8:
            insights.append("Your spending is highly inconsistent (volatile behavior).")

    
    if income > 0 and expense > income:
        alerts.append("Cashflow imbalance detected")

    
    if income > expense * 1.2:
        positives.append("Strong income growth trend detected")

    
    return {
        "insights": insights,
        "alerts": list(set(alerts)),
        "positives": list(set(positives))
    }