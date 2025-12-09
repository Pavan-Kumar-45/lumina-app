from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from datetime import date
from .schemas import User, Todo 
from .email_utils import send_reminder_email 
import os

DB_STRING = os.getenv("DB")
engine = create_engine(DB_STRING)
SessionLocal = sessionmaker(bind=engine)

async def send_daily_reminders():
    db = SessionLocal()
    try:
        users = db.query(User).filter(User.notifications_enabled == True).all()
        today = date.today()
        for user in users:
            pending_count = db.query(Todo).filter((Todo.user_id == user.id) & (Todo.status == False)).count()
            
            if pending_count > 0:
                print(f"Sending reminder to {user.email} about {pending_count} pending todos.")
                await send_reminder_email(user.email,  user.username , pending_count)
    except Exception as e:
        print(f"Error sending reminders: {e}")
    finally:
        db.close()

scheduler = AsyncIOScheduler(timezone='Asia/Kolkata')
scheduler.add_job(send_daily_reminders, 'cron', hour=8, minute=0)
# scheduler.add_job(send_daily_reminders, 'cron', hour=1, minute=30)
scheduler.add_job(send_daily_reminders, 'interval', minutes=1)