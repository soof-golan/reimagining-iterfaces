import type { Message, PersonaInfo } from '../types'
import { getPersonaColor, getPersonaImage } from '../utils/personaColors'
import './MessageList.css'

interface MessageListProps {
  messages: Message[]
  personas: PersonaInfo
  userId: string
  mutedPersonas: Set<string>
}

function MessageList({ messages, personas, userId, mutedPersonas }: MessageListProps) {
  const filteredMessages = messages.filter((msg) => {
    if (msg.sender_type === 'persona' && msg.persona_id) {
      return !mutedPersonas.has(msg.persona_id)
    }
    return true
  })

  return (
    <div className="message-list">
      {filteredMessages.length === 0 ? (
        <div className="no-messages">
          <p>Start a conversation!</p>
        </div>
      ) : (
        filteredMessages.map((msg, idx) => (
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
                {getPersonaImage(msg.persona_id) ? (
                  <img
                    src={getPersonaImage(msg.persona_id)!}
                    alt={msg.persona_name || 'Persona'}
                    className="avatar-image"
                  />
                ) : (
                  msg.persona_name?.[0] || '?'
                )}
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
