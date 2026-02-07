from fastapi import APIRouter, HTTPException, status
from sqlalchemy import func
from typing import List
from ..models import (
    CreateDiary,
    UpdateDiary,
    ReturnDiary,
)
from ..schemas import Diary
from datetime import datetime, date, timezone
from .auth import UserDep
from ..db import SessionDep
 
router = APIRouter(
    prefix="/diaries",
    tags=["diaries"],
)



@router.get("/search", response_model=List[ReturnDiary],status_code=status.HTTP_200_OK)
async def search_diary(query : str , db : SessionDep, user_model : UserDep):
    search = f"%{query}%"
    results = db.query(Diary).filter(((Diary.title.ilike(search)) | (Diary.content.ilike(search))) & (Diary.user_id == user_model.id)).all() 
    if not results:
        return []
    else:
        return results 


@router.get('/',response_model=List[ReturnDiary],status_code=status.HTTP_200_OK)
async def get_all(db : SessionDep, user: UserDep):
    diaries = db.query(Diary).filter(Diary.user_id==user.id).all() 
    return diaries 



@router.get('/date/{entry_date}',response_model=List[ReturnDiary],status_code=status.HTTP_200_OK)
async def get_diary_by_date(entry_date: date, db:SessionDep, user : UserDep):
    diaries = db.query(Diary).filter((func.date(Diary.entry_datetime) == entry_date) & (Diary.user_id == user.id)).all() 
    return diaries

@router.get('/{id}',response_model=ReturnDiary,status_code=status.HTTP_200_OK)
async def get_by_id(id : int , db : SessionDep, user : UserDep):
    diary = db.query(Diary).filter((Diary.id == id) & (Diary.user_id == user.id)).first() 
    if not diary:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No diary Found")
    else:
        return diary 

@router.post("/",response_model=ReturnDiary,status_code=status.HTTP_201_CREATED)
async def create_diary(diary : CreateDiary,  db : SessionDep, user : UserDep):
    db_diary = Diary(
        title= diary.title,
        content= diary.content,
        user_id = user.id 
    )
    db.add(db_diary)
    db.commit()
    db.refresh(db_diary) 
    return db_diary
 
@router.delete('/{id}',status_code=status.HTTP_200_OK)
async def delete_diary(id : int , db : SessionDep, user : UserDep):
    diary = db.query(Diary).filter((Diary.id == id) & (Diary.user_id == user.id)).first() 
    if not diary:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Diary Not Found")
    else:
        db.delete(diary) 
        db.commit() 
        return {"response" : f"Dairy with {id} deleted"}
    
@router.put('/{id}', response_model=ReturnDiary,status_code=status.HTTP_200_OK)
async def update_diary_id(id : int ,diary : UpdateDiary ,  db : SessionDep, user:UserDep):
    db_diary = db.query(Diary).filter((Diary.id == id) & (Diary.user_id == user.id)).first() 
    if not db_diary:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Diary not found")  
    else:
        db_diary.title = diary.title 
        db_diary.content = diary.content
        db_diary.edited = True 
        db_diary.edited_datetime = datetime.now(timezone.utc) 
        db.commit() 
        db.refresh(db_diary)
        return db_diary

