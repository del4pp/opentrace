from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text, select
from sqlalchemy.ext.asyncio import AsyncSession
import app.models as models
from app.database import engine
from app.security import get_password_hash
from app.routers import (
    auth_router, 
    resources_router, 
    campaigns_router, 
    events_router, 
    tags_router, 
    analytics_router, 
    system_router
)

app = FastAPI(title="OpenTrace Analytics API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(models.Base.metadata.create_all)
        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_first_login BOOLEAN DEFAULT TRUE"))
        except Exception:
            # Column likely exists
            pass

    async with AsyncSession(engine) as db:
        try:
            result = await db.execute(select(models.User).limit(1))
            user = result.scalars().first()
            if not user:
                admin_user = models.User(
                    email="admin@opentrace.io",
                    hashed_password=get_password_hash("admin"),
                    is_first_login=True
                )
                db.add(admin_user)
                await db.commit()
        except Exception:
            pass

app.include_router(auth_router)
app.include_router(resources_router)
app.include_router(campaigns_router)
app.include_router(events_router)
app.include_router(tags_router)
app.include_router(analytics_router)
app.include_router(system_router)
