# app/crud/task.py
from typing import List, Optional, Union, Dict, Any

from app.crud.base import CRUDBase
from app.models.task import Task
from app.models.project import Project
from app.schemas.task import TaskCreate, TaskUpdate
from app.core.redis_config import cache_with_timeout, invalidate_cache, clear_cache_by_pattern

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

class CRUDTask(CRUDBase[Task, TaskCreate, TaskUpdate]):
    @cache_with_timeout(prefix="task", timeout=3600)
    async def get(self, db: AsyncSession, id: str) -> Optional[Task]:
        result = await db.execute(select(self.model).where(self.model.id == id))
        return result.scalars().first()
    
    @cache_with_timeout(prefix="tasks_by_project", timeout=1800)
    async def get_multi_by_project(
        self, 
        db: AsyncSession, 
        project_id: str, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[Task]:
        result = await db.execute(
            select(self.model)
            .where(self.model.project_id == project_id)
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_multi_by_owner(
        self,
        db: AsyncSession,
        owner_id: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[Task]:
        # This would join with projects to filter by owner
        # For example:
        result = await db.execute(
            select(self.model)
            .join(self.model.project)  # Assuming there's a relationship defined
            .where(Project.owner_id == owner_id)  # You'll need to import Project
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
    
    async def create(self, db: AsyncSession, *, obj_in: TaskCreate) -> Task:
        db_obj = self.model(**obj_in.dict())
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        
        # Invalidate project tasks cache
        await clear_cache_by_pattern(f"tasks_by_project:{db_obj.project_id}*")
        return db_obj
    
    async def update(self, db: AsyncSession, *, db_obj: Task, obj_in: Union[TaskUpdate, Dict[str, Any]]) -> Task:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
        
        # Rest of your update logic
        for field in update_data:
            setattr(db_obj, field, update_data[field])
        
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        
        # Invalidate caches
        await invalidate_cache("task", str(db_obj.id))
        await clear_cache_by_pattern(f"tasks_by_project:{db_obj.project_id}*")
        return db_obj
    
    async def remove(self, db: AsyncSession, *, id: str) -> Task:
        result = await db.execute(select(self.model).where(self.model.id == id))
        task = result.scalars().first()
        if task:
            # Invalidate caches before deletion
            await invalidate_cache("task", str(task.id))
            await clear_cache_by_pattern(f"tasks_by_project:{task.project_id}*")
            await db.delete(task)
            await db.commit()
        return task
    
    @cache_with_timeout(prefix="tasks_hierarchy", timeout=1800)
    async def get_tasks_with_subtasks(self, db: AsyncSession, project_id: str) -> List[Task]:
        result = await db.execute(
            select(self.model)
            .where(
                self.model.project_id == project_id,
                self.model.parent_task_id.is_(None)
            )
            .options(selectinload(self.model.subtasks))
        )
        return result.scalars().all()

# Create an instance of the CRUD class to be imported elsewhere
task_crud = CRUDTask(Task)