# app/api/v1/endpoints/tasks.py
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.crud import task as task_crud
from app.crud import project as project_crud
from app.models.user import User
from app.schemas.task import Task, TaskCreate, TaskUpdate, TaskWithSubtasks
from datetime import datetime

router = APIRouter()


@router.post("/", response_model=Task)
def create_task(
    *,
    task_in: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create new task.
    """
    # Debug: Log the incoming data (optional)
    print(f"Received task data: {task_in.dict()}")

    # Project checks...

    # Simply use the Pydantic model's dict method - our TypeDecorator will handle the conversion
    task_data = task_in.dict()

    # Create the task with the processed dictionary
    task = task_crud.task.create(db=db, obj_in=task_data)
    return task


@router.get("/", response_model=List[Task])
def read_tasks(
    project_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve tasks.
    """
    if project_id:
        # Check if project belongs to the user
        project = project_crud.project.get(db=db, id=project_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
            )
        if project.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
            )
        tasks = task_crud.task.get_multi_by_project(
            db=db, project_id=project_id, skip=skip, limit=limit
        )
    else:
        # Get all tasks for the user across all projects
        tasks = task_crud.task.get_multi_by_owner(
            db=db, owner_id=current_user.id, skip=skip, limit=limit
        )
    return tasks


@router.get("/hierarchy", response_model=List[TaskWithSubtasks])
def read_tasks_with_subtasks(
    project_id: str = Query(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Retrieve tasks with their subtasks as a hierarchy.
    """
    # Check if project belongs to the user
    project = project_crud.project.get(db=db, id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )

    tasks = task_crud.task.get_tasks_with_subtasks(db=db, project_id=project_id)
    return tasks


@router.get("/{task_id}", response_model=Task)
def read_task(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get task by ID.
    """
    task = task_crud.task.get(db=db, id=task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
        )

    # Check if project belongs to the user
    project = project_crud.project.get(db=db, id=task.project_id)
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )
    return task


@router.put("/{task_id}", response_model=Task)
def update_task(
    *,
    task_id: str,
    task_in: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update a task.
    """
    task = task_crud.task.get(db=db, id=task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
        )

    # Check if project belongs to the user
    project = project_crud.project.get(db=db, id=task.project_id)
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )

    # Process update data
    task_data = task_in.dict(exclude_unset=True)

    # Convert due_date to datetime if it's a string
    if isinstance(task_data.get("due_date"), str):
        due_date_str = task_data["due_date"]
        if due_date_str.endswith("Z"):
            due_date_str = due_date_str[:-1]  # Remove the Z
        task_data["due_date"] = datetime.fromisoformat(due_date_str)

    # If project_id is being updated, check if new project belongs to the user
    if task_data.get("project_id") and task_data["project_id"] != task.project_id:
        new_project = project_crud.project.get(db=db, id=task_data["project_id"])
        if not new_project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="New project not found"
            )
        if new_project.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions on new project",
            )

    task = task_crud.task.update(db=db, db_obj=task, obj_in=task_data)
    return task


@router.delete("/{task_id}", response_model=Task)
def delete_task(
    *,
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Delete a task.
    """
    task = task_crud.task.get(db=db, id=task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
        )

    # Check if project belongs to the user
    project = project_crud.project.get(db=db, id=task.project_id)
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )

    task = task_crud.task.remove(db=db, id=task_id)
    return task
