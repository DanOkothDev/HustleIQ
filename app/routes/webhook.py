from datetime import datetime
import hashlib
import hmac
import json
import os
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from fastapi import APIRouter, HTTPException, Query, Request as FastAPIRequest
from fastapi.responses import PlainTextResponse

from app.database.connection import db, transactions_collection
from app.models.schemas import MessageInput
from app.services.parser import parse_transaction

router = APIRouter()
users_collection = db["users"]

WHATSAPP_VERIFY_TOKEN = os.getenv("WHATSAPP_VERIFY_TOKEN", "hustleiq_verify_token")
WHATSAPP_ACCESS_TOKEN = os.getenv("WHATSAPP_ACCESS_TOKEN")
WHATSAPP_PHONE_NUMBER_ID = os.getenv("WHATSAPP_PHONE_NUMBER_ID")
META_APP_SECRET = os.getenv("META_APP_SECRET")
META_GRAPH_VERSION = os.getenv("META_GRAPH_VERSION", "17.0")


def normalize_phone(phone: str) -> str:
    if not phone:
        return ""

    return "".join([c for c in phone if c.isdigit()])


def verify_meta_signature(raw_body: bytes, signature_header: str) -> bool:
    if not META_APP_SECRET:
        return True

    if not signature_header:
        return False

    expected_signature = hmac.new(
        META_APP_SECRET.encode("utf-8"), raw_body, hashlib.sha256
    ).hexdigest()

    if signature_header.startswith("sha256="):
        signature_value = signature_header.split("=", 1)[1]
    else:
        signature_value = signature_header

    return hmac.compare_digest(signature_value, expected_signature)


def send_whatsapp_message(to_number: str, message: str):
    if not WHATSAPP_ACCESS_TOKEN or not WHATSAPP_PHONE_NUMBER_ID:
        return None

    endpoint = f"https://graph.facebook.com/v{META_GRAPH_VERSION}/{WHATSAPP_PHONE_NUMBER_ID}/messages"
    body = json.dumps({
        "messaging_product": "whatsapp",
        "to": to_number,
        "type": "text",
        "text": {"body": message},
    }).encode("utf-8")

    request = Request(
        endpoint,
        data=body,
        headers={
            "Authorization": f"Bearer {WHATSAPP_ACCESS_TOKEN}",
            "Content-Type": "application/json",
        },
    )

    try:
        with urlopen(request, timeout=15) as response:
            response_text = response.read().decode("utf-8")
            return json.loads(response_text)
    except HTTPError as exc:
        try:
            error_text = exc.read().decode("utf-8")
        except Exception:
            error_text = str(exc)
        print(f"WhatsApp send error: {error_text}")
    except URLError as exc:
        print(f"WhatsApp send network error: {exc}")
    except Exception as exc:
        print(f"WhatsApp send unexpected error: {exc}")

    return None


@router.get("/whatsapp/webhook")
async def whatsapp_verify(
    mode: str = Query(None, alias="hub.mode"),
    verify_token: str = Query(None, alias="hub.verify_token"),
    challenge: str = Query(None, alias="hub.challenge"),
):
    if mode == "subscribe" and verify_token == WHATSAPP_VERIFY_TOKEN:
        return PlainTextResponse(challenge)

    raise HTTPException(status_code=403, detail="Webhook verification failed.")


@router.post("/whatsapp/webhook")
async def whatsapp_event(request: FastAPIRequest):
    raw_body = await request.body()
    signature_header = request.headers.get("x-hub-signature-256")

    if not verify_meta_signature(raw_body, signature_header):
        raise HTTPException(status_code=403, detail="Invalid webhook signature.")

    payload = await request.json()
    entries = payload.get("entry", [])
    saved = []

    for entry in entries:
        for change in entry.get("changes", []):
            value = change.get("value", {})
            messages = value.get("messages", [])

            for message in messages:
                text_body = message.get("text", {}).get("body")
                sender_phone = message.get("from")
                if not text_body or not sender_phone:
                    continue

                normalized_sender = normalize_phone(sender_phone)
                user = users_collection.find_one(
                    {
                        "$or": [
                            {"phone_number": normalized_sender},
                            {"phone_number": f"+{normalized_sender}"},
                            {"phone_number": {"$regex": f"{normalized_sender}$"}},
                        ]
                    }
                )

                if not user:
                    continue

                parsed = parse_transaction(text_body)
                now = datetime.utcnow()

                record = {
                    "user_id": str(user["_id"]),
                    "phone_number": sender_phone,
                    "message": text_body,
                    "type": parsed["type"],
                    "amount": parsed["amount"],
                    "category": parsed["category"],
                    "raw_text": parsed.get("raw_text"),
                    "date": now,
                    "created_at": now,
                }

                transactions_collection.insert_one(record)
                saved.append(record)

                confirmation_text = (
                    f"Recorded {parsed['type']} of KES {parsed['amount']:.2f}. "
                    f"Category: {parsed['category']}"
                )
                send_whatsapp_message(sender_phone, confirmation_text)

    return {"status": "received", "records": len(saved)}


@router.post("/webhook")
async def webhook(data: MessageInput):

    parsed = parse_transaction(data.message)
    now = datetime.utcnow()

    record = {
        "user_id": data.user_id,
        "message": data.message,
        "type": parsed["type"],
        "amount": parsed["amount"],
        "category": parsed["category"],
        "date": now,
        "created_at": now
    }

    result = transactions_collection.insert_one(record)

    return {
        "status": "success",
        "inserted_id": str(result.inserted_id),
        "data": parsed
    }