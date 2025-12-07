from datetime import datetime, timezone, timedelta
import os
from typing import Annotated

from dotenv import load_dotenv
from fastapi import Depends, status, HTTPException, APIRouter
from fastapi.security import (
    OAuth2PasswordRequestForm,
    HTTPBearer,
    HTTPAuthorizationCredentials,
)
from sqlalchemy.orm import Session
from pwdlib import PasswordHash
import jwt
from jwt import PyJWTError

from ..db import get_session, SessionDep
from ..models import Token, TokenData, CreateUser, ReturnUser
from ..schemas import User

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

if not SECRET_KEY or not ALGORITHM or not ACCESS_TOKEN_EXPIRE_MINUTES:
    raise RuntimeError("Auth environment variables are not set properly")

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

password_hash = PasswordHash.recommended()
bearer_scheme = HTTPBearer()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_hash.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return password_hash.hash(password)


def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()


def authenticate_user(username: str, password: str, db: Session) -> User | None:
    db_user = db.query(User).filter(User.username == username).first()
    if not db_user:
        return None
    if not verify_password(password, db_user.hashed_password):
        return None
    return db_user


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(bearer_scheme)],
    db: Session = Depends(get_session),
):
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        sub = payload.get("sub")
        if sub is None:
            raise credentials_exception
        token_data = TokenData(id=sub)
    except PyJWTError:
        raise credentials_exception

    try:
        user_id = int(token_data.id)
    except (TypeError, ValueError):
        raise credentials_exception

    user = get_user_by_id(db, user_id=user_id)
    if user is None:
        raise credentials_exception
    return user


UserDep = Annotated[User, Depends(get_current_user)]
FormDep = Annotated[OAuth2PasswordRequestForm, Depends()]


@router.post("/register", response_model=ReturnUser, status_code=status.HTTP_201_CREATED)
async def create_user(user: CreateUser, db: SessionDep):
    db_user = User(
        hashed_password=get_password_hash(user.password),
        email=user.email,
        username=user.username,
        role=user.role,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.post("/login", response_model=Token, status_code=status.HTTP_200_OK)
async def login(form_data: FormDep, db: SessionDep):
    user = authenticate_user(
        username=form_data.username,
        password=form_data.password,
        db=db,
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=access_token_expires,
    )
    return Token(access_token=access_token, token_type="bearer")
