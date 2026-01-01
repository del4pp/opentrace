from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from .. import models
from ..schemas import schemas
from ..database import get_db
from ..security import verify_password, get_password_hash

router = APIRouter(tags=["Auth"])

@router.post("/api/login", response_model=schemas.LoginResponse)
async def login(creds: schemas.LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.User).where(models.User.email == creds.email))
    user = result.scalars().first()
    
    if not user or not verify_password(creds.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    return {
        "user_id": user.id,
        "email": user.email,
        "is_first_login": user.is_first_login if user.is_first_login is not None else False
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
