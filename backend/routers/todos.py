from fastapi import APIRouter, HTTPException, status
from sqlalchemy import func
from typing import List
from ..models import (
    AddTodo,
    ReturnTodo,
    UpdateTodo,
    UpdateStatus
)
from ..schemas import Todo 
from datetime import datetime, date, timezone, timedelta
from .auth import UserDep
from ..db import SessionDep
 
router = APIRouter(
    prefix="/todos",
    tags=["todos"],
)


@router.get("/search", response_model=List[ReturnTodo],status_code=status.HTTP_200_OK)
async def search_Todo(query : str , db : SessionDep, user_model : UserDep):
    search = f"%{query}%"
    results = db.query(Todo).filter(((Todo.title.ilike(search)) | (Todo.description.ilike(search))) & (Todo.user_id == user_model.id)).all() 
    if not results:
        return []
    else:
        return results 


@router.get('/',status_code=status.HTTP_200_OK,response_model=List[ReturnTodo])
async def get_todos(db : SessionDep, user:UserDep):
    todos = db.query(Todo).filter(Todo.user_id == user.id).all() 
    return todos 
    



@router.get('/date/{entry_date}',response_model=List[ReturnTodo],status_code=status.HTTP_200_OK)
async def get_todoby_date(entry_date: date, db:SessionDep,user : UserDep):
    today = date.today()
    if entry_date == today and user.rollover:
        incomplete_todos = db.query(Todo).filter(
            (func.date(Todo.entry_datetime) < today) &
            (Todo.user_id == user.id) &
            (Todo.status == False)
        ).all()

        if incomplete_todos:
             
            for todo in incomplete_todos:
                original_time = todo.entry_datetime.time()
                todo.entry_datetime = datetime.combine(today, original_time)
                todo.edited = True
                todo.edited_datetime = datetime.now(timezone.utc)
            db.commit()
    todos = db.query(Todo).filter((func.date(Todo.entry_datetime) == entry_date) & (Todo.user_id == user.id)).all() 
    return todos
@router.get('/{id}',status_code=status.HTTP_200_OK,response_model=ReturnTodo)
async def gettodobyid(id: int , db : SessionDep, user : UserDep):
    todo = db.query(Todo).filter((Todo.id== id) & (Todo.user_id == user.id)).first()
    if not todo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No Todos FOund")
    else:
        return todo 
 

 
@router.post("/",status_code=status.HTTP_201_CREATED,response_model=ReturnTodo)
async def addTodo(todo : AddTodo, db : SessionDep, user : UserDep):
 
    entry_dt = datetime.now()
    
 
    if hasattr(todo, 'date') and todo.date:
        entry_dt = datetime.combine(todo.date, datetime.now().time())

    db_todo = Todo(
        title=todo.title,
        description = todo.description,
        priority=todo.priority,
        edited = False,
        user_id = user.id,
        entry_datetime = entry_dt
    )
    db.add(db_todo)
    db.commit() 
    db.refresh(db_todo)
    return db_todo
 

@router.delete("/{id}",status_code=status.HTTP_200_OK)
async def delete_todo(id : int , db : SessionDep, user:UserDep):
    todo = db.query(Todo).filter((Todo.id == id) & (Todo.user_id == user.id)).first() 
    if not todo : 
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="ID NOT FOUND")
    else : 
        db.delete(todo) ; 
        db.commit() 
        return {"detail": f"Todo with id {id} deleted"}


@router.put("/{id}/status",status_code=status.HTTP_200_OK,response_model=ReturnTodo)
async def update_status(id:int, todo:UpdateStatus,  db:SessionDep, user : UserDep):
    db_todo = db.query(Todo).filter((Todo.id == id) & (Todo.user_id == user.id)).first() 
    if not db_todo : 
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="ID NOT FOUND")
    else : 
        db_todo.status = todo.status 
        db_todo.edited = True 
        now = datetime.now(timezone.utc) 
        db_todo.edited_datetime = now 
        if todo.status:
            db_todo.completed_datetime = now
        else:
            db_todo.completed_datetime = None 
        db.commit() 
        db.refresh(db_todo)
        return db_todo
          
    
@router.put("/{id}",status_code=status.HTTP_200_OK,response_model=ReturnTodo)
async def update_todo(id:int, todo:UpdateTodo,  db:SessionDep, user : UserDep):
    db_todo = db.query(Todo).filter((Todo.id == id) & (Todo.user_id == user.id)).first() 
    if not db_todo : 
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="ID NOT FOUND")
    else : 
        db_todo.title = todo.title 
        db_todo.description = todo.description
        db_todo.edited = True 
        db_todo.priority = todo.priority
        db_todo.edited_datetime = datetime.now(timezone.utc) 
        db.commit() 
        db.refresh(db_todo)
        return db_todo  

@router.post("/rollover",response_model=List[ReturnTodo],status_code=status.HTTP_200_OK)
async def rollover_todos(db : SessionDep, user : UserDep):
    today = date.today()
    
    todos = db.query(Todo).filter(
        (func.date(Todo.entry_datetime) < today) & (Todo.user_id == user.id) & (Todo.status == False)).all() 
    for todo in todos:
        original_time = todo.entry_datetime.time()
        todo.entry_datetime = datetime.combine(today, original_time)
        todo.edited = True
        todo.edited_datetime = datetime.now(timezone.utc)
    db.commit()
    for todo in todos:
        db.refresh(todo)
    return todos

