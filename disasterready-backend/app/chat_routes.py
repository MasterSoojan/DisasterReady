from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from . import models, schemas
from .database import SessionLocal

router = APIRouter()

# Database Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def disaster_bot_reply(message: str):
    message = message.lower()

    if "earthquake" in message:
        return "During an earthquake: Drop, Cover, and Hold. Stay away from windows."
    elif "flood" in message:
        return "Move to higher ground immediately. Avoid walking in flood water."
    elif "fire" in message:
        return "Use stairs, not elevators. Cover nose with cloth."
    else:
        return "Stay calm and follow official disaster guidelines."


@router.post("/chat")
def chat(message: schemas.ChatRequest, db: Session = Depends(get_db)):

    bot_reply = disaster_bot_reply(message.message)

    chat_entry = models.ChatMessage(
        user_message=message.message,
        bot_response=bot_reply
    )

    db.add(chat_entry)
    db.commit()
    db.refresh(chat_entry)

    return {
        "user_message": message.message,
        "bot_response": bot_reply
    }
