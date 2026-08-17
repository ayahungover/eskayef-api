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

    # PostgreSQL — authentication database
    pg_host: str = Field(default="localhost", description="PostgreSQL host")
    pg_port: int = Field(default=5432, description="PostgreSQL port")
    pg_name: str = Field(default="erp_auth", description="Auth database name")
    pg_user: str = Field(default="postgres", description="PostgreSQL user")
    pg_password: str = Field(default="", description="PostgreSQL password")
    
    
    # MariaDB — vendor bids database
    mariadb_host: str = Field(default="localhost", description="MariaDB host")
    mariadb_port: int = Field(default=3306, description="MariaDB port")
    mariadb_name: str = Field(default="eskabidc_api", description="MariaDB database name")
    mariadb_user: str = Field(default="", description="MariaDB user")
    mariadb_password: str = Field(default="", description="MariaDB password")
    
    commercial_db_server: str = Field(default="localhost")
    commercial_db_name: str = Field(default="master")
    commercial_db_user: str = Field(default="")
    commercial_db_password: str = Field(default="")
    commercial_db_driver: str = Field(default="ODBC Driver 18 for SQL Server")
    commercial_db_trust_server_certificate: bool = Field(default=True)    

    # JWT
    jwt_secret_key: str = Field(default="changeme", description="JWT signing secret")
    jwt_algorithm: str = Field(default="HS256", description="JWT signing algorithm")
    jwt_expire_minutes: int = Field(default=60, description="Token expiry in minutes")

    # Superadmin — hardcoded, bypasses group checks
    superadmin_username: str = Field(default="superadmin")
    superadmin_password: str = Field(default="mysecret")
    
    api_title: str = "Eskayef API"
    api_version: str = "0.1.0"
    debug: bool = True

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

    @property
    def auth_database_url(self) -> str:
        """
        SQLAlchemy URL for PostgreSQL authentication database.
        """
        password = quote_plus(self.pg_password)
        return (
            f"postgresql+psycopg2://{self.pg_user}:{password}"
            f"@{self.pg_host}:{self.pg_port}/{self.pg_name}"
        )
    
    @property
    def mariadb_url(self) -> str:
        """
        SQLAlchemy URL for MariaDB vendor bids database.
        """
        password = quote_plus(self.mariadb_password)
        return (
            f"mysql+pymysql://{self.mariadb_user}:{password}"
            f"@{self.mariadb_host}:{self.mariadb_port}/{self.mariadb_name}"
        )
    @property
    def commercial_database_url(self) -> str:
        password = quote_plus(self.commercial_db_password)
        driver = quote_plus(self.commercial_db_driver)
        query_parts = [f"driver={driver}"]
        if self.commercial_db_trust_server_certificate:
            query_parts.append("TrustServerCertificate=yes")
        query = "&".join(query_parts)
        return (
            f"mssql+pyodbc://{self.commercial_db_user}:{password}"
            f"@{self.commercial_db_server}/{self.commercial_db_name}?{query}"
        )

@lru_cache
def get_settings() -> Settings:
    """Load settings once per process (handy for tests and FastAPI lifespan)."""
    return Settings()


settings = get_settings()



print(f"DEBUG db_server={settings.db_server} db_name={settings.db_name}")
'''import os
print(f"DEBUG cwd: {os.getcwd()}")
print(f"DEBUG env file exists: {os.path.exists('.env')}")
print(f"DEBUG raw env value: {os.getenv('JWT_EXPIRE_MINUTES')}")
print(f"DEBUG parsed value: {settings.jwt_expire_minutes}")'''