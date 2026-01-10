from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from .. import models
from ..schemas import schemas
from ..database import get_db
from ..security import check_admin_auth, requires_admin

router = APIRouter(tags=["Tags"])

@router.get("/api/tags", response_model=List[schemas.Tag])
async def get_tags(resource_id: Optional[int] = None, db: AsyncSession = Depends(get_db)):
    query = select(models.Tag)
    if resource_id:
        query = query.where(models.Tag.resource_id == resource_id)
    result = await db.execute(query.order_by(models.Tag.created_at.desc()))
    return result.scalars().all()

@router.post("/api/tags", response_model=schemas.Tag)
async def create_tag(tag: schemas.TagCreate, db: AsyncSession = Depends(get_db), admin = Depends(requires_admin)):
    db_tag = models.Tag(**tag.dict())
    db.add(db_tag)
    await db.commit()
    await db.refresh(db_tag)
    return db_tag

@router.delete("/api/tags/{id}")
async def delete_tag(id: int, req: schemas.DeleteRequest, db: AsyncSession = Depends(get_db), admin = Depends(requires_admin)):
    if not await check_admin_auth(req.password, db):
        raise HTTPException(status_code=403, detail="Invalid password")
    
    result = await db.execute(select(models.Tag).where(models.Tag.id == id))
    obj = result.scalar_one_or_none()
    
    if not obj:
        raise HTTPException(status_code=404, detail="Not found")
        
    await db.delete(obj)
    await db.commit()
    return {"status": "deleted"}
