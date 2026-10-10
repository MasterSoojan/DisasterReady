from pydantic import BaseModel, Field, field_validator


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)

    @field_validator("message")
    @classmethod
    def non_blank(cls, value):
        if not value.strip():
            raise ValueError("Message must not be blank")
        return value


class ChatResponse(BaseModel):
    user_message: str
    bot_response: str
