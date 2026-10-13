"""Configuration must fail locally before an app can serve or initialize tables."""

import importlib
import os
import subprocess
import sys
from pathlib import Path

import pytest
from app import config


@pytest.fixture
def settings(monkeypatch):
    # Restore both the environment and cached settings, so another test cannot
    # inherit the last invalid/temporary configuration from a module reload.
    try:
        with monkeypatch.context() as environment:
            environment.delenv("DATABASE_URL", raising=False)
            environment.delenv("CORS_ORIGINS", raising=False)
            yield environment
    finally:
        importlib.reload(config)


@pytest.mark.parametrize(
    "setting,value",
    [
        ("CORS_ORIGINS", "https://user:private-value@example.test"),
        ("DATABASE_URL", "postgresql://user:private-value@host:invalid/db"),
    ],
)
def test_invalid_setting_stops_startup_without_secret_traceback(tmp_path, setting, value):
    database = tmp_path / "must-not-be-created.db"
    environment = {
        **os.environ,
        "DATABASE_URL": f"sqlite:///{database}",
        "CORS_ORIGINS": "http://localhost:3000",
        setting: value,
    }
    startup = subprocess.run(
        [sys.executable, "-c", "from app.main import app"],
        cwd=Path(__file__).resolve().parents[1],
        env=environment,
        capture_output=True,
        check=False,
        text=True,
        timeout=10,
    )
    assert startup.returncode != 0
    assert setting in startup.stderr
    assert "private-value" not in startup.stdout + startup.stderr
    assert not database.exists()


@pytest.mark.parametrize(
    "value",
    [
        "*",
        "https://*.example.test",
        "example.test",
        "ftp://example.test",
        "https://user:private-value@example.test",
        "https://example.test/chat",
        "https://example.test?token=private-value",
        "https://example.test#fragment",
        "http://localhost:invalid",
        "http://localhost:70000",
        "https://bad host.test",
        "https://bad^host.test",
        "https://-invalid.test",
        "https://example..test",
        "https://example.test..",
        "https://example.test\x7f",
        "https://example.test\n.evil.test",
        "https://example.test,",
    ],
)
def test_invalid_origins_fail_without_echoing_configuration(settings, value):
    # Reload the actual environment boundary, rather than only testing a helper
    # that startup might accidentally bypass. Restore module globals afterward.
    settings.setenv("CORS_ORIGINS", value)
    with pytest.raises(ValueError, match="CORS_ORIGINS") as failure:
        importlib.reload(config)
    assert value not in str(failure.value)
    assert "private-value" not in str(failure.value)


@pytest.mark.parametrize(
    "value",
    ["", "  ", "private-value-not-a-url", "postgresql://user:private-value@host:invalid/db"],
)
def test_invalid_database_url_fails_without_echoing_credentials(settings, value):
    settings.setenv("DATABASE_URL", value)
    with pytest.raises(ValueError, match="DATABASE_URL") as failure:
        importlib.reload(config)
    assert "private-value" not in str(failure.value)


def test_explicit_origins_are_enforced_by_the_app(monkeypatch):
    from app import main
    from fastapi.testclient import TestClient

    monkeypatch.setattr(
        main, "CORS_ORIGINS", config.cors_origins("HTTPS://EXAMPLE.TEST:443/")
    )
    with TestClient(main.create_app(initialize_database=False)) as http:
        for origin, allowed in (
            ("https://example.test", True),
            ("https://example.test.evil.test", False),
            ("http://example.test", False),
            ("null", False),
        ):
            response = http.options(
                "/chat",
                headers={"Origin": origin, "Access-Control-Request-Method": "POST"},
            )
            assert response.status_code == (200 if allowed else 400)
            assert response.headers.get("access-control-allow-origin") == (
                origin if allowed else None
            )

    monkeypatch.setattr(main, "CORS_ORIGINS", config.cors_origins(""))
    with TestClient(main.create_app(initialize_database=False)) as http:
        assert http.get("/").status_code == 200
        response = http.options(
            "/chat",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "POST",
            },
        )
        assert response.status_code == 400
        assert "access-control-allow-origin" not in response.headers


def test_defaults_and_explicit_origin_normalization(settings):
    importlib.reload(config)
    assert config.DATABASE_URL == "sqlite:///./disaster.db"
    assert config.CORS_ORIGINS == [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    settings.setenv(
        "CORS_ORIGINS",
        " HTTPS://EXAMPLE.TEST:443/ ,http://[::1]:3000,https://example.test",
    )
    settings.setenv("DATABASE_URL", " sqlite:// ")
    importlib.reload(config)
    assert config.CORS_ORIGINS == [
        "https://example.test",
        "http://[::1]:3000",
    ]
    assert config.DATABASE_URL == "sqlite://"
    settings.setenv("CORS_ORIGINS", "")
    importlib.reload(config)
    assert config.CORS_ORIGINS == []
