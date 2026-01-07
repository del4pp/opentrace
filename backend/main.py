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
    system_router,
    sdk_router,
    event_actions_router,
    funnels_router,
    retention_router,
    segments_router,
    users_router,
    reports_router,
    modules_router
)

app = FastAPI(title="OpenTrace Analytics API", version="1.1.5")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    max_retries = 10
    retry_delay = 2

    for attempt in range(max_retries):
        try:
            async with engine.begin() as conn:
                await conn.run_sync(models.Base.metadata.create_all)
                try:
                    await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR"))
                    await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_first_login BOOLEAN DEFAULT TRUE"))
                    await conn.execute(text("ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS resource_id INTEGER REFERENCES resources(id)"))
                    await conn.execute(text("ALTER TABLE tags ADD COLUMN IF NOT EXISTS resource_id INTEGER REFERENCES resources(id)"))
                    await conn.execute(text("ALTER TABLE funnel_steps ADD COLUMN IF NOT EXISTS conversion_value INTEGER DEFAULT 0"))
                    await conn.execute(text("ALTER TABLE funnel_steps ADD COLUMN IF NOT EXISTS is_goal BOOLEAN DEFAULT FALSE"))
                except Exception:
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
                        print("✓ Created admin user")
                except Exception as e:
                    print(f"⚠ User creation error: {e}")

                try:
                    res = await db.execute(select(models.Setting).where(models.Setting.key == "show_demo"))
                    if not res.scalars().first():
                        db.add(models.Setting(key="show_demo", value="true"))
                    
                    res = await db.execute(select(models.Setting).where(models.Setting.key == "skip_landing"))
                    if not res.scalars().first():
                        db.add(models.Setting(key="skip_landing", value="false"))
                        
                    await db.commit()
                    print("✓ Created system settings")
                except Exception as e:
                    print(f"⚠ Setting creation error: {e}")

            print("✓ Database initialized successfully")
            break

        except Exception as e:
            print(f"⚠ Database initialization attempt {attempt + 1}/{max_retries} failed: {e}")
            if attempt < max_retries - 1:
                import asyncio
                await asyncio.sleep(retry_delay)
            else:
                print("✗ Database initialization failed after all retries")

    try:
        from app.telemetry import send_telemetry
        import asyncio
        asyncio.create_task(send_telemetry())
    except Exception as e:
        print(f"⚠ Telemetry initialization error: {e}")

app.include_router(auth_router)
app.include_router(resources_router)
app.include_router(campaigns_router)
app.include_router(events_router)
app.include_router(tags_router)
app.include_router(analytics_router)
app.include_router(system_router)
app.include_router(sdk_router)
app.include_router(event_actions_router)
app.include_router(funnels_router)
app.include_router(retention_router)
app.include_router(segments_router)
app.include_router(users_router)
app.include_router(reports_router)
app.include_router(modules_router)
