from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth, 
    projects, 
    tasks, 
    dashboard, 
    notifications, 
    profile, 
    settings, 
    task_prioritization
)

api_router = APIRouter()

# Include routers from endpoints
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(profile.router, prefix="/profile", tags=["profile"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])

# Add task prioritization with a unique prefix or tag
api_router.include_router(task_prioritization.router, prefix="/tasks/prioritize", tags=["task_prioritization"])