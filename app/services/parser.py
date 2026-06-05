import re

def parse_transaction(text: str):
    text = text.lower()

    
    amount_match = re.search(r"\d+", text)
    amount = int(amount_match.group()) if amount_match else 0

   
    if "bought" in text or "paid" in text or "spent" in text:
        txn_type = "expense"
    elif "sold" in text or "earned" in text or "received" in text:
        txn_type = "income"
    else:
        txn_type = "unknown"

   
    if "stock" in text:
        category = "stock"
    elif "transport" in text:
        category = "transport"
    elif "shirt" in text:
        category = "sales"
    else:
        category = "general"

    return {
        "type": txn_type,
        "amount": amount,
        "category": category,
        "raw_text": text
    }