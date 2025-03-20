from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.crud import project as project_crud
from app.models.user import User
from app.schemas.project import (
    Project,
    ProjectCreate,
    ProjectUpdate,
    ProjectWithTaskCount,
)

router = APIRouter()


@router.post("/", response_model=Project)
def create_project(
    *,
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create new project.
    """
    project = project_crud.project.create_with_owner(
        db=db, obj_in=project_in, owner_id=current_user.id
    )
    return project


@router.get("/", response_model=List[ProjectWithTaskCount])
def read_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve projects with task counts.
    """
    projects = project_crud.project.get_projects_with_task_counts(
        db=db, owner_id=current_user.id, skip=skip, limit=limit
    )
    return projects


@router.get("/{project_id}", response_model=Project)
def read_project(
    *,
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get project by ID.
    """
    project = project_crud.project.get(db=db, id=project_id)
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
def update_project(
    *,
    project_id: str,
    project_in: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update a project.
    """
    project = project_crud.project.get(db=db, id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )
    project = project_crud.project.update(db=db, db_obj=project, obj_in=project_in)
    return project


@router.delete("/{project_id}", response_model=Project)
def delete_project(
    *,
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Delete a project.
    """
    project = project_crud.project.get(db=db, id=project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions"
        )
    project = project_crud.project.remove(db=db, id=project_id)
    return project
