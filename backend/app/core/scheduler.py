# app/core/scheduler.py
import logging
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
from apscheduler.executors.pool import ThreadPoolExecutor

from app.core.config import settings
from app.services.notification_service import check_for_approaching_deadlines
from app.core.database import SessionLocal

logger = logging.getLogger(__name__)

# Configure the scheduler
jobstores = {
    'default': SQLAlchemyJobStore(url=settings.SQLALCHEMY_DATABASE_URI)
}

executors = {
    'default': ThreadPoolExecutor(20)
}

scheduler = BackgroundScheduler(
    jobstores=jobstores,
    executors=executors,
    timezone=settings.TIMEZONE
)

def check_deadlines_job():
    """Job to check for approaching deadlines and create notifications."""
    db = SessionLocal()
    try:
        notifications_created = check_for_approaching_deadlines(db=db)
        logger.info(f"Deadline check completed. Created {notifications_created} notifications.")
    except Exception as e:
        logger.error(f"Error checking deadlines: {e}")
    finally:
        db.close()

def setup_scheduler():
    """Set up the scheduler with all the required jobs."""
    # Schedule the deadline check job to run every day at midnight
    scheduler.add_job(
        check_deadlines_job,
        'cron',
        hour=0,
        minute=0,
        id='check_deadlines',
        replace_existing=True,
    )
    
    scheduler.start()
    logger.info("Scheduler started")