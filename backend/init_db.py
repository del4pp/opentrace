import asyncio
from sqlalchemy.future import select
from app.database import AsyncSessionLocal, engine, Base
from app.models import User
from app.auth.security import get_password_hash

async def init_db():
    async with engine.begin() as conn:
        # Create tables if not exist
        await conn.run_sync(Base.metadata.create_all)
    
    async with AsyncSessionLocal() as session:
        # Check if admin exists
        result = await session.execute(select(User).where(User.email == "admin@opentrace.io"))
        user = result.scalar_one_or_none()
        
        if not user:
            print("Creating default admin user...")
            new_user = User(
                email="admin@opentrace.io",
                hashed_password=get_password_hash("admin")
            )
            session.add(new_user)
            await session.commit()
            print("Admin created: admin@opentrace.io / admin")
        else:
            print("Admin user already exists.")

if __name__ == "__main__":
    asyncio.run(init_db())
