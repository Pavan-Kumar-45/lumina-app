# tests/conftest.py


# tests/conftest.py

import os
import sys

# Add project root (the folder that contains "backend") to sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(CURRENT_DIR)
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

# Set env vars so auth router doesn't explode
os.environ.setdefault("SECRET_KEY", "test_secret_key_for_testing_only")
os.environ.setdefault("ALGORITHM", "HS256")
os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "30")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.main import app
from backend.schemas import Base
from backend.db import get_session


# Use a separate SQLite DB just for tests
TEST_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    TEST_DATABASE_URL, connect_args={"check_same_thread": False}
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def override_get_session():
    """Override database session for testing"""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


# Override the app's DB dependency
app.dependency_overrides[get_session] = override_get_session


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Setup and teardown test database"""
    # Create tables before any tests
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    # Drop tables after tests if you want a clean slate
    Base.metadata.drop_all(bind=engine)
    
    # Clean up test database file
    if os.path.exists("test.db"):
        try:
            os.remove("test.db")
        except:
            pass


@pytest.fixture
def client():
    """Provide test client for each test"""
    with TestClient(app) as c:
        yield c


@pytest.fixture
def db_session():
    """Provide database session for tests that need direct DB access"""
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def clean_db():
    """Clean all tables between tests if needed"""
    session = TestingSessionLocal()
    try:
        # Truncate all tables
        for table in reversed(Base.metadata.sorted_tables):
            session.execute(table.delete())
        session.commit()
    finally:
        session.close()

