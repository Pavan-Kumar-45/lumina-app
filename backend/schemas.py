from sqlalchemy.orm import declarative_base
from datetime import datetime
from sqlalchemy  import Column, Integer, String, Boolean, DateTime, Text , ForeignKey, Table
from sqlalchemy_utils import EmailType
from sqlalchemy.orm import relationship, mapped_column  
Base = declarative_base() 


note_tags = Table(
    'note_tags', 
    Base.metadata,
    Column('note_id',Integer,ForeignKey('Note.id')),
    Column('tag_id',Integer,ForeignKey('Tag.id'))
)

class Tag(Base):
    __tablename__ = "Tag"
    id = Column(Integer, primary_key=True, index=True) 
    name = Column(String(50) , unique=True, index=True, nullable=False)
    notes = relationship("Note" , secondary=note_tags, back_populates="tags")
 


class User(Base):
    __tablename__ = "User" 
    id = Column(Integer, primary_key=True , index = True)
    username = Column(String(255) , unique=True, index=True, nullable=False)
    hashed_password = Column(String(255) , nullable=False) 
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)
    email = Column(EmailType, nullable=False , unique=True)
    email_validated = Column(Boolean, nullable=False, default=False)
    notifications_enabled = Column(Boolean, nullable=False, default=True)
    verification_code = Column(String(10), nullable=True)
    role = Column(String(255), nullable=False, default="User") 
    rollover = Column(Boolean, nullable=False, default=False)
    todos = relationship("Todo", back_populates="user")
    diaries = relationship("Diary", back_populates="user")
    notes = relationship("Note", back_populates="user")
    goals = relationship("Goal", back_populates="user")

class Diary(Base):
    __tablename__ = "Diary"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=True)
    content = Column(Text, nullable=False)
    entry_datetime = Column(DateTime, nullable=False, default=datetime.utcnow)
    edited = Column(Boolean, nullable=False, default=False)
    edited_datetime = Column(DateTime, nullable=True)
    user_id = mapped_column(ForeignKey("User.id"), nullable=False)
    user = relationship("User", back_populates="diaries")
     


class Todo(Base):
    __tablename__ = "Todo"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    edited = Column(Boolean, nullable=False, default=False)
    description = Column(Text, nullable=True)
    priority = Column(String(50), nullable=False)
    status = Column(Boolean, default=False) 
    entry_datetime = Column(DateTime, nullable=False, default=datetime.utcnow)
    edited_datetime = Column(DateTime, nullable=True)
    completed_datetime = Column(DateTime, nullable=True)
    user_id = mapped_column(ForeignKey("User.id"), nullable=False)
    user = relationship("User", back_populates="todos")




class Note(Base):
    __tablename__ = "Note"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    is_pinned = Column(Boolean, nullable=False,default=False)
    is_archived = Column(Boolean,nullable=False, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    edited_at = Column(DateTime, nullable=True)
    tags = relationship("Tag" , secondary=note_tags,back_populates="notes")
    user_id = mapped_column(ForeignKey("User.id"), nullable=False)
    user = relationship("User", back_populates="notes")


class Goal(Base):
    __tablename__ = "Goals"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    is_completed = Column(Boolean, nullable=False, default=False)
    target_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, nullable=True)
    user_id = mapped_column(ForeignKey("User.id"), nullable=False)
    user = relationship("User", back_populates="goals")

