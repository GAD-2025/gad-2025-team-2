from sqlmodel import SQLModel, create_engine, Session
from typing import Generator
import os
from dotenv import load_dotenv

load_dotenv()

def _build_database_url() -> str:
    """
    Build DB URL from split env vars if provided, otherwise fall back to DATABASE_URL
    or local sqlite.
    Expected envs: DB_HOST, DB_NAME, DB_USER, DB_PASSWORD, (optional) DB_PORT.
    """
    # Split env vars preferred
    db_host = os.getenv("DB_HOST")
    db_name = os.getenv("DB_NAME")
    db_user = os.getenv("DB_USER")
    db_password = os.getenv("DB_PASSWORD")
    db_port = os.getenv("DB_PORT")  # optional; host may already include port

    if all([db_host, db_name, db_user, db_password]):
        host_with_port = f"{db_host}:{db_port}" if db_port else db_host
        return f"mysql+pymysql://{db_user}:{db_password}@{host_with_port}/{db_name}"

    # Fallback to full URL if provided
    return os.getenv("DATABASE_URL", "sqlite:///./workfair.db")


DATABASE_URL = _build_database_url()

connect_args = {}
pool_args = {}

if "sqlite" in DATABASE_URL:
    connect_args["check_same_thread"] = False
elif "mysql" in DATABASE_URL or "mariadb" in DATABASE_URL:
    connect_args['connect_timeout'] = 20
    pool_args['pool_recycle'] = 1800
    pool_args['pool_pre_ping'] = True

engine = create_engine(
    DATABASE_URL,
    echo=False,
    connect_args=connect_args,
    **pool_args
)


def create_db_and_tables():
    """Create all tables in the database"""
    try:
        SQLModel.metadata.create_all(engine)
    except Exception as e:
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        print("ERROR: Could not connect to the database and create tables.")
        print(f"DETAILS: {e}")
        print("Please check your '.env' file and ensure DB_HOST/DB_NAME/DB_USER/DB_PASSWORD (or DATABASE_URL) are correct.")
        print("Also, ensure the database server is running and accessible from the application.")
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        # Re-raise the exception to ensure the application startup fails loudly
        raise


def get_engine():
    """Return the SQLAlchemy engine used by the application."""
    return engine


def get_session() -> Generator[Session, None, None]:
    """Dependency to get database session"""
    with Session(engine) as session:
        yield session