from fastapi import APIRouter, Depends
from app.auth.dependencies import get_current_user
from app.database.connection import transactions_collection
import statistics

router = APIRouter()


@router.get("/dashboard/risk")
def risk_engine(current_user=Depends(get_current_user)):

    user_id = current_user.get("user_id")

    transactions = list(
        transactions_collection.find({"user_id": user_id})
    )

    if not transactions:
        return {
            "risk_score": 0,
            "risk_level": "unknown",
            "signals": [],
            "explanation": "No data available"
        }

    income = 0
    expense = 0
    amounts = []
    categories = {}
    anomalies = 0

    
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
            anomalies += 1

    profit = income - expense

    signals = []
    risk_score = 0

    
    if profit < 0:
        risk_score += 30
        signals.append("negative_cashflow")

    
    if len(amounts) > 1:
        avg = statistics.mean(amounts)
        stdev = statistics.stdev(amounts)

        if avg > 0 and stdev > avg * 0.8:
            risk_score += 20
            signals.append("high_spending_volatility")
    else:
        avg = amounts[0] if amounts else 0

    
    total = sum(categories.values()) if categories else 0

    if total > 0:
        top_cat = max(categories, key=categories.get)
        dominance = categories[top_cat] / total

        if dominance > 0.7:
            risk_score += 25
            signals.append("high_category_dependence")

    
    if anomalies > 0:
        risk_score += 15
        signals.append("large_transactions_detected")

    
    risk_score = min(100, risk_score)

    
    if risk_score < 30:
        risk_level = "low"
    elif risk_score < 70:
        risk_level = "medium"
    else:
        risk_level = "high"

    
    explanation_parts = []

    if "negative_cashflow" in signals:
        explanation_parts.append("Expenses exceed income.")

    if "high_spending_volatility" in signals:
        explanation_parts.append("Spending is unstable.")

    if "high_category_dependence" in signals:
        explanation_parts.append("Over-reliance on one category detected.")

    if anomalies > 0:
        explanation_parts.append("Large transactions detected.")

    if not explanation_parts:
        explanation_parts.append("Financial behavior is stable.")

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "signals": signals,
        "explanation": " ".join(explanation_parts)
    }