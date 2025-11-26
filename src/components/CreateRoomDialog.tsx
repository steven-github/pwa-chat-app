import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { createChatRoom } from '../services/chatService';
import '../styles/chat.css';

interface CreateRoomDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRoomCreated?: (roomId: string, roomName: string) => void;
}

export function CreateRoomDialog({ isOpen, onClose, onRoomCreated }: CreateRoomDialogProps) {
  const { user } = useAuthStore();
  const { addRoom } = useChatStore();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    latitude: 0,
    longitude: 0,
    radius: 10,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => {
          setError(`Location error: ${err.message}`);
        }
      );
    } else {
      setError('Geolocation not supported');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Room name is required');
      return;
    }

    if (!user) {
      setError('You must be logged in');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const roomId = await createChatRoom({
        name: formData.name,
        description: formData.description,
        createdBy: user.uid,
        latitude: formData.latitude,
        longitude: formData.longitude,
        radius: formData.radius,
      });

      addRoom({
        id: roomId,
        name: formData.name,
        description: formData.description,
        createdBy: user.uid,
        createdAt: new Date(),
        memberCount: 1,
        latitude: formData.latitude,
        longitude: formData.longitude,
        radius: formData.radius,
      });

      onRoomCreated?.(roomId, formData.name);
      setFormData({
        name: '',
        description: '',
        latitude: 0,
        longitude: 0,
        radius: 10,
      });
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create room';
      setError(errorMessage);
      console.error('Error creating room:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999,
        }}
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '500px',
          width: '90%',
          zIndex: 1000,
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
        }}
      >
        <h2 style={{ margin: '0 0 20px 0', fontSize: '20px' }}>Create New Room</h2>

        <form onSubmit={handleSubmit}>
          {/* Name Input */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
              Room Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter room name"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Description Input */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your room..."
              disabled={isLoading}
              rows={3}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Location Section */}
          <div style={{ marginBottom: '16px', padding: '12px', background: '#f5f5f5', borderRadius: '6px' }}>
            <p style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600 }}>Location</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>Latitude</label>
                <input
                  type="number"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                  disabled={isLoading}
                  step="0.00001"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    fontSize: '12px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>Longitude</label>
                <input
                  type="number"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                  disabled={isLoading}
                  step="0.00001"
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    fontSize: '12px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '8px',
                background: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                color: '#667eea',
              }}
            >
              📍 Use Current Location
            </button>
          </div>

          {/* Radius Input */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
              Search Radius (km): {formData.radius}
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={formData.radius}
              onChange={(e) => setFormData({ ...formData, radius: parseFloat(e.target.value) })}
              disabled={isLoading}
              style={{ width: '100%' }}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '12px',
              background: '#ffebee',
              border: '1px solid #f44336',
              borderRadius: '4px',
              marginBottom: '16px',
              color: '#c62828',
              fontSize: '14px',
            }}>
              {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '10px',
                background: '#e0e0e0',
                border: 'none',
                borderRadius: '6px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '10px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              {isLoading ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
