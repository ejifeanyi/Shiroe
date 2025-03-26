from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.project import Project
from app.models.task import Task, TaskStatus
from app.schemas.project import ProjectCreate, ProjectUpdate


class CRUDProject(CRUDBase[Project, ProjectCreate, ProjectUpdate]):
    def create_with_owner(
        self, db: Session, *, obj_in: ProjectCreate, owner_id: UUID
    ) -> Project:
        obj_in_data = obj_in.dict()
        db_obj = Project(**obj_in_data, owner_id=owner_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_multi_by_owner(
        self, db: Session, *, owner_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[Project]:
        return (
            db.query(Project)
            .filter(Project.owner_id == owner_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_projects_with_task_counts(
        self, db: Session, *, owner_id: UUID, skip: int = 0, limit: int = 100
    ) -> List[dict]:
        projects = (
            db.query(Project)
            .filter(Project.owner_id == owner_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

        result = []
        for project in projects:
            total_tasks = db.query(Task).filter(Task.project_id == project.id).count()
            completed_tasks = (
                db.query(Task)
                .filter(Task.project_id == project.id, Task.status == TaskStatus.DONE)
                .count()
            )

            project_data = {
                **project.__dict__,
                "total_tasks": total_tasks,
                "completed_tasks": completed_tasks,
            }
            if "_sa_instance_state" in project_data:
                del project_data["_sa_instance_state"]

            result.append(project_data)

        return result


project = CRUDProject(Project)
