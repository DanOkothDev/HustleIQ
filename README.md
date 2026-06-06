# HustleIQ

## WhatsApp Cloud API Integration

This backend now supports WhatsApp ingestion through Meta Webhooks.

1. Create a Meta Developer app and add WhatsApp.
2. Set `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, and `META_APP_SECRET` in `.env`.
3. Expose your local FastAPI server via ngrok and use `https://<ngrok-id>.ngrok-free.app/whatsapp/webhook` as the webhook URL in Meta.
4. A `GET /whatsapp/webhook` request is used for webhook verification, and `POST /whatsapp/webhook` receives incoming messages.

The backend maps incoming WhatsApp sender numbers to registered users using the stored `phone_number` field, parses text messages into transactions, stores them in MongoDB, and sends confirmation replies.
