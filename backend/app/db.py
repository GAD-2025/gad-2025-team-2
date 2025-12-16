from sqlmodel import SQLModel, create_engine, Session
from typing import Generator
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./workfair.db")

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
        print(f"ERROR: Could not connect to the database and create tables.")
        print(f"DETAILS: {e}")
        print("Please check your '.env' file and ensure the DATABASE_URL is correct.")
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