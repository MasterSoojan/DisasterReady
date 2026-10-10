from fastapi import APIRouter

router = APIRouter()


@router.get("/flood")
async def get_flood_quiz():
    return {"quiz": "Flood quiz data here"}
