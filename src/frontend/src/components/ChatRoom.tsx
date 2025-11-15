import { useState, useEffect, useRef } from 'react'
import type { Room, Message, PersonaInfo } from '../types'
import WebSocketClient from '../services/websocket'
import apiClient from '../services/api'
import MessageList from './MessageList'
import PersonaPanel from './PersonaPanel'
import MessageInput from './MessageInput'
import { generateDynamicGradient, updatePersonaActivity } from '../utils/dynamicGradient'
import './ChatRoom.css'

interface ChatRoomProps {
  room: Room
  onBack: () => void
}

function ChatRoom({ room, onBack }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [personas, setPersonas] = useState<PersonaInfo>({})
  const [userId] = useState(() => `user-${Math.random().toString(36).substr(2, 9)}`)
  const [loading, setLoading] = useState(true)
  const [mutedPersonas, setMutedPersonas] = useState<Set<string>>(new Set())
  const [personaActivity, setPersonaActivity] = useState<Record<string, number>>({})
  const wsClientRef = useRef<WebSocketClient | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const activePersonas = Object.keys(personas).filter(id => !mutedPersonas.has(id))
  const backgroundGradient = generateDynamicGradient(activePersonas, personaActivity)

  const handleToggleMute = (personaId: string) => {
    setMutedPersonas((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(personaId)) {
        newSet.delete(personaId)
      } else {
        newSet.add(personaId)
      }
      return newSet
    })
  }

  useEffect(() => {
    loadInitialData()
    return () => {
      wsClientRef.current?.disconnect()
    }
  }, [room.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const [loadedMessages, personasData] = await Promise.all([
        apiClient.getRoomMessages(room.id),
        apiClient.getPersonas(),
      ])
      setMessages(loadedMessages)
      setPersonas(personasData)
      setupWebSocket()
    } catch (err) {
      console.error('Failed to load room data:', err)
    } finally {
      setLoading(false)
    }
  }

  const setupWebSocket = () => {
    wsClientRef.current = new WebSocketClient()
    wsClientRef.current.connect(
      room.id,
      (message: Message) => {
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1]
          if (
            lastMessage &&
            lastMessage.content === message.content &&
            lastMessage.sender_type === message.sender_type &&
            lastMessage.user_id === message.user_id &&
            lastMessage.persona_id === message.persona_id
          ) {
            return prev
          }
          return [...prev, message]
        })

        if (message.sender_type === 'persona' && message.persona_id) {
          setPersonaActivity((prev) => updatePersonaActivity(prev, message.persona_id!))
        }
      },
      () => {
        console.log('WebSocket disconnected')
      }
    )
  }

  const handleSendMessage = (content: string) => {
    if (!wsClientRef.current?.isConnected()) {
      console.error('WebSocket not connected')
      return
    }

    const optimisticMessage: Message = {
      type: 'user_message',
      user_id: userId,
      content,
      sender_type: 'user',
      created_at: new Date().toISOString()
    }

    setMessages((prev) => [...prev, optimisticMessage])

    wsClientRef.current.send({
      user_id: userId,
      message: content,
    })
  }

  return (
    <div className="chat-room" style={{ background: backgroundGradient }}>
      <div className="chat-header">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <div className="chat-title">
          <h2>{room.name}</h2>
          {room.mystery_mode && (
            <span className="mystery-indicator">Mystery Mode</span>
          )}
        </div>
      </div>

      <div className="chat-content">
        <div className="chat-main">
          {loading ? (
            <div className="loading">Loading room...</div>
          ) : (
            <>
              <MessageList
                messages={messages}
                personas={personas}
                userId={userId}
                mutedPersonas={mutedPersonas}
              />
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <aside className="chat-sidebar">
          <PersonaPanel
            personas={personas}
            mysteryMode={room.mystery_mode}
            mutedPersonas={mutedPersonas}
            onToggleMute={handleToggleMute}
          />
        </aside>
      </div>

      <MessageInput onSend={handleSendMessage} />
    </div>
  )
}

export default ChatRoom
