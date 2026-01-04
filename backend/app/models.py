from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_first_login = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Resource(Base):
    __tablename__ = "resources"
    id = Column(Integer, primary_key=True, index=True)
    uid = Column(String, unique=True, index=True)
    name = Column(String)
    type = Column(String) # 'Website' or 'Telegram Bot'
    token = Column(String, nullable=True) # For bots
    status = Column(String, default="Active")
    created_at = Column(DateTime, default=datetime.utcnow)

class Campaign(Base):
    __tablename__ = "campaigns"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    source = Column(String)
    medium = Column(String)
    campaign = Column(String)
    content = Column(String, nullable=True)
    term = Column(String, nullable=True)
    slug = Column(String, unique=True, index=True) # Short code for tracking
    is_bot_link = Column(Boolean, default=False)
    bot_id = Column(String, nullable=True) # Username or ID of the bot
    bot_start_param = Column(String, nullable=True) # The generated iJN2r4nQk
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=True) # Link to resource
    created_at = Column(DateTime, default=datetime.utcnow)

class Event(Base):
    __tablename__ = "events_config"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    trigger = Column(String) # click, visit, submit
    selector = Column(String) # CSS selector or URL path
    resource_id = Column(Integer, ForeignKey("resources.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

class EventAction(Base):
    __tablename__ = "event_actions"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events_config.id"))
    action_type = Column(String) # 'facebook_conversion', 'tiktok_conversion'
    config = Column(Text) # JSON string with API credentials and settings
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    event = relationship("Event")

class Tag(Base):
    __tablename__ = "tags"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    provider = Column(String)
    code = Column(Text)
    is_active = Column(Boolean, default=True)
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=True) # Link to resource
    created_at = Column(DateTime, default=datetime.utcnow)

class Dashboard(Base):
    __tablename__ = "dashboards"
    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(Integer, ForeignKey("resources.id"))
    name = Column(String)
    config = Column(Text) # JSON string of widget layout
    created_at = Column(DateTime, default=datetime.utcnow)

class Setting(Base):
    __tablename__ = "settings"
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True)
    value = Column(String)

class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    token = Column(String, unique=True, index=True)
    expires_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_used = Column(Boolean, default=False)

    user = relationship("User")

class Funnel(Base):
    __tablename__ = "funnels"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    resource_id = Column(Integer, ForeignKey("resources.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    steps = relationship("FunnelStep", back_populates="funnel", cascade="all, delete-orphan", order_by="FunnelStep.order")

class FunnelStep(Base):
    __tablename__ = "funnel_steps"
    id = Column(Integer, primary_key=True, index=True)
    funnel_id = Column(Integer, ForeignKey("funnels.id"))
    name = Column(String)
    type = Column(String) # 'page_view' or 'event'
    value = Column(String) # URL snippet or Event name
    order = Column(Integer)
    conversion_value = Column(Integer, default=0) # Value in local currency

    funnel = relationship("Funnel", back_populates="steps")
