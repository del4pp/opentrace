import bcrypt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from . import models

def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

async def check_admin_auth(password: str, db: AsyncSession) -> bool:
    result = await db.execute(select(models.User).where(models.User.email == "admin@opentrace.io"))
    admin = result.scalars().first()
    if not admin:
        return False
    return verify_password(password, admin.hashed_password)
