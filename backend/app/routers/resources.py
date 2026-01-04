from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from .. import models
from ..schemas import schemas
from ..database import get_db
from ..security import check_admin_auth

router = APIRouter(tags=["Resources"])

@router.get("/api/resources", response_model=List[schemas.Resource])
async def get_resources(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Resource).order_by(models.Resource.created_at.desc()))
    return result.scalars().all()

@router.post("/api/resources", response_model=schemas.Resource)
async def create_resource(resource: schemas.ResourceCreate, db: AsyncSession = Depends(get_db)):
    db_resource = models.Resource(**resource.dict())
    db.add(db_resource)
    await db.commit()
    await db.refresh(db_resource)
    return db_resource

@router.put("/api/resources/{resource_id}", response_model=schemas.Resource)
async def update_resource(resource_id: int, resource_update: schemas.ResourceUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Resource).where(models.Resource.id == resource_id))
    db_resource = result.scalar_one_or_none()

    if not db_resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    update_data = resource_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_resource, field, value)

    await db.commit()
    await db.refresh(db_resource)
    return db_resource

@router.delete("/api/resources/{resource_id}")
async def delete_resource(resource_id: int, req: schemas.DeleteRequest, db: AsyncSession = Depends(get_db)):
    if not await check_admin_auth(req.password, db):
        raise HTTPException(status_code=403, detail="Invalid password")
    
    result = await db.execute(select(models.Resource).where(models.Resource.id == resource_id))
    db_resource = result.scalar_one_or_none()
    
    if not db_resource:
        raise HTTPException(status_code=404, detail="Resource not found")
        
    await db.delete(db_resource)
    await db.commit()
    return {"status": "deleted"}
