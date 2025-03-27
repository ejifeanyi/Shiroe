from typing import List, Optional
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate
from app.core.redis_config import cache_with_timeout, invalidate_cache, clear_cache_by_pattern

class CRUDTask(CRUDBase[Task, TaskCreate, TaskUpdate]):
    @cache_with_timeout(prefix="task", timeout=3600)
    def get(self, db: Session, id: str) -> Optional[Task]:
        """
        Retrieve a task by ID with Redis caching
        """
        return super().get(db=db, id=id)
    
    @cache_with_timeout(prefix="tasks_by_project", timeout=1800)
    def get_multi_by_project(
        self, 
        db: Session, 
        project_id: str, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[Task]:
        """
        Retrieve multiple tasks for a project with Redis caching
        """
        return db.query(self.model)\
            .filter(self.model.project_id == project_id)\
            .offset(skip)\
            .limit(limit)\
            .all()
    
    def create(self, db: Session, *, obj_in: TaskCreate) -> Task:
        """
        Create a new task and invalidate relevant caches
        """
        task = super().create(db=db, obj_in=obj_in)
        
        # Invalidate project tasks cache
        clear_cache_by_pattern(f"tasks_by_project:{task.project_id}*")
        
        return task
    
    def update(self, db: Session, *, db_obj: Task, obj_in: TaskUpdate) -> Task:
        """
        Update a task and manage cache invalidation
        """
        task = super().update(db=db, db_obj=db_obj, obj_in=obj_in)
        
        # Invalidate specific task and project tasks cache
        invalidate_cache("task", str(task.id))
        clear_cache_by_pattern(f"tasks_by_project:{task.project_id}*")
        
        return task
    
    def remove(self, db: Session, *, id: str) -> Task:
        """
        Remove a task and manage cache invalidation
        """
        task = super().get(db=db, id=id)
        if task:
            # Invalidate task and project tasks cache before deletion
            invalidate_cache("task", str(task.id))
            clear_cache_by_pattern(f"tasks_by_project:{task.project_id}*")
        
        return super().remove(db=db, id=id)
    
    @cache_with_timeout(prefix="tasks_hierarchy", timeout=1800)
    def get_tasks_with_subtasks(self, db: Session, project_id: str) -> List[Task]:
        """
        Retrieve tasks with subtasks hierarchy for a project with Redis caching
        """
        return db.query(self.model)\
            .filter(
                self.model.project_id == project_id, 
                self.model.parent_task_id is None
            )\
            .all()

task = CRUDTask(Task)