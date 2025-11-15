export interface Persona {
  name: string;
  description: string;
  knowledge_areas: string[];
  behavioral_modes: string[];
  response_style: string;
}

export interface Room {
  id: number;
  name: string;
  mystery_mode: boolean;
  created_at: string;
}

export interface Message {
  id?: number;
  type: 'user_message' | 'persona_message' | 'error';
  user_id?: string;
  persona_id?: string;
  persona_name?: string;
  content: string;
  sender_type: 'user' | 'persona';
  created_at?: string;
}

export interface PersonaInfo {
  [key: string]: Persona;
}
