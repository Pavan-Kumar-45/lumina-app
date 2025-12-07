from fastapi import APIRouter, HTTPException, status
from ..email_utils import send_otp_email
from ..models import (
    ReturnUser,
    UpdateEmail,
    UpdatePassword,
    UpdateUsername,
    UpdateRollover,
    ValidateEmail,
)
from ..schemas import User
from .auth import UserDep, get_password_hash
from ..db import SessionDep
import random 

router = APIRouter(
    prefix="/users/me",
    tags=["users"],
)

@router.get("/", status_code=status.HTTP_200_OK, response_model=ReturnUser)
async def getme(user: UserDep, db: SessionDep):
    db.refresh(user)
    return user

@router.put("/username", status_code=status.HTTP_200_OK, response_model=ReturnUser)
async def change_username(user: UserDep, db: SessionDep, user_model: UpdateUsername):
    user.username = user_model.username
    db.commit()
    db.refresh(user)
    return user

@router.put("/password", status_code=status.HTTP_200_OK, response_model=ReturnUser)
async def change_password(user: UserDep, db: SessionDep, user_model: UpdatePassword):
    user.hashed_password = get_password_hash(password=user_model.password)
    user.email_validated = False
    user.notifications_enabled = False
    db.commit()
    db.refresh(user)
    return user

@router.put("/email", status_code=status.HTTP_200_OK, response_model=ReturnUser)
async def change_email(user: UserDep, db: SessionDep, user_model: UpdateEmail):
    user.email = user_model.email
    user.email_validated = False
    user.notifications_enabled = False
    db.commit()
    db.refresh(user)
    return user

@router.put("/rollover", status_code=status.HTTP_200_OK, response_model=ReturnUser)
async def change_rollover_settings(user: UserDep, db: SessionDep, user_model: UpdateRollover):
    user.rollover = user_model.rollover
    db.commit()
    db.refresh(user)
    return user

@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user: UserDep, db: SessionDep):
    db.delete(user)
    db.commit()


@router.post("/send-validation-code", status_code=status.HTTP_200_OK)
async def send_validation_code(user: UserDep, db: SessionDep):
    otp = str(random.randint(100000, 999999))

    user.verification_code = otp
    db.commit()
    
    try:
        await send_otp_email(user.email, otp)
        return {"detail": f"Verification code sent to {user.email}"}
    except Exception as e:
        print(f"❌ Email Error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

@router.post("/validate-email", status_code=status.HTTP_200_OK)
async def validate_email(user: UserDep, db: SessionDep, data: ValidateEmail):

    print(f"DEBUG: Validating {user.email}. DB Code: {user.verification_code}, Input: {data.code}")
    
    if user.verification_code == data.code:
        user.email_validated = True
        user.verification_code = None
        db.commit()
        db.refresh(user)
        print("DEBUG: Validation Success! email_validated is now True")
        return {"detail": "Email validated successfully."}
    else:
        raise HTTPException(status_code=400, detail="Invalid verification code.")



@router.put("/notifications", status_code=status.HTTP_200_OK, response_model=ReturnUser)
async def change_notification_settings(user: UserDep, db: SessionDep, enable: bool):
    db.refresh(user)
    
    print(f"DEBUG: Setting Notifications. Enable: {enable}, Validated: {user.email_validated}")

    if enable:
        if not user.email_validated:
            raise HTTPException(status_code=400, detail="Verify your email before enabling notifications.")
        user.notifications_enabled = True
    else:
        user.notifications_enabled = False
        
    db.commit()
    db.refresh(user)
    return user

@router.put("/notifications/disable", status_code=status.HTTP_200_OK, response_model=ReturnUser)
async def disable_notifications(user: UserDep, db: SessionDep):
    user.notifications_enabled = False
    db.commit()
    db.refresh(user)
    return user