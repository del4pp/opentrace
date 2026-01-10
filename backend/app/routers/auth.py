from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, func
from .. import models
from ..schemas import schemas
from ..database import get_db
from ..security import verify_password, get_password_hash, create_access_token
from ..email_utils import send_email
import secrets
import string
from datetime import datetime, timedelta
import logging
import redis
from ..config import settings

logger = logging.getLogger(__name__)
redis_client = redis.from_url(settings.REDIS_URL)

router = APIRouter(tags=["Auth"])

@router.post("/api/login")
async def login(creds: schemas.LoginRequest, db: AsyncSession = Depends(get_db)):
    email_key = f"login_fails:{creds.email.lower()}"
    block_key = f"login_blocked:{creds.email.lower()}"

    # Check if blocked
    if redis_client.get(block_key):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS, 
            detail="Too many failed attempts. Account blocked for 10 minutes."
        )

    result = await db.execute(select(models.User).where(func.lower(models.User.email) == creds.email.lower()))
    user = result.scalars().first()
    
    if not user or not verify_password(creds.password, user.hashed_password):
        # Increment failures
        fails = redis_client.incr(email_key)
        if fails == 1:
            redis_client.expire(email_key, 600) # Reset fail counter after 10 mins of no activity
        
        if fails >= 5:
            redis_client.setex(block_key, 600, "1") # Block for 10 minutes
            redis_client.delete(email_key)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS, 
                detail="Too many failed attempts. Account blocked for 10 minutes."
            )
            
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Success: Clear failures
    redis_client.delete(email_key)
    redis_client.delete(block_key)
    
    access_token = create_access_token(data={"sub": str(user.id)})
        
    return {
        "user_id": user.id,
        "email": user.email,
        "role": user.role if hasattr(user, 'role') else 'admin',
        "is_first_login": user.is_first_login if user.is_first_login is not None else False,
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/api/change-password")
async def change_password(req: schemas.ChangePasswordRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.User).where(models.User.id == req.user_id))
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(req.current_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect current password")

    user.hashed_password = get_password_hash(req.new_password)
    user.is_first_login = False
    await db.commit()

    return {"status": "success"}

@router.post("/api/forgot-password")
async def forgot_password(req: schemas.PasswordResetRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.User).where(models.User.email == req.email))
    user = result.scalars().first()

    if not user:
        return {"status": "success", "message": "If the email exists, a reset link has been sent."}

    alphabet = string.ascii_letters + string.digits
    token = ''.join(secrets.choice(alphabet) for _ in range(32))
    expires_at = datetime.utcnow() + timedelta(hours=1)

    reset_token = models.PasswordResetToken(
        user_id=user.id,
        token=token,
        expires_at=expires_at
    )
    db.add(reset_token)
    await db.commit()

    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    subject = "Password Reset Request"
    body = f"""
    <html>
    <body>
        <h2>Password Reset Request</h2>
        <p>Hello,</p>
        <p>You have requested to reset your password. Click the link below to reset your password:</p>
        <p><a href="{reset_url}">Reset Password</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this reset, please ignore this email.</p>
        <br>
        <p>Best regards,<br>Teleboard Team</p>
    </body>
    </html>
    """

    # Fetch SMTP settings from DB
    smtp_res = await db.execute(select(models.Setting))
    all_settings = {s.key: s.value for s in smtp_res.scalars().all()}
    
    smtp_config = {
        "host": all_settings.get("smtp_host", "localhost"),
        "port": int(all_settings.get("smtp_port", 25)),
        "user": all_settings.get("smtp_user", ""),
        "password": all_settings.get("smtp_password", ""),
        "from_email": all_settings.get("smtp_from", "noreply@opentrace.io")
    }

    try:
        email_sent = await send_email(user.email, subject, body, config=smtp_config)

        if email_sent:
            logger.info(f"Password reset email sent to {user.email}")
            return {"status": "success", "message": "Reset link sent to your email."}
        else:
            logger.error(f"Failed to send password reset email to {user.email}")
            await db.execute(delete(models.PasswordResetToken).where(models.PasswordResetToken.token == token))
            await db.commit()
            raise HTTPException(status_code=500, detail="Failed to send reset email. Please check SMTP configuration in Settings.")
    except Exception as e:
        logger.error(f"Email sending exception: {e}")
        await db.execute(delete(models.PasswordResetToken).where(models.PasswordResetToken.token == token))
        await db.commit()
        raise HTTPException(status_code=500, detail=f"Failed to send reset email: {str(e)}")

@router.post("/api/reset-password")
async def reset_password(req: schemas.PasswordResetConfirm, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.PasswordResetToken)
        .where(
            models.PasswordResetToken.token == req.token,
            models.PasswordResetToken.is_used == False,
            models.PasswordResetToken.expires_at > datetime.utcnow()
        )
    )
    reset_token = result.scalars().first()

    if not reset_token:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    result = await db.execute(select(models.User).where(models.User.id == reset_token.user_id))
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.hashed_password = get_password_hash(req.new_password)
    user.is_first_login = False
    reset_token.is_used = True

    await db.commit()

    logger.info(f"Password reset successful for user {user.email}")
    return {"status": "success", "message": "Password has been reset successfully."}

@router.post("/api/invite")
async def invite_user(req: schemas.InvitationRequest, db: AsyncSession = Depends(get_db)):
    # 1. Check if user already exists
    res = await db.execute(select(models.User).where(models.User.email == req.email))
    if res.scalars().first():
        raise HTTPException(status_code=400, detail="User already exists")

    # 2. Create invitation
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(days=7)
    
    invitation = models.Invitation(
        email=req.email,
        role=req.role,
        token=token,
        expires_at=expires_at,
        invited_by_id=req.invited_by
    )
    db.add(invitation)
    await db.commit()

    # 3. Send email
    invite_url = f"{settings.FRONTEND_URL}/accept-invitation?token={token}"
    subject = "You are invited to OpenTrace"
    body = f"""
    <html>
    <body>
        <h2>Welcome to OpenTrace</h2>
        <p>You have been invited to join the OpenTrace Analytics platform.</p>
        <p>Click the link below to set up your account:</p>
        <p><a href="{invite_url}">Join OpenTrace</a></p>
        <p>This invitation will expire in 7 days.</p>
    </body>
    </html>
    """

    # Fetch SMTP settings
    smtp_res = await db.execute(select(models.Setting))
    all_settings = {s.key: s.value for s in smtp_res.scalars().all()}
    
    smtp_config = {
        "host": all_settings.get("smtp_host", "localhost"),
        "port": int(all_settings.get("smtp_port", 25)),
        "user": all_settings.get("smtp_user", ""),
        "password": all_settings.get("smtp_password", ""),
        "from_email": all_settings.get("smtp_from", "noreply@opentrace.io")
    }

    try:
        email_sent = await send_email(req.email, subject, body, config=smtp_config)
        if not email_sent:
            raise Exception("Email sending function returned False")
    except Exception as e:
        logger.error(f"Failed to send invitation email: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to send invitation email: {str(e)}. Link: {invite_url}")

    return {"status": "success", "token": token}

@router.post("/api/accept-invitation")
async def accept_invitation(req: schemas.InvitationAccept, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.Invitation)
        .where(
            models.Invitation.token == req.token,
            models.Invitation.is_used == False,
            models.Invitation.expires_at > datetime.utcnow()
        )
    )
    invitation = result.scalars().first()

    if not invitation:
        raise HTTPException(status_code=400, detail="Invalid or expired invitation")

    # Create User
    new_user = models.User(
        email=invitation.email,
        name=req.name,
        role=invitation.role,
        hashed_password=get_password_hash(req.password),
        is_first_login=False
    )
    db.add(new_user)
    invitation.is_used = True
    
    await db.commit()
    
    return {"status": "success", "message": "Account created successfully"}
