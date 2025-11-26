import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { sendMessage, subscribeToRoomMessages } from '../services/chatService';
import { MessageList } from './MessageList';
import '../styles/chat.css';

interface ChatRoomProps {
  roomId: string;
  roomName: string;
}

export function ChatRoom({ roomId, roomName }: ChatRoomProps) {
  const { user } = useAuthStore();
  const { messages } = useChatStore();
  const [messageText, setMessageText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to real-time messages for this room
  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = subscribeToRoomMessages(roomId, (newMessages) => {
      useChatStore.setState({ messages: newMessages });
    });

    return () => unsubscribe();
  }, [roomId]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageText.trim() || !user) return;

    setError(null);

    try {
      await sendMessage(roomId, {
        text: messageText,
        userId: user.uid,
        userName: user.displayName || user.email || 'Anonymous',
      });

      setMessageText('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      console.error('Error sending message:', err);
    }
  };

  return (
    <div className="chat-room">
      {/* Header */}
      <div className="chat-header">
        <div className="room-info">
          <h2>{roomName}</h2>
          <p className="room-id">#{roomId.substring(0, 8)}</p>
        </div>
        <div className="member-count">
          {messages.length > 0 && <span>{new Set(messages.map(m => m.userId)).size} online</span>}
        </div>
      </div>

      {/* Messages Area */}
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <p>👋 No messages yet. Be the first to say hello!</p>
          </div>
        ) : (
          <>
            <MessageList messages={messages} currentUserId={user?.uid || ''} />
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="error-message">
          <span>❌ {error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Message Input */}
      <form className="message-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type a message..."
          disabled={!user}
          className="message-input"
          autoFocus
        />
        <button
          type="submit"
          disabled={!messageText.trim() || !user}
          className="send-button"
        >
          Send
        </button>
      </form>
    </div>
  );
}
