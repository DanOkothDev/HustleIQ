from fastapi import APIRouter
from app.models.schemas import MessageInput
from app.services.parser import parse_transaction
from app.database.connection import transactions_collection

router = APIRouter()

@router.post("/webhook")
async def webhook(data: MessageInput):

    parsed = parse_transaction(data.message)

    record = {
        "user_id": data.user_id,
        "message": data.message,
        "type": parsed["type"],
        "amount": parsed["amount"],
        "category": parsed["category"]
    }

    result = transactions_collection.insert_one(record)

    return {
        "status": "success",
        "inserted_id": str(result.inserted_id),
        "data": parsed
    }