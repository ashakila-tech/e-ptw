from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from typing import List
from ..config import settings

conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_STARTTLS=settings.MAIL_STARTTLS,
    MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=False,  # Temporarily disabled for debugging
    TIMEOUT=settings.MAIL_TIMEOUT
)

async def send_notification_email(subject: str, recipients: List[str], body: str):
    message = MessageSchema(
        subject=subject,
        recipients=recipients,
        body=body,
        subtype=MessageType.html
    )
    
    fm = FastMail(conf)
    await fm.send_message(message)