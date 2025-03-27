# app/main.py
import logging
from fastapi import FastAPI, WebSocket, Depends
from app.websockets.notification_handler import websocket_notification_endpoint
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from app.api.v1.api import api_router
from app.core.config import settings
from app.core.database import engine
from app.core.scheduler import setup_scheduler
from app.models.user import User
from app.api.deps import get_current_user

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Create tables in the database
def create_tables():
    logger.info("Creating database tables")
    from app.core.database import Base

    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created")


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
)

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Add session middleware
app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.websocket("/ws/notifications")
async def websocket_notifications(
    websocket: WebSocket, 
    token: str, 
    current_user: User = Depends(get_current_user)
):
    await websocket_notification_endpoint(websocket, token, current_user)


@app.get("/")
def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API",
        "documentation": f"{settings.API_V1_STR}/docs",
    }


@app.get("/health")
def health_check():
    """Health check endpoint for monitoring and load balancers"""
    return {"status": "healthy"}


# Startup event to initialize database
@app.on_event("startup")
def startup_event():
    logger.info("Initializing service")
    create_tables()
    setup_scheduler() 
    logger.info("Service started")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
