// services/websocketService.ts
import { Notification } from './notification-service';

class WebSocketService {
  private socket: WebSocket | null = null;
  private listeners: ((notification: Notification) => void)[] = [];

  connect(token: string) {
    // Construct WebSocket URL
    const wsUrl = `ws://localhost:8000/ws/notifications?token=${token}`;
    
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log('WebSocket connection established');
    };

    this.socket.onmessage = (event) => {
      try {
        const notification: Notification = JSON.parse(event.data);
        this.listeners.forEach(listener => listener(notification));
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.socket.onclose = (event) => {
      console.log('WebSocket connection closed:', event);
      
      // Attempt to reconnect
      setTimeout(() => {
        this.connect(token);
      }, 5000);
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  addNotificationListener(listener: (notification: Notification) => void) {
    this.listeners.push(listener);
  }

  removeNotificationListener(listener: (notification: Notification) => void) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export default new WebSocketService();