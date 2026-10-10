from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import init_db
from .config import CORS_ORIGINS
from .chat_routes import router as chat_router
from .quiz_routes import router as quiz_router


def create_app(*, initialize_database=True):
    @asynccontextmanager
    async def lifespan(app):
        if initialize_database:
            init_db()
        yield

    app = FastAPI(title="DisasterReady API", lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=CORS_ORIGINS,
        allow_credentials=False,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type"],
    )

    @app.get("/")
    def health():
        return {"status": "ok"}

    app.include_router(chat_router)
    app.include_router(quiz_router, prefix="/quiz", tags=["Quiz"])
    return app


app = create_app()
