from fastapi import APIRouter, Depends
from app.database.connection import transactions_collection
from app.auth.dependencies import get_current_user
import statistics

router = APIRouter()


@router.get("/analytics")
async def get_analytics(current_user=Depends(get_current_user)):

    
    user_id = current_user.get("user_id")

    transactions = list(
        transactions_collection.find({"user_id": user_id})
    )

    if not transactions:
        return {
            "user_id": user_id,
            "status": "no_data",
            "insight": "No financial activity available yet."
        }

    amounts = [t.get("amount", 0) for t in transactions]

    total_income = 0
    total_expense = 0
    categories = {}

    
    for t in transactions:
        amt = t.get("amount", 0)
        cat = t.get("category", "unknown")

        if t.get("type") == "income":
            total_income += amt
        else:
            total_expense += amt

        categories[cat] = categories.get(cat, 0) + amt

    profit = total_income - total_expense

    
    if len(amounts) > 1:
        avg = statistics.mean(amounts)
        stdev = statistics.stdev(amounts)
    else:
        avg = amounts[0] if amounts else 0
        stdev = 0

    max_txn = max(amounts) if amounts else 0
    min_txn = min(amounts) if amounts else 0

    
    anomalies = []

    for t in transactions:
        amt = t.get("amount", 0)

        if stdev > 0:
            z_score = abs((amt - avg) / stdev)
            if z_score > 2.5:
                anomalies.append(t)

    
    total_volume = sum(categories.values())
    dominant_category = None
    dominance_ratio = 0

    if categories and total_volume > 0:
        dominant_category = max(categories, key=categories.get)
        dominance_ratio = (categories[dominant_category] / total_volume) * 100

    
    signals = []

    if profit < 0:
        signals.append("negative_cashflow")
    else:
        signals.append("positive_cashflow")

    if total_income > 0 and total_expense > total_income:
        signals.append("unsustainable_spending")

    if stdev > avg * 0.8 and avg > 0:
        signals.append("high_spending_volatility")

    if dominance_ratio > 70:
        signals.append("high_category_dependence")

    if len(anomalies) > 0:
        signals.append("transaction_anomalies_detected")

    
    insight_parts = []

    if profit < 0:
        insight_parts.append(
            "Your expenses are exceeding income, indicating negative cashflow."
        )

    if dominant_category:
        insight_parts.append(
            f"Most of your financial activity is concentrated in '{dominant_category}' ({round(dominance_ratio,1)}%)."
        )

    if stdev > avg * 0.8 and avg > 0:
        insight_parts.append(
            "Your spending pattern is inconsistent, indicating volatility in financial behavior."
        )

    if len(anomalies) > 0:
        insight_parts.append(
            f"{len(anomalies)} unusual transaction(s) detected compared to your normal behavior."
        )

    if profit > 0:
        insight_parts.append(
            "Overall financial position is positive."
        )

    ai_summary = " ".join(insight_parts)

    return {
        "user_id": user_id,
        "financial_summary": {
            "total_income": total_income,
            "total_expense": total_expense,
            "profit": profit
        },
        "statistics": {
            "average_transaction": round(avg, 2),
            "standard_deviation": round(stdev, 2),
            "max_transaction": max_txn,
            "min_transaction": min_txn
        },
        "risk_analysis": {
            "dominant_category": dominant_category,
            "dominance_ratio": round(dominance_ratio, 2),
            "anomaly_count": len(anomalies)
        },
        "signals": signals,
        "ai_insight": ai_summary
    }