import re

def parse_transaction(text: str):
    text_lower = str(text).lower()

    amount_match = re.search(
        r"([0-9]{1,3}(?:,[0-9]{3})*(?:\.\d+)?|[0-9]+(?:\.\d+)?)([km]?)",
        text_lower,
    )

    amount = 0.0
    if amount_match:
        amount_text = amount_match.group(1).replace(",", "")
        suffix = amount_match.group(2)
        try:
            amount = float(amount_text)
        except ValueError:
            amount = 0.0

        if suffix == "k":
            amount *= 1000
        elif suffix == "m":
            amount *= 1000000

    amount = round(amount, 2)

    if any(word in text_lower for word in ("bought", "paid", "spent", "withdraw")):
        txn_type = "expense"
    elif any(word in text_lower for word in ("sold", "earned", "received", "income", "deposit")):
        txn_type = "income"
    else:
        txn_type = "unknown"

    if "stock" in text_lower:
        category = "stock"
    elif "transport" in text_lower:
        category = "transport"
    elif "shirt" in text_lower or "sale" in text_lower:
        category = "sales"
    elif "rent" in text_lower:
        category = "rent"
    elif "salary" in text_lower:
        category = "salary"
    else:
        category = "general"

    return {
        "type": txn_type,
        "amount": amount,
        "category": category,
        "raw_text": text_lower,
    }
