from fastapi import APIRouter, HTTPException, status
from sqlalchemy import func
from typing import List

from ..models import (
    CreateNote,
    UpdateNote,
    ReturnNote,
)
from ..schemas import Note,Tag 
from datetime import datetime, date, timezone
from .auth import UserDep
from ..db import SessionDep


router = APIRouter(
    prefix="/notes",
    tags=["notes"],
)

def process_tags(db: SessionDep, tag_names : List[str]):
    objects = [] 
    for name in tag_names:
        clean_name = name.strip().lower() 
        if not clean_name:
            continue 
        tag = db.query(Tag).filter(Tag.name == clean_name).first() 
        if not tag:
            tag = Tag(name=clean_name)
            db.add(tag)
            db.flush() 
        
        objects.append(tag)
    return objects 


@router.get("/search", response_model=List[ReturnNote],status_code=status.HTTP_200_OK)
async def search_note(query : str , db : SessionDep, user_model : UserDep):
    search = f"%{query}%"
    results = db.query(Note).filter(((Note.title.ilike(search)) | (Note.content.ilike(search))) & (Note.user_id == user_model.id)).all() 
    if not results:
        return []
    else:
        return results 


@router.get('/',response_model=List[ReturnNote],status_code=status.HTTP_200_OK)
async def get_all_notes(db : SessionDep, user: UserDep):
    notes = db.query(Note).filter(Note.user_id==user.id).all() 
    return notes 



@router.get('/date/{created_date}',response_model=List[ReturnNote],status_code=status.HTTP_200_OK)
async def get_note_by_date(created_date: date, db:SessionDep, user : UserDep):
    notes = db.query(Note).filter((func.date(Note.created_at) == created_date) & (Note.user_id == user.id)).all() 
    return notes

@router.get('/{id}',response_model=ReturnNote,status_code=status.HTTP_200_OK)
async def get_by_id(id : int , db : SessionDep, user : UserDep):
    note = db.query(Note).filter((Note.id == id) & (Note.user_id == user.id)).first() 
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No note Found")
    else:
        return note 

@router.post("/",response_model=ReturnNote,status_code=status.HTTP_201_CREATED)
async def create_note(note : CreateNote,  db : SessionDep, user : UserDep):
    tag_objects = process_tags(db , note.tags)
    db_note = Note(
        title= note.title,
        content= note.content,
        user_id = user.id,
        is_pinned = note.is_pinned,
        is_archived = note.is_archived,
        tags= tag_objects 
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note) 
    return db_note
 
@router.delete('/{id}',status_code=status.HTTP_200_OK)
async def delete_note(id : int , db : SessionDep, user : UserDep):
    note = db.query(Note).filter((Note.id == id) & (Note.user_id == user.id)).first() 
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Note Not Found")
    else:
        db.delete(note) 
        db.commit() 
        return {"response" : f"Note with {id} deleted"}
    
@router.put('/{id}', response_model=ReturnNote,status_code=status.HTTP_200_OK)
async def update_note_id(id : int ,note : UpdateNote ,  db : SessionDep, user:UserDep):
    db_note = db.query(Note).filter((Note.id == id) & (Note.user_id == user.id)).first() 
    if not db_note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Note not found")  
    else:
        db_note.title = note.title 
        db_note.content = note.content
        db_note.edited_at = datetime.now(timezone.utc) 
        db_note.is_pinned = note.is_pinned
        db_note.is_archived = note.is_archived

        if note.tags is not None:
            tag_objects = process_tags(db, note.tags)
            db_note.tags = tag_objects 

        db.commit() 
        db.refresh(db_note)
        return db_note


