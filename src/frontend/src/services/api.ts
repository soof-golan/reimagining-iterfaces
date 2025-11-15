import { Room, PersonaInfo, Message } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export class ApiClient {
  async getRooms(): Promise<Room[]> {
    const response = await fetch(`${API_BASE_URL}/rooms`);
    if (!response.ok) throw new Error('Failed to fetch rooms');
    return response.json();
  }

  async createRoom(name: string, mysteryMode: boolean = false): Promise<Room> {
    const params = new URLSearchParams({
      name,
      mystery_mode: String(mysteryMode),
    });

    const response = await fetch(`${API_BASE_URL}/rooms?${params}`, {
      method: 'POST',
    });

    if (!response.ok) throw new Error('Failed to create room');
    return response.json();
  }

  async getRoomMessages(roomId: number): Promise<Message[]> {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/messages`);
    if (!response.ok) throw new Error('Failed to fetch messages');
    return response.json();
  }

  async getPersonas(): Promise<PersonaInfo> {
    const response = await fetch(`${API_BASE_URL}/personas`);
    if (!response.ok) throw new Error('Failed to fetch personas');
    return response.json();
  }
}

export default new ApiClient();
