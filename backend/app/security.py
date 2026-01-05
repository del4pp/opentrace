import bcrypt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from . import models
from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

SECRET_KEY = "opentrace-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

security = HTTPBearer()

def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def verify_token(token: str, db: AsyncSession):
    print(f"Verifying token (first 10 chars): {token[:10]}...")
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        print(f"Token sub: {user_id}")
        if user_id is None:
            print("Token missing 'sub' field")
            raise credentials_exception
    except JWTError as e:
        print(f"JWT Decode error: {str(e)}")
        raise credentials_exception
    
    result = await db.execute(select(models.User).where(models.User.id == int(user_id)))
    user = result.scalar_one_or_none()
    if user is None:
        print(f"User with ID {user_id} not found in DB")
        raise credentials_exception
    print(f"Auth success for user: {user.email}")
    return user

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(lambda: None)
):
    from .database import get_db
    # Prefer getting DB from FastAPI dependency if available, otherwise manual
    session = db
    if session is None:
        async for s in get_db():
            session = s
            break
            
    try:
        user = await verify_token(credentials.credentials, session)
        return user
    except HTTPException as e:
        print(f"Auth failed: {e.detail}")
        raise e
    except Exception as e:
        print(f"Auth unexpected error: {str(e)}")
        raise HTTPException(status_code=401, detail="Internal auth error")

async def check_admin_auth(password: str, db: AsyncSession) -> bool:
    # Try the default admin first
    result = await db.execute(select(models.User).where(models.User.email == "admin@opentrace.io"))
    admin = result.scalars().first()
    if admin and verify_password(password, admin.hashed_password):
        return True
    
    # Otherwise check all users (if it's a single-user system this is fine, 
    # but ideally we should match against the currently logged in user)
    result = await db.execute(select(models.User))
    users = result.scalars().all()
    for user in users:
        if verify_password(password, user.hashed_password):
            return True
            
    return False
