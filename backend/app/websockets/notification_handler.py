# app/websockets/notification_handler.py
import asyncio
from typing import Dict, Set
from fastapi import WebSocket, WebSocketDisconnect
from app.core.database import SessionLocal
from app.crud import notification as notification_crud
from app.models.user import User

class NotificationManager:
    def __init__(self):
        # Store active WebSocket connections per user
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        """
        Add a new WebSocket connection for a specific user
        """
        await websocket.accept()
        
        # Create the set for this user if it doesn't exist
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        
        # Add this specific WebSocket connection
        self.active_connections[user_id].add(websocket)

    def disconnect(self, websocket: WebSocket, user_id: str):
        """
        Remove a WebSocket connection for a specific user
        """
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            
            # If no more connections for this user, remove the set
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_notification(self, user_id: str, notification: dict):
        """
        Send a notification to all WebSocket connections for a specific user
        """
        if user_id in self.active_connections:
            for websocket in self.active_connections[user_id]:
                try:
                    await websocket.send_json(notification)
                except Exception as e:
                    print(f"Error sending notification: {e}")

    async def broadcast_notification(self, notification: dict):
        """
        Broadcast a notification to all active connections
        """
        for user_connections in self.active_connections.values():
            for websocket in user_connections:
                try:
                    await websocket.send_json(notification)
                except Exception as e:
                    print(f"Error broadcasting notification: {e}")

notification_manager = NotificationManager()

async def websocket_notification_endpoint(
    websocket: WebSocket, 
    token: str, 
    current_user: User
):
    """
    WebSocket endpoint for real-time notifications
    """
    try:
        # Connect the WebSocket for this user
        await notification_manager.connect(websocket, str(current_user.id))
        
        # Keep the connection open and listen for messages
        while True:
            # Optional: Receive ping/pong messages or commands from client
            data = await websocket.receive_text()
            
            # You can add logic here for client-side commands if needed
            
    except WebSocketDisconnect:
        # Remove the connection when disconnected
        notification_manager.disconnect(websocket, str(current_user.id))

def create_notification_and_send(
    db: SessionLocal, 
    user_id: str, 
    notification_data: dict
):
    """
    Create a notification in the database and send via WebSocket
    """
    # Create notification in database
    notification = notification_crud.notification.create(
        db=db, 
        obj_in=notification_data
    )
    
    # Send via WebSocket
    asyncio.create_task(
        notification_manager.send_notification(
            user_id, 
            {
                "id": str(notification.id),
                "title": notification.title,
                "message": notification.message,
                "type": notification.type,
                "createdAt": notification.created_at.isoformat(),
                "isRead": notification.is_read
            }
        )
    )