# app/utils/email.py
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from app.core.config import settings

# Email configuration with updated field names
conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_STARTTLS=settings.MAIL_STARTTLS,
    MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
    USE_CREDENTIALS=settings.MAIL_USE_CREDENTIALS
)

async def send_reset_password_email(email_to: str, username: str, reset_url: str):
    """
    Send password reset email with link
    """
    message = MessageSchema(
        subject="Password Reset Request",
        recipients=[email_to],
        body=f"""
        Hello {username},
        
        You have requested to reset your password. Please click the link below to reset your password:
        
        {reset_url}
        
        This link will expire in {settings.RESET_TOKEN_EXPIRE_MINUTES} minutes.
        
        If you did not request a password reset, please ignore this email.
        
        Best regards,
        Your App Team
        """,
        subtype="plain"
    )
    
    fm = FastMail(conf)
    await fm.send_message(message)