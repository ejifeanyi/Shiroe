from typing import List, Union
from uuid import UUID
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.task import Task, TaskStatus
from app.schemas.task import TaskCreate, TaskUpdate

class CRUDTask(CRUDBase[Task, TaskCreate, TaskUpdate]):
    def create_with_project(
        self, db: Session, *, obj_in: TaskCreate, project_id: Union[UUID, str]
    ) -> Task:
        # Ensure project_id is a string UUID
        project_id = str(project_id) if project_id else None
        obj_in_data = obj_in.dict()
        db_obj = Task(**obj_in_data, project_id=project_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_multi_by_project(
        self, db: Session, *, project_id: Union[UUID, str], skip: int = 0, limit: int = 100
    ) -> List[Task]:
        project_id = str(project_id)
        return (
            db.query(Task)
            .filter(Task.project_id == project_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_multi_by_owner(
        self, 
        db: Session, 
        *, 
        owner_id: Union[UUID, str], 
        skip: int = 0, 
        limit: int = 100
    ) -> List[Task]:
        try:
            owner_id_str = str(owner_id)
            
            return (
                db.query(Task)
                .filter(Task.project_id.in_(
                    db.query(Task.project_id)
                    .join(Task.project)
                    .filter(Task.project.has(owner_id=owner_id_str))
                    .distinct()
                ))
                .offset(skip)
                .limit(limit)
                .all()
            )
        except Exception as e:
            print(f"Error in get_multi_by_owner: {e}")
            raise

    def get_tasks_with_subtasks(self, db: Session, *, project_id: UUID) -> List[Task]:
        # Get all top-level tasks (no parent)
        tasks = (
            db.query(Task)
            .filter(Task.project_id == project_id, Task.parent_task_id.is_(None))
            .all()
        )

        # Build a task hierarchy
        task_dict = {}
        all_tasks = db.query(Task).filter(Task.project_id == project_id).all()

        # Create dict with all tasks
        for task in all_tasks:
            task_dict[task.id] = task
            task.subtasks = []

        # Build hierarchy
        for task in all_tasks:
            if task.parent_task_id and task.parent_task_id in task_dict:
                parent = task_dict[task.parent_task_id]
                parent.subtasks.append(task)

        return tasks

    def get_due_soon_tasks(
        self, db: Session, *, owner_id: UUID, days: int = 7
    ) -> List[Task]:
        today = datetime.utcnow()
        due_date_cutoff = today + timedelta(days=days)

        return (
            db.query(Task)
            .join(Task.project)
            .filter(
                Task.project.has(owner_id=owner_id),
                Task.status != TaskStatus.DONE,
                Task.due_date <= due_date_cutoff,
                Task.due_date >= today,
            )
            .order_by(Task.due_date)
            .all()
        )

    def get_overdue_tasks(self, db: Session, *, owner_id: UUID) -> List[Task]:
        today = datetime.utcnow()

        return (
            db.query(Task)
            .join(Task.project)
            .filter(
                Task.project.has(owner_id=owner_id),
                Task.status != TaskStatus.DONE,
                Task.due_date < today,
            )
            .order_by(Task.due_date)
            .all()
        )


task = CRUDTask(Task)
