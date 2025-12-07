from fastapi import APIRouter, HTTPException, status
from typing import List
from ..models import (
    CreateGoal,
    UpdateGoal,
    ReturnGoal,
)
from ..schemas import Goal 
from datetime import datetime
from .auth import UserDep
from ..db import SessionDep


router = APIRouter(
    prefix="/goals",
    tags=["goals"],
)



@router.get("/search", response_model=List[ReturnGoal],status_code=status.HTTP_200_OK)
async def search_goal(query : str , db : SessionDep, user_model : UserDep):
    search = f"%{query}%"
    results = db.query(Goal).filter(((Goal.title.ilike(search)) | (Goal.description.ilike(search))) & (Goal.user_id == user_model.id)).all() 
    if not results:
        return []
    else:
        return results 

@router.get("/",status_code=status.HTTP_200_OK,response_model=List[ReturnGoal])
async def get_all_goals(user : UserDep, db : SessionDep ):
    goals= db.query(Goal).filter((Goal.user_id==user.id)).all() 
    return goals 

@router.get("/{id}",status_code=status.HTTP_200_OK,response_model=ReturnGoal)
async def get_all_goals_id(user : UserDep, db : SessionDep , id : int):
    goal = db.query(Goal).filter((Goal.user_id==user.id) & (Goal.id == id)).first() 
    if not goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Goal Not Found")
    else:
        return goal



@router.post("/",status_code=status.HTTP_201_CREATED,response_model=ReturnGoal)
async def create_goal(user : UserDep, db : SessionDep,goal : CreateGoal):
    db_goal = Goal(
        title=goal.title,
        description =goal.description,
        user_id=user.id,
        target_date=goal.target_date,
    )
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

@router.put("/{id}",status_code=status.HTTP_200_OK,response_model=ReturnGoal)
async def update_goal(id: int, user : UserDep, db : SessionDep, goal : UpdateGoal):
    db_goal = db.query(Goal).filter((Goal.user_id==user.id) & (Goal.id == id)).first() 
    if not db_goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Goal Not Found")
    db_goal.title = goal.title
    db_goal.description = goal.description
    db_goal.target_date = goal.target_date
    db_goal.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_goal)
    return db_goal


@router.put("/complete/{id}",status_code=status.HTTP_200_OK,response_model=ReturnGoal)
async def complete_goal(id: int, user : UserDep, db : SessionDep):
    db_goal = db.query(Goal).filter((Goal.user_id==user.id) & (Goal.id == id)).first() 
    if not db_goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Goal Not Found")
    db_goal.is_completed = True
    db_goal.completed_at = datetime.utcnow()
    db.commit()
    db.refresh(db_goal)
    return db_goal

@router.delete("/{id}",status_code=status.HTTP_200_OK)
async def delete_goal(id: int, user : UserDep, db : SessionDep):
    db_goal = db.query(Goal).filter((Goal.user_id==user.id) & (Goal.id == id)).first() 
    if not db_goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="Goal Not Found")
    db.delete(db_goal)
    db.commit()
    return {"detail": f"Goal with id {id} deleted"}


