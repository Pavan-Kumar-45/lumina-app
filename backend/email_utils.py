import os 
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from dotenv import load_dotenv
from pydantic import EmailStr
 
load_dotenv()

 
conf = ConnectionConfig(
    MAIL_USERNAME = os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_USERNAME"),
    MAIL_PORT=465,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=False,
    MAIL_SSL_TLS=True,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
) 

async def send_otp_email(email: EmailStr, otp: str):
    print(f"Attempting to send OTP to {email}...")
    message = MessageSchema(
        subject="Lumina Verification Code",
        recipients=[email],
        body=f"<h3>Your verification code is: {otp}</h3><p>Enter this in the app settings to enable notifications.</p>",
        subtype=MessageType.html
    )
    fm = FastMail(conf)
    await fm.send_message(message)

async def send_reminder_email(email: EmailStr,username: str, task_count:int): 
    message = MessageSchema(
        subject="Lumina Daily Task Reminder",
        recipients=[email],
        body=f"""
        <h3>Hello {username},</h3>
        <p>You have {task_count} tasks pending for today. Don't forget to complete them!</p>
        <p>Log in to Lumina to clear them!</p>
        """,
        subtype=MessageType.HTML
    )
    fm = FastMail(conf)
    await fm.send_message(message)