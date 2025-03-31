from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status, Request
from app.core.rate_limiting import ip_limiter
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.crud.project import project_crud
from app.models.user import User
from app.schemas.project import (
    Project,
    ProjectCreate,
    ProjectUpdate,
    ProjectWithTaskCount,
)

router = APIRouter()


@router.post("/", response_model=Project)
@ip_limiter.limit("20/hour")
async def create_project(
    *,
    project_in: ProjectCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create new project.
    """
    project = await project_crud.create_with_owner(
        db=db, obj_in=project_in, owner_id=current_user.id
    )
    return project


@router.get("/", response_model=List[ProjectWithTaskCount])
async def read_projects(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve projects with task counts.
    """
    projects = await project_crud.get_projects_with_task_counts(
        db=db, owner_id=current_user.id, skip=skip, limit=limit
    )
    
    # Important: Make sure each project dict matches your ProjectWithTaskCount schema
    # Note that in your schema, you have "total_tasks" and "completed_tasks" fields
    # which need to be present in each project dict
    return projects


@router.get("/{project_id}", response_model=Project)
async def read_project(
    *,
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get project by ID.
    """
    project = await project_crud.get(db=db, id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )
    return project


@router.put("/{project_id}", response_model=Project)
@ip_limiter.limit("20/hour")
async def update_project(
    *,
    project_id: str,
    project_in: ProjectUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update a project.
    """
    project = await project_crud.get(db=db, id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )
    project = await project_crud.update(db=db, db_obj=project, obj_in=project_in)
    return project


@router.delete("/{project_id}", response_model=Project)
async def delete_project(
    *,
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Delete a project.
    """
    project = await project_crud.get(db=db, id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )
    project = await project_crud.remove(db=db, id=project_id)
    return project