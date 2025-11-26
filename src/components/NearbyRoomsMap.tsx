import { useEffect, useRef, useState } from 'react';
import { getNearbyRooms } from '../services/chatService';
import { calculateDistance } from '../services/locationService';
import type { ChatRoom } from '../store/chatStore';
import '../styles/chat.css';

interface NearbyRoomsMapProps {
  userLat: number;
  userLon: number;
  onSelectRoom: (roomId: string, roomName: string) => void;
  selectedRoomId?: string;
}

export function NearbyRoomsMap({ userLat, userLon, onSelectRoom, selectedRoomId }: NearbyRoomsMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nearbyRooms, setNearbyRooms] = useState<ChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredRoomId, setHoveredRoomId] = useState<string | null>(null);

  // Load nearby rooms
  useEffect(() => {
    const loadRooms = async () => {
      try {
        setIsLoading(true);
        const rooms = await getNearbyRooms(userLat, userLon, 50); // 50km radius
        setNearbyRooms(rooms);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load nearby rooms';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadRooms();
  }, [userLat, userLon]);

  // Draw canvas map
  useEffect(() => {
    if (!canvasRef.current || isLoading || nearbyRooms.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i <= height; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    // Calculate bounds
    let minLat = userLat,
      maxLat = userLat,
      minLon = userLon,
      maxLon = userLon;

    nearbyRooms.forEach((room) => {
      minLat = Math.min(minLat, room.latitude);
      maxLat = Math.max(maxLat, room.latitude);
      minLon = Math.min(minLon, room.longitude);
      maxLon = Math.max(maxLon, room.longitude);
    });

    // Add padding
    const latPadding = (maxLat - minLat) * 0.1 || 0.01;
    const lonPadding = (maxLon - minLon) * 0.1 || 0.01;
    minLat -= latPadding;
    maxLat += latPadding;
    minLon -= lonPadding;
    maxLon += lonPadding;

    // Map coordinates to canvas
    const mapToCanvas = (lat: number, lon: number): [number, number] => {
      const x = ((lon - minLon) / (maxLon - minLon)) * width;
      const y = ((maxLat - lat) / (maxLat - minLat)) * height;
      return [x, y];
    };

    // Draw user location
    const [userX, userY] = mapToCanvas(userLat, userLon);
    ctx.fillStyle = '#667eea';
    ctx.beginPath();
    ctx.arc(userX, userY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(userX, userY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Draw room markers
    nearbyRooms.forEach((room, index) => {
      const [x, y] = mapToCanvas(room.latitude, room.longitude);
      const isSelected = room.id === selectedRoomId;
      const isHovered = room.id === hoveredRoomId;

      // Marker background
      ctx.fillStyle = isSelected ? '#764ba2' : isHovered ? '#667eea' : '#fff';
      ctx.strokeStyle = isSelected ? '#764ba2' : isHovered ? '#667eea' : '#ddd';
      ctx.lineWidth = isSelected || isHovered ? 3 : 2;
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Room number/initial
      ctx.fillStyle = isSelected || isHovered ? 'white' : '#333';
      ctx.font = 'bold 10px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((index + 1).toString(), x, y);
    });

    // Draw scale
    ctx.fillStyle = '#666';
    ctx.font = '12px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('🟢 You', 10, height - 10);
  }, [nearbyRooms, selectedRoomId, hoveredRoomId, isLoading, userLat, userLon]);

  if (isLoading) {
    return (
      <div className="map-container">
        <p>Loading map...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="map-container">
        <p>❌ {error}</p>
      </div>
    );
  }

  if (nearbyRooms.length === 0) {
    return (
      <div className="map-container">
        <p>📭 No nearby rooms found</p>
      </div>
    );
  }

  return (
    <div className="map-view">
      <div className="map-wrapper">
        <canvas
          ref={canvasRef}
          className="map-canvas"
          style={{ width: '100%', height: '100%', cursor: 'crosshair' }}
        />
      </div>

      <div className="map-legend">
        <h4>Nearby Rooms ({nearbyRooms.length})</h4>
        <div className="room-list-compact">
          {nearbyRooms.map((room, index) => {
            const distance = calculateDistance(userLat, userLon, room.latitude, room.longitude);
            return (
              <button
                key={room.id}
                className={`compact-room-item ${selectedRoomId === room.id ? 'active' : ''}`}
                onClick={() => onSelectRoom(room.id, room.name)}
                onMouseEnter={() => setHoveredRoomId(room.id)}
                onMouseLeave={() => setHoveredRoomId(null)}
              >
                <span className="room-number">{index + 1}</span>
                <div className="room-compact-content">
                  <p className="room-compact-name">{room.name}</p>
                  <p className="room-compact-distance">📍 {distance.toFixed(1)} km • 👥 {room.memberCount}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
