from pydantic import BaseModel

class MessageInput(BaseModel):
    message: str
    user_id: str