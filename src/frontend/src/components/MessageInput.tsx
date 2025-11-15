import { useState } from 'react'
import './MessageInput.css'

interface MessageInputProps {
  onSend: (message: string) => void
}

function MessageInput({ onSend }: MessageInputProps) {
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setSending(true)
    try {
      onSend(input)
      setInput('')
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  return (
    <form className="message-input" onSubmit={handleSubmit}>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Send a message..."
        disabled={sending}
        rows={1}
        maxLength={500}
      />
      <button type="submit" disabled={sending || !input.trim()}>
        {sending ? '...' : '→'}
      </button>
    </form>
  )
}

export default MessageInput
