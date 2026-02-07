from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .db import engine
from .schemas import Base 
from .routers import users,diary,auth,todos,notes,goals
from .scheduler import scheduler
 

# origins = [
#     "http://localhost:5173",      
#     "http://127.0.0.1:5173",      
# ]


origins = [
    "http://localhost:5173",
    "https://lumina-app-psi.vercel.app",
]

def create_db_and_tables():
    Base.metadata.create_all(engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    scheduler.start()
    yield
    scheduler.shutdown()

app = FastAPI(lifespan=lifespan)



app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(diary.router)
app.include_router(auth.router)
app.include_router(todos.router)
app.include_router(notes.router)
app.include_router(goals.router)

@app.get('/')
async def greet():
    return "Hello"









