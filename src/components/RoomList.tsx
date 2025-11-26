import { useEffect, useState } from 'react';
import { useChatStore } from '../store/chatStore';
import { getChatRooms, getNearbyRooms } from '../services/chatService';
import { getUserLocation, formatDistance, calculateDistance } from '../services/locationService';
import type { ChatRoom } from '../store/chatStore';
import { CreateRoomDialog } from './CreateRoomDialog';
import '../styles/chat.css';

interface RoomListProps {
  onSelectRoom: (roomId: string, roomName: string) => void;
  selectedRoomId?: string;
}

interface RoomWithDistance extends ChatRoom {
  distance?: number;
}

export function RoomList({ onSelectRoom, selectedRoomId }: RoomListProps) {
  const { rooms, setRooms } = useChatStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'nearby'>('all');
  const [filteredRooms, setFilteredRooms] = useState<RoomWithDistance[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Load available rooms
  useEffect(() => {
    const loadRooms = async () => {
      try {
        setIsLoading(true);
        const availableRooms = await getChatRooms();
        setRooms(availableRooms);
        setFilteredRooms(availableRooms);
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

  // Get user location for nearby filtering
  useEffect(() => {
    const loadUserLocation = async () => {
      try {
        const location = await getUserLocation();
        setUserLocation(location);
      } catch (err) {
        // Silently fail - user can still browse all rooms
        console.log('Location unavailable:', err instanceof Error ? err.message : 'Unknown error');
      }
    };

    loadUserLocation();
  }, []);

  // Handle filter mode changes
  useEffect(() => {
    const applyFilter = async () => {
      if (filterMode === 'all') {
        setFilteredRooms(rooms);
      } else if (filterMode === 'nearby') {
        if (!userLocation) {
          setError('Unable to get your location. Please enable geolocation permissions.');
          return;
        }
        
        try {
          setIsGettingLocation(true);
          const nearby = await getNearbyRooms(userLocation.latitude, userLocation.longitude, 10);
          
          // Add distance to each room
          const roomsWithDistance: RoomWithDistance[] = nearby.map((room) => ({
            ...room,
            distance: calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              room.latitude,
              room.longitude
            ),
          }));
          
          // Sort by distance
          roomsWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
          setFilteredRooms(roomsWithDistance);
          setError(null);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to load nearby rooms';
          setError(errorMessage);
          console.error('Error loading nearby rooms:', err);
        } finally {
          setIsGettingLocation(false);
        }
      }
    };

    applyFilter();
  }, [filterMode, rooms, userLocation]);

  return (
    <div className="room-list">
      <div className="room-list-header">
        <h3>Chat Rooms</h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {userLocation && (
            <div className="filter-buttons">
              <button
                className={`filter-btn ${filterMode === 'all' ? 'active' : ''}`}
                onClick={() => setFilterMode('all')}
              >
                All Rooms
              </button>
              <button
                className={`filter-btn ${filterMode === 'nearby' ? 'active' : ''}`}
                onClick={() => setFilterMode('nearby')}
                disabled={isGettingLocation}
              >
                {isGettingLocation ? '⏳ Nearby...' : '📍 Nearby'}
              </button>
            </div>
          )}
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
      </div>

      {filteredRooms.length === 0 && !isLoading ? (
        <div className="empty-state">
          <p>📭 No {filterMode === 'nearby' ? 'nearby' : ''} rooms available</p>
          <p className="subtitle">
            {filterMode === 'nearby'
              ? 'Try expanding your search or browse all rooms'
              : 'Create one to get started!'}
          </p>
        </div>
      ) : isLoading ? (
        <div className="loading-state">
          <p>Loading rooms...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <p>❌ {error}</p>
          {filterMode === 'nearby' && (
            <button onClick={() => setFilterMode('all')} style={{ marginTop: '8px' }}>
              Back to All Rooms
            </button>
          )}
        </div>
      ) : (
        <ul className="room-items">
          {filteredRooms.map((room) => (
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
                    {room.distance !== undefined && (
                      <span className="distance-badge">📍 {formatDistance(room.distance)}</span>
                    )}
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
