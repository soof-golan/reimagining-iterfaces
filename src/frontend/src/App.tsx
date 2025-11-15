import { useState, useEffect } from 'react'
import './App.css'
import RoomList from './components/RoomList'
import ChatRoom from './components/ChatRoom'
import { Room } from './types'
import apiClient from './services/api'

function App() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadRooms()
  }, [])

  const loadRooms = async () => {
    try {
      setLoading(true)
      const fetchedRooms = await apiClient.getRooms()
      setRooms(fetchedRooms)
    } catch (err) {
      setError('Failed to load rooms')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRoom = async (name: string, mysteryMode: boolean) => {
    try {
      const newRoom = await apiClient.createRoom(name, mysteryMode)
      setRooms([newRoom, ...rooms])
      setSelectedRoom(newRoom)
    } catch (err) {
      setError('Failed to create room')
      console.error(err)
    }
  }

  if (selectedRoom) {
    return (
      <ChatRoom
        room={selectedRoom}
        onBack={() => setSelectedRoom(null)}
      />
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Ambient AI Chat</h1>
        <p>Converse with multiple AI personas in real-time</p>
      </header>
      {error && <div className="error-message">{error}</div>}
      <RoomList
        rooms={rooms}
        loading={loading}
        onSelectRoom={setSelectedRoom}
        onCreateRoom={handleCreateRoom}
      />
    </div>
  )
}

export default App
