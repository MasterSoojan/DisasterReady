import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool
from app.database import Base, get_db
from app.main import create_app
from app.models import ChatMessage
from app.services.chat import disaster_bot_reply


@pytest.fixture
def client():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(engine)
    app = create_app(initialize_database=False)

    def database():
        with Session(engine) as session:
            yield session

    app.dependency_overrides[get_db] = database
    with TestClient(app) as client:
        yield client, engine
    engine.dispose()


def test_chat_persists_and_validates(client):
    http, engine = client
    response = http.post("/chat", json={"message": "EARTHQUAKE advice"})
    assert response.status_code == 200
    assert "Drop, Cover" in response.json()["bot_response"]
    with Session(engine) as session:
        assert len(session.scalars(select(ChatMessage)).all()) == 1
    for payload in ({"message": ""}, {"message": " "}, {"message": "x" * 4001}, {}):
        assert http.post("/chat", json=payload).status_code == 422


def test_health_quiz_and_error_routes(client):
    http, _ = client
    assert http.get("/").json()["status"] == "ok"
    assert http.get("/quiz/flood").json() == {"quiz": "Flood quiz data here"}
    assert http.get("/missing").status_code == 404
    assert http.post("/chat", content="{").status_code == 422


def test_rule_fallbacks():
    assert "higher ground" in disaster_bot_reply("Flood")
    assert "stairs" in disaster_bot_reply("fire")
    assert "official" in disaster_bot_reply("hello")


def test_startup_initialization_and_cors(monkeypatch):
    import app.main as main

    calls = []
    monkeypatch.setattr(main, "init_db", lambda: calls.append("initialized"))
    with TestClient(main.create_app()) as http:
        assert calls == ["initialized"]
        allowed = http.options(
            "/chat",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "POST",
            },
        )
        assert allowed.headers["access-control-allow-origin"] == "http://localhost:3000"
        denied = http.options(
            "/chat",
            headers={
                "Origin": "https://untrusted.example",
                "Access-Control-Request-Method": "POST",
            },
        )
        assert denied.status_code == 400
        assert "access-control-allow-origin" not in denied.headers
