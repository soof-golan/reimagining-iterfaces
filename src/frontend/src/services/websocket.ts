import type { Message } from '../types';

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private messageHandler: ((message: Message) => void) | null = null;
  private disconnectHandler: (() => void) | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;

  constructor(baseUrl: string = 'ws://localhost:8000') {
    this.url = baseUrl;
  }

  connect(roomId: number, onMessage: (message: Message) => void, onDisconnect?: () => void) {
    this.messageHandler = onMessage;
    this.disconnectHandler = onDisconnect;

    const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsUrl = `${wsProtocol}://localhost:8000/ws/rooms/${roomId}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const message: Message = JSON.parse(event.data);
          this.messageHandler?.(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.disconnectHandler?.();
        this.attemptReconnect(roomId);
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.attemptReconnect(roomId);
    }
  }

  private attemptReconnect(roomId: number) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect(roomId, this.messageHandler!, this.disconnectHandler);
      }, this.reconnectDelay);
    }
  }

  send(message: { user_id: string; message: string }) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

export default WebSocketClient;
