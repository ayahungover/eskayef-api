"""
Application settings loaded from a `.env` file in the project root.

Environment variables (copy `.env.example` to `.env`):

- DB_SERVER — SQL Server hostname or IP
- DB_NAME — database name
- DB_USER / DB_PASSWORD — SQL login (SQL authentication)
- DB_DRIVER — ODBC driver name, e.g. "ODBC Driver 17 for SQL Server"
- DB_TRUST_SERVER_CERTIFICATE — "true"/"false" (helps with local dev TLS)
- CORS_ORIGINS — comma-separated browser origins for the React dev server (e.g. http://localhost:5173)
"""

from functools import lru_cache
from urllib.parse import quote_plus

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    db_server: str = Field(default="localhost", description="SQL Server host")
    db_name: str = Field(default="ERP", description="Database name")
    db_user: str = Field(default="sa", description="SQL login user")
    db_password: str = Field(default="", description="SQL login password")
    db_driver: str = Field(
        default="ODBC Driver 17 for SQL Server",
        description="Installed ODBC driver name",
    )
    db_trust_server_certificate: bool = Field(
        default=True,
        description="Trust server certificate (common for local SQL Server)",
    )

    api_title: str = "ERP API"
    api_version: str = "0.1.0"
    debug: bool = True

    # Comma-separated browser origins allowed to call this API (needed for the React dev server).
    # Example: http://127.0.0.1:5173,http://localhost:5173
    cors_origins: str = Field(
        default=(
            "http://127.0.0.1:5173,"
            "http://localhost:5173,"
            "http://127.0.0.1:4173,"
            "http://localhost:4173"
        ),
        description="Allowed CORS origins (comma-separated)",
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def database_url(self) -> str:
        """
        SQLAlchemy URL for SQL Server using the pyodbc driver.

        Format: mssql+pyodbc://USER:PASS@SERVER/DB?driver=...&...
        """
        password = quote_plus(self.db_password)
        driver = quote_plus(self.db_driver)

        query_parts = [f"driver={driver}"]
        if self.db_trust_server_certificate:
            query_parts.append("TrustServerCertificate=yes")

        query = "&".join(query_parts)

        return (
            f"mssql+pyodbc://{self.db_user}:{password}"
            f"@{self.db_server}/{self.db_name}?{query}"
        )


@lru_cache
def get_settings() -> Settings:
    """Load settings once per process (handy for tests and FastAPI lifespan)."""
    return Settings()


settings = get_settings()
