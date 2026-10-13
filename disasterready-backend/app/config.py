"""Environment configuration. SQLite defaults to the backend working directory."""

import os
import re
from ipaddress import IPv6Address
from urllib.parse import urlsplit

from sqlalchemy.engine import make_url
from sqlalchemy.exc import ArgumentError


def database_url(value):
    """Validate syntax only; do not connect or expose a potentially secret DSN."""
    value = value.strip()
    try:
        make_url(value)
    except (ArgumentError, ValueError):
        # Parser errors may contain the original input, including credentials.
        # Keep the setting name actionable without printing its value or cause.
        raise ValueError("DATABASE_URL must be a valid SQLAlchemy URL.") from None
    return value


def cors_origins(value):
    """Accept explicit HTTP origins; an empty setting disables cross-origin use."""
    if not value.strip():
        return []
    result = []
    for entry in value.split(","):
        origin = entry.strip()
        try:
            parsed = urlsplit(origin)
            host, port = parsed.hostname, parsed.port
            if (
                not origin
                or any(
                    character.isspace() or ord(character) < 32 or ord(character) == 127
                    for character in origin
                )
                or any(character in origin for character in "*\\%?#")
                or parsed.scheme not in ("http", "https")
                or not host
                or parsed.username is not None
                or parsed.password is not None
                or parsed.path not in ("", "/")
            ):
                raise ValueError
            # Browsers serialize Origin without a slash or default port. Match
            # that form, otherwise a harmless config variation silently blocks
            # the intended frontend. IPv6 needs brackets when reassembling it.
            if ":" in host:
                hostname = f"[{IPv6Address(host).compressed}]"
            else:
                hostname = host.encode("idna").decode("ascii")
                if len(hostname) > 253 or not all(
                    re.fullmatch(r"[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?", label)
                    for label in hostname.removesuffix(".").split(".")
                ):
                    raise ValueError
            default_port = 80 if parsed.scheme == "http" else 443
            suffix = f":{port}" if port is not None and port != default_port else ""
            normalized = f"{parsed.scheme}://{hostname}{suffix}"
        except (ValueError, UnicodeError):
            # Never repair a wildcard or drop an invalid entry: failing startup
            # makes a mistaken allowlist visible before the API can serve it.
            raise ValueError(
                "CORS_ORIGINS must contain comma-separated HTTP(S) origins "
                "without wildcards, credentials, paths, queries or fragments."
            ) from None
        if normalized not in result:
            result.append(normalized)
    return result


DATABASE_URL = database_url(os.getenv("DATABASE_URL", "sqlite:///./disaster.db"))
CORS_ORIGINS = cors_origins(
    os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
)
