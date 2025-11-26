import { useEffect, useState } from 'react';
import { useChatStore } from '../store/chatStore';
import { getChatRooms } from '../services/chatService';
import { CreateRoomDialog } from './CreateRoomDialog';
import '../styles/chat.css';

interface RoomListProps {
  onSelectRoom: (roomId: string, roomName: string) => void;
  selectedRoomId?: string;
}

export function RoomList({ onSelectRoom, selectedRoomId }: RoomListProps) {
  const { rooms, setRooms } = useChatStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Load available rooms
  useEffect(() => {
    const loadRooms = async () => {
      try {
        setIsLoading(true);
        const availableRooms = await getChatRooms();
        setRooms(availableRooms);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load rooms';
        setError(errorMessage);
        console.error('Error loading rooms:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadRooms();
  }, [setRooms]);

  if (isLoading) {
    return (
      <div className="room-list">
        <div className="loading-state">
          <p>Loading rooms...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="room-list">
        <div className="error-state">
          <p>❌ {error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="room-list">
      <div className="room-list-header">
        <h3>Chat Rooms</h3>
        <button
          onClick={() => setIsDialogOpen(true)}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '6px 12px',
            fontSize: '12px',
            cursor: 'pointer',
            fontWeight: 600,
          }}
          title="Create new room"
        >
          ➕
        </button>
      </div>

      {rooms.length === 0 ? (
        <div className="empty-state">
          <p>📭 No rooms available</p>
          <p className="subtitle">Create one to get started!</p>
        </div>
      ) : (
        <ul className="room-items">
          {rooms.map((room) => (
            <li key={room.id}>
              <button
                className={`room-item ${selectedRoomId === room.id ? 'active' : ''}`}
                onClick={() => onSelectRoom(room.id, room.name)}
              >
                <div className="room-item-content">
                  <h4>{room.name}</h4>
                  <p className="room-description">{room.description}</p>
                  <div className="room-meta">
                    <span className="member-badge">👥 {room.memberCount}</span>
                    <span className="time-badge">
                      {new Date(room.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      <CreateRoomDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onRoomCreated={(roomId, roomName) => {
          onSelectRoom(roomId, roomName);
          setIsDialogOpen(false);
          // Reload rooms
          getChatRooms()
            .then((rooms) => setRooms(rooms))
            .catch(console.error);
        }}
      />
    </div>
  );
}
