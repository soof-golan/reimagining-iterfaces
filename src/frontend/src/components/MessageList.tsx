import { Message, PersonaInfo } from '../types'
import './MessageList.css'

interface MessageListProps {
  messages: Message[]
  personas: PersonaInfo
  userId: string
}

function MessageList({ messages, personas, userId }: MessageListProps) {
  const getPersonaColor = (personaId: string): string => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
      '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
    ]
    const index = Object.keys(personas).indexOf(personaId) % colors.length
    return colors[index]
  }

  return (
    <div className="message-list">
      {messages.length === 0 ? (
        <div className="no-messages">
          <p>Start a conversation!</p>
        </div>
      ) : (
        messages.map((msg, idx) => (
          <div
            key={idx}
            className={`message message-${msg.sender_type}`}
          >
            {msg.sender_type === 'persona' && msg.persona_id && (
              <div
                className="message-avatar"
                style={{
                  backgroundColor: getPersonaColor(msg.persona_id),
                }}
              >
                {msg.persona_name?.[0] || '?'}
              </div>
            )}

            <div className="message-bubble">
              {msg.sender_type === 'persona' && msg.persona_name && (
                <div className="message-sender">{msg.persona_name}</div>
              )}
              {msg.sender_type === 'user' && (
                <div className="message-sender">You</div>
              )}

              <div className="message-content">{msg.content}</div>

              {msg.created_at && (
                <div className="message-time">
                  {new Date(msg.created_at).toLocaleTimeString()}
                </div>
              )}
            </div>

            {msg.sender_type === 'user' && (
              <div className="message-avatar user-avatar">
                U
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}

export default MessageList
