import { useState } from 'react'
import { Room } from '../types'
import './RoomList.css'

interface RoomListProps {
  rooms: Room[]
  loading: boolean
  onSelectRoom: (room: Room) => void
  onCreateRoom: (name: string, mysteryMode: boolean) => void
}

function RoomList({ rooms, loading, onSelectRoom, onCreateRoom }: RoomListProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [roomName, setRoomName] = useState('')
  const [mysteryMode, setMysteryMode] = useState(false)
  const [creating, setCreating] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!roomName.trim()) return

    setCreating(true)
    await onCreateRoom(roomName, mysteryMode)
    setRoomName('')
    setMysteryMode(false)
    setShowCreateForm(false)
    setCreating(false)
  }

  return (
    <div className="room-list-container">
      <div className="room-list">
        <div className="room-list-header">
          <h2>Chat Rooms</h2>
          <button
            className="create-btn"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            + New Room
          </button>
        </div>

        {showCreateForm && (
          <form className="create-form" onSubmit={handleCreate}>
            <input
              type="text"
              placeholder="Room name..."
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              maxLength={50}
            />
            <label className="mystery-toggle">
              <input
                type="checkbox"
                checked={mysteryMode}
                onChange={(e) => setMysteryMode(e.target.checked)}
              />
              <span>Mystery Mode (hidden personas)</span>
            </label>
            <div className="form-buttons">
              <button type="submit" disabled={creating || !roomName.trim()}>
                {creating ? 'Creating...' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="loading">Loading rooms...</div>
        ) : rooms.length === 0 ? (
          <div className="no-rooms">
            <p>No rooms yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="rooms-grid">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="room-card"
                onClick={() => onSelectRoom(room)}
              >
                <div className="room-card-header">
                  <h3>{room.name}</h3>
                  {room.mystery_mode && (
                    <span className="mystery-badge">Mystery</span>
                  )}
                </div>
                <p className="room-created">
                  {new Date(room.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default RoomList
