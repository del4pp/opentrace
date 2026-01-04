from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    created_at: datetime
    class Config: from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class ResourceBase(BaseModel):
    uid: str
    name: str
    type: str
    token: Optional[str] = None
    status: str = "Active"

class ResourceCreate(ResourceBase): pass
class ResourceUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
class Resource(ResourceBase):
    id: int
    created_at: datetime
    class Config: from_attributes = True

class CampaignBase(BaseModel):
    name: str
    source: str
    medium: str
    campaign: str
    content: Optional[str] = None
    term: Optional[str] = None
    slug: str
    is_bot_link: bool = False
    bot_id: Optional[str] = None
    bot_start_param: Optional[str] = None
    resource_id: Optional[int] = None

class CampaignCreate(CampaignBase): pass
class Campaign(CampaignBase):
    id: int
    created_at: datetime
    class Config: from_attributes = True

class EventBase(BaseModel):
    name: str
    trigger: str
    selector: str
    resource_id: int

class EventCreate(EventBase): pass
class Event(EventBase):
    id: int
    created_at: datetime
    class Config: from_attributes = True

class EventActionBase(BaseModel):
    event_id: int
    action_type: str
    config: str
    is_active: bool = True

class EventActionCreate(EventActionBase): pass
class EventAction(EventActionBase):
    id: int
    created_at: datetime
    class Config: from_attributes = True

class TagBase(BaseModel):
    name: str
    provider: str
    code: str
    is_active: bool = True
    resource_id: Optional[int] = None

class TagCreate(TagBase): pass
class Tag(TagBase):
    id: int
    created_at: datetime
    class Config: from_attributes = True

class DeleteRequest(BaseModel):
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ChangePasswordRequest(BaseModel):
    user_id: int
    current_password: str
    new_password: str

class LoginResponse(BaseModel):
    user_id: int
    email: str
    is_first_login: bool

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str
