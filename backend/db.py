from sqlalchemy import create_engine
import os 
from dotenv import load_dotenv
from sqlalchemy.orm import Session, sessionmaker
from typing import Annotated
from fastapi import Depends
load_dotenv() 

DB_STRING = os.getenv("DB") 

if not DB_STRING:
    raise RuntimeError("Database connection string 'DB' is not set in environment variables")

engine = create_engine(DB_STRING,pool_pre_ping=True)
SessionLocal = sessionmaker(
    autoflush=False,
    autocommit=False,
    bind=engine
)
def get_session():
    db : Session = SessionLocal() 
    try: 
        yield db 
    finally:
        db.close()

SessionDep = Annotated[Session, Depends(get_session)]

