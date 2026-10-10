"""Deterministic educational responses; no external AI service is used."""


def disaster_bot_reply(message: str) -> str:
    message = message.lower()
    if "earthquake" in message:
        return "During an earthquake: Drop, Cover, and Hold. Stay away from windows."
    if "flood" in message:
        return "Move to higher ground immediately. Avoid walking in flood water."
    if "fire" in message:
        return "Use stairs, not elevators. Cover nose with cloth."
    return "Stay calm and follow official disaster guidelines."
