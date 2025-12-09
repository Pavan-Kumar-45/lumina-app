import os
import resend
from dotenv import load_dotenv
from pydantic import EmailStr

load_dotenv()

resend.api_key = os.getenv("RESEND_API_KEY")

async def send_otp_email(email: EmailStr, otp: str):
    params = {
        "from": "Lumina <onboarding@resend.dev>",
        "to": [email],
        "subject": "Lumina Verification Code",
        "html": f"<h3>Your verification code is: {otp}</h3><p>Enter this in the app settings to enable notifications.</p>",
    }
    resend.Emails.send(params)

async def send_reminder_email(email: EmailStr, username: str, task_count: int):
    app_link = "https://lumina-app-psi.vercel.app/"
    
    html_content = f"""
    <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: 1px;">✨ Lumina</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px; font-weight: 600;">Hello {username} 👋</h2>
                            <p style="margin: 0 0 25px 0; color: #555555; font-size: 16px; line-height: 1.6;">
                                You have <span style="display: inline-block; background-color: #667eea; color: #ffffff; padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 18px;">{task_count}</span> tasks pending for today.
                            </p>
                            <table cellpadding="0" cellspacing="0" border="0" style="margin: 30px 0;">
                                <tr>
                                    <td align="center" style="border-radius: 6px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                                        <a href="{app_link}" style="display: inline-block; padding: 16px 40px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; letter-spacing: 0.5px;">Open Lumina App →</a>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin: 25px 0 0 0; color: #666666; font-size: 15px; line-height: 1.6;">Log in to Lumina to clear them! 🚀</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                            <p style="margin: 0; color: #999999; font-size: 13px;">© 2024 Lumina. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
    </body>
    """

    params = {
        "from": "Lumina <onboarding@resend.dev>",
        "to": [email],
        "subject": "Lumina Daily Task Reminder",
        "html": html_content,
    }
    resend.Emails.send(params)