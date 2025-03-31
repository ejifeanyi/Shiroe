# app/api/v1/endpoints/tasks.py
from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
# Fix the imports to avoid circular references
from app.crud.task import task_crud
from app.crud.project import project_crud
from app.models.user import User
from app.schemas.task import Task, TaskCreate, TaskUpdate, TaskWithSubtasks
from datetime import datetime
from app.core.rate_limiting import ip_limiter

router = APIRouter()

@router.post("/", response_model=Task)
@ip_limiter.limit("100/day")
async def create_task(
    *,
    task_in: TaskCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create new task with cache management.
    """
    # Verify project ownership before creating task
    project = await project_crud.get(db=db, id=task_in.project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Project not found"
        )
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Not enough permissions"
        )

    # Create task
    task = await task_crud.create(db=db, obj_in=task_in)
    
    # Automatically handled by CRUD method:
    # - Invalidates project tasks cache
    # - Clears related cache patterns

    return task


@router.get("/", response_model=List[Task])
async def read_tasks(
    project_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve tasks with built-in caching.
    """
    if project_id:
        # Check if project belongs to the user
        project = await project_crud.get(db=db, id=project_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Project not found"
            )
        if project.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Not enough permissions"
            )
        
        # Uses cached method from CRUD layer
        tasks = await task_crud.get_multi_by_project(
            db=db, project_id=project_id, skip=skip, limit=limit
        )
    else:
        # Get all tasks for the user across all projects
        tasks = await task_crud.get_multi_by_owner(
            db=db, owner_id=current_user.id, skip=skip, limit=limit
        )
    return tasks


@router.get("/hierarchy", response_model=List[TaskWithSubtasks])
async def read_tasks_with_subtasks(
    project_id: str = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Retrieve tasks with their subtasks as a hierarchy with caching.
    """
    # Check if project belongs to the user
    project = await project_crud.get(db=db, id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Project not found"
        )
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Not enough permissions"
        )

    # Uses cached method from CRUD layer
    tasks = await task_crud.get_tasks_with_subtasks(db=db, project_id=project_id)
    return tasks


@router.get("/{task_id}", response_model=Task)
async def read_task(
    task_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get task by ID with caching.
    """
    # Uses cached method from CRUD layer
    task = await task_crud.get(db=db, id=task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Task not found"
        )

    # Check if project belongs to the user
    project = await project_crud.get(db=db, id=task.project_id)
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Not enough permissions"
        )
    return task


@router.put("/{task_id}", response_model=Task)
@ip_limiter.limit("2/minute")
async def update_task(
    *,
    task_id: str,
    request: Request,
    task_in: TaskUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update a task with cache management.
    """
    task = await task_crud.get(db=db, id=task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Task not found"
        )

    # Check if project belongs to the user
    project = await project_crud.get(db=db, id=task.project_id)
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Not enough permissions"
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
        new_project = await project_crud.get(db=db, id=task_data["project_id"])
        if not new_project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="New project not found"
            )
        if new_project.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions on new project",
            )

    # Uses update method from CRUD that handles cache invalidation
    task = await task_crud.update(db=db, db_obj=task, obj_in=task_data)
    return task


@router.delete("/{task_id}", response_model=Task)
async def delete_task(
    *,
    task_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Delete a task with cache management.
    """
    task = await task_crud.get(db=db, id=task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Task not found"
        )

    # Check if project belongs to the user
    project = await project_crud.get(db=db, id=task.project_id)
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Not enough permissions"
        )

    # Uses remove method from CRUD that handles cache invalidation
    task = await task_crud.remove(db=db, id=task_id)
    return task