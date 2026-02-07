from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime 
from datetime import date as datetimedate
 
class AddTodo(BaseModel):
    title : str 
    description: Optional[str] = None
    priority: str = "medium"   
    date: Optional[datetimedate] = None
    model_config = ConfigDict(from_attributes=True)
  

class ReturnTodo(BaseModel):
    id : int 
    title: str  
    edited : bool  
    description: Optional[str] = None  
    priority : str 
    status : bool 
    entry_datetime : datetime
    edited_datetime : Optional[datetime] = None 
    completed_datetime : Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)
     
class UpdateTodo(BaseModel):
    title : str 
    description: Optional[str] = None
    priority : str
    date: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class UpdateStatus(BaseModel):
    status : bool 
    model_config = ConfigDict(from_attributes=True)


class CreateDiary(BaseModel):
    title : str 
    content : str 
    model_config = ConfigDict(from_attributes=True)

class ReturnDiary(BaseModel):
    id : int 
    title : str 
    content : str 
    entry_datetime : datetime
    edited : bool 
    edited_datetime : Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class UpdateDiary(BaseModel):
    title : str 
    content : str 
    model_config = ConfigDict(from_attributes=True)

class TagBase(BaseModel):
    name : str 

class ReturnTag(TagBase):
    id : int 
    model_config = ConfigDict(from_attributes=True)

 

class CreateUser(BaseModel):
    username : str 
    password : str 
    email : str 
    role : Optional[str] = "User"

class ReturnUser(BaseModel):
    id : int 
    username : str 
    rollover : bool
    email : str 
    email_validated : bool
    notifications_enabled : bool
    created_at : datetime 
    updated_at : datetime 
    role : str
    model_config = ConfigDict(from_attributes=True)

 

class UpdateEmail(BaseModel):
    email : str 

class UpdatePassword(BaseModel):
    password : str 

class UpdateUsername(BaseModel):
    username : str 


class UpdateRollover(BaseModel):
    rollover : bool

class ValidateEmail(BaseModel):
    email : str 
    code : str

class Token(BaseModel):
    access_token : str 
    token_type : str 

class TokenData(BaseModel):
    id : int
    role : Optional[str] = "User" 

class CreateNote(BaseModel):
    title : str 
    content : str 
    is_pinned : bool = False
    is_archived : bool = False
    tags : List[str] = []


class UpdateNote(BaseModel):
    title : str 
    content : str 
    is_pinned : bool = False
    is_archived : bool = False
    tags: Optional[list[str]] = None 
    model_config = ConfigDict(from_attributes=True)

class ReturnNote(BaseModel):
    id : int 
    title : str 
    content : str 
    is_pinned : bool 
    is_archived : bool 
    created_at : datetime
    edited_at : Optional[datetime] = None
    tags: list[ReturnTag] = [] 
    model_config = ConfigDict(from_attributes=True)



class CreateGoal(BaseModel):
    title : str 
    description : str 
    target_date: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class UpdateGoal(BaseModel):
    title : str 
    description : str 
    target_date: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class ReturnGoal(BaseModel):
    id : int 
    title : str 
    description : str 
    is_completed : bool 
    created_at : datetime
    target_date: Optional[datetime] = None
    updated_at : Optional[datetime] = None
    completed_at : Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)



