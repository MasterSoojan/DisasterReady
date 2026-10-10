from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from . import models, schemas
from .database import get_db
from .services.chat import disaster_bot_reply

router = APIRouter()


@router.post("/chat", response_model=schemas.ChatResponse)
def chat(message: schemas.ChatRequest, db: Session = Depends(get_db)):
    reply = disaster_bot_reply(message.message)
    db.add(models.ChatMessage(user_message=message.message, bot_response=reply))
    db.commit()
    return {"user_message": message.message, "bot_response": reply}
