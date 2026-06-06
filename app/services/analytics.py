from collections import defaultdict
from datetime import datetime
import statistics
import re


def _parse_date(value):
    if isinstance(value, datetime):
        return value.date().isoformat()

    if isinstance(value, str):
        for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
            try:
                return datetime.strptime(value[:19], fmt).date().isoformat()
            except ValueError:
                continue

    return datetime.utcnow().date().isoformat()


def _filter_transactions(transactions):
    normalized = []
    for txn in transactions:
        txn_type = str(txn.get("type", "")).lower()
        if txn_type not in ("income", "expense"):
            continue

        amount = txn.get("amount", 0)
        try:
            amount = float(amount)
        except (TypeError, ValueError):
            continue

        normalized.append({
            "type": txn_type,
            "amount": amount,
            "category": str(txn.get("category", "unknown") or "unknown").lower(),
            "date": txn.get("date")
        })

    return normalized


def compute_financial_overview(transactions):
    valid = _filter_transactions(transactions)
    amounts = [item["amount"] for item in valid]

    total_income = sum(item["amount"] for item in valid if item["type"] == "income")
    total_expense = sum(item["amount"] for item in valid if item["type"] == "expense")
    profit = total_income - total_expense

    categories = defaultdict(float)
    for item in valid:
        categories[item["category"]] += item["amount"]

    transactions_count = len(valid)
    average_transaction = statistics.mean(amounts) if amounts else 0
    volatility = statistics.stdev(amounts) if len(amounts) > 1 else 0

    top_category = None
    top_category_ratio = 0
    if categories and sum(categories.values()) > 0:
        top_category = max(categories, key=categories.get)
        total_category_amount = sum(categories.values())
        top_category_ratio = categories[top_category] / total_category_amount

    return {
        "transactions_count": transactions_count,
        "total_income": round(total_income, 2),
        "total_expense": round(total_expense, 2),
        "profit": round(profit, 2),
        "average_transaction": round(average_transaction, 2),
        "volatility": round(volatility, 2),
        "categories": dict(categories),
        "top_category": top_category or "unknown",
        "top_category_ratio": round(top_category_ratio, 4)
    }


def build_cashflow_series(transactions):
    valid = _filter_transactions(transactions)
    date_map = defaultdict(lambda: {"income": 0.0, "expenses": 0.0})

    for txn in valid:
        date_key = _parse_date(txn.get("date"))
        if txn["type"] == "income":
            date_map[date_key]["income"] += txn["amount"]
        else:
            date_map[date_key]["expenses"] += txn["amount"]

    return [
        {"month": date_key, "income": round(vals["income"], 2), "expenses": round(vals["expenses"], 2)}
        for date_key, vals in sorted(date_map.items())
    ]


def build_expense_breakdown(transactions):
    valid = _filter_transactions(transactions)
    expense_map = defaultdict(float)
    for txn in valid:
        if txn["type"] == "expense":
            expense_map[txn["category"]] += txn["amount"]

    breakdown = [
        {"name": name, "value": round(amount, 2)}
        for name, amount in sorted(expense_map.items(), key=lambda x: x[1], reverse=True)
    ]
    return breakdown


def build_insight_cards(transactions):
    summary = compute_financial_overview(transactions)
    cards = []

    if summary["transactions_count"] == 0:
        return [{"text": "No financial data is available yet.", "type": "info", "severity": "neutral"}]

    if summary["profit"] < 0:
        cards.append({"text": "Your expenses exceed income.", "type": "alert", "severity": "negative"})
    else:
        cards.append({"text": "You are currently profitable.", "type": "opportunity", "severity": "positive"})

    if summary["top_category"]:
        cards.append({
            "text": f"Most activity is categorized as '{summary['top_category']}'.",
            "type": "info",
            "severity": "neutral"
        })

    if summary["volatility"] > summary["average_transaction"] * 0.8 and summary["average_transaction"] > 0:
        cards.append({"text": "Your cashflow is volatile and could benefit from more consistency.", "type": "warning", "severity": "warning"})

    if summary["total_expense"] > summary["total_income"] * 0.8 and summary["total_income"] > 0:
        cards.append({"text": "Expenses are close to income. Keep an eye on cashflow.", "type": "warning", "severity": "warning"})

    return cards


def build_risk_profile(transactions):
    summary = compute_financial_overview(transactions)
    if summary["transactions_count"] == 0:
        return {
            "score": 0,
            "level": "unknown",
            "description": "No data available.",
            "factors": []
        }

    score = 0
    factors = []

    if summary["profit"] < 0:
        score += 30
        factors.append({"name": "Negative cashflow", "value": 30})

    if summary["volatility"] > summary["average_transaction"] * 0.8 and summary["average_transaction"] > 0:
        score += 20
        factors.append({"name": "High volatility", "value": 20})

    if summary["top_category_ratio"] > 0.7:
        score += 25
        factors.append({"name": "Category dependence", "value": 25})

    if summary["total_expense"] > 5000:
        score += 15
        factors.append({"name": "Large expenditures recorded", "value": 15})

    score = min(100, score)

    if score < 30:
        level = "low"
    elif score < 70:
        level = "medium"
    else:
        level = "high"

    if score == 0:
        description = "Financial behavior is currently stable."
    else:
        description = " ".join([f["name"] + "." for f in factors])

    return {
        "score": score,
        "level": level,
        "description": description,
        "factors": factors
    }


def parse_amount(text: str):
    normalized = str(text).lower().replace(" ", "")
    match = re.search(r"([0-9]{1,3}(?:,[0-9]{3})*(?:\.\d+)?|[0-9]+(?:\.\d+)?)([km]?)", normalized)
    if not match:
        return 0.0

    amount_text = match.group(1).replace(",", "")
    suffix = match.group(2)
    try:
        amount = float(amount_text)
    except ValueError:
        return 0.0

    if suffix == "k":
        amount *= 1000
    elif suffix == "m":
        amount *= 1000000

    return round(amount, 2)
