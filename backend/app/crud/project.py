from typing import List
import uuid

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.base import CRUDBase
from app.models.project import Project
from app.models.task import Task, TaskStatus
from app.schemas.project import ProjectCreate, ProjectUpdate


class CRUDProject(CRUDBase[Project, ProjectCreate, ProjectUpdate]):
    async def create_with_owner(
        self, db: AsyncSession, *, obj_in: ProjectCreate, owner_id: str
    ) -> Project:
        # Convert string to UUID if needed
        if isinstance(owner_id, str):
            owner_id = uuid.UUID(owner_id)
            
        # Convert obj_in to dictionary if it's a Pydantic model
        if hasattr(obj_in, "dict"):
            obj_in_data = obj_in.dict()
        else:
            obj_in_data = obj_in
            
        db_obj = Project(**obj_in_data, owner_id=owner_id)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def get_multi_by_owner(
        self, db: AsyncSession, *, owner_id: str, skip: int = 0, limit: int = 100
    ) -> List[Project]:
        # Convert string to UUID if needed
        if isinstance(owner_id, str):
            owner_id = uuid.UUID(owner_id)
            
        query = (
            select(Project)
            .where(Project.owner_id == owner_id)
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        return result.scalars().all()

    async def get_projects_with_task_counts(
        self, db: AsyncSession, *, owner_id: str, skip: int = 0, limit: int = 100
    ) -> List[dict]:
        # Convert string to UUID if needed
        if isinstance(owner_id, str):
            owner_id = uuid.UUID(owner_id)
            
        query = (
            select(Project)
            .where(Project.owner_id == owner_id)
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        projects = result.scalars().all()

        result = []
        for project in projects:
            # Get total tasks count
            total_query = (
                select(func.count())
                .select_from(Task)
                .where(Task.project_id == project.id)
            )
            total_result = await db.execute(total_query)
            total_tasks = total_result.scalar() or 0
            
            # Get completed tasks count
            completed_query = (
                select(func.count())
                .select_from(Task)
                .where(
                    Task.project_id == project.id, 
                    Task.status == TaskStatus.DONE
                )
            )
            completed_result = await db.execute(completed_query)
            completed_tasks = completed_result.scalar() or 0

            # Make sure the dict keys match your Pydantic model attributes exactly
            project_data = {
                "id": project.id,
                "name": project.name,
                "description": project.description,
                "deadline": getattr(project, "deadline", None),
                "owner_id": project.owner_id,
                "created_at": project.created_at,
                "updated_at": project.updated_at,
                "total_tasks": total_tasks,
                "completed_tasks": completed_tasks,
            }
            
            result.append(project_data)

        return result


project_crud = CRUDProject(Project)