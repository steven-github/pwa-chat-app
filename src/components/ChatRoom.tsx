import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { 
  sendMessage, 
  subscribeToRoomMessages,
  setUserTyping,
  subscribeToTypingUsers,
  setUserPresence,
  subscribeToUserPresence,
} from '../services/chatService';
import { MessageList } from './MessageList';
import { TypingIndicator } from './TypingIndicator';
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
  const [typingUsers, setTypingUsers] = useState<Array<{ userId: string; userName: string }>>([]);
  const [presenceUsers, setPresenceUsers] = useState<Array<{ userId: string; userName: string; status: 'online' | 'offline' }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Subscribe to real-time messages for this room
  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = subscribeToRoomMessages(roomId, (newMessages) => {
      useChatStore.setState({ messages: newMessages });
    });

    return () => unsubscribe();
  }, [roomId]);

  // Subscribe to typing users
  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = subscribeToTypingUsers(roomId, (users) => {
      setTypingUsers(users);
    });

    return () => unsubscribe();
  }, [roomId]);

  // Subscribe to user presence
  useEffect(() => {
    if (!roomId || !user) return;

    // Set current user as online
    setUserPresence(roomId, user.uid, user.displayName || user.email || 'Anonymous', 'online');

    const unsubscribe = subscribeToUserPresence(roomId, (users) => {
      setPresenceUsers(users);
    });

    // Cleanup: set user as offline when leaving
    return () => {
      unsubscribe();
      setUserPresence(roomId, user.uid, user.displayName || user.email || 'Anonymous', 'offline');
    };
  }, [roomId, user]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);

    // Update typing status
    if (user && roomId) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set typing to true
      setUserTyping(roomId, user.uid, user.displayName || user.email || 'Anonymous', true);

      // Clear typing status after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        setUserTyping(roomId, user.uid, user.displayName || user.email || 'Anonymous', false);
      }, 2000);
    }
  };

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

      // Clear typing status
      if (roomId && user) {
        setUserTyping(roomId, user.uid, user.displayName || user.email || 'Anonymous', false);
      }

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
          {presenceUsers.length > 0 && (
            <span>🟢 {presenceUsers.filter((u) => u.status === 'online').length}/{presenceUsers.length} online</span>
          )}
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

      {/* Typing Indicator */}
      {typingUsers.length > 0 && <TypingIndicator typingUsers={typingUsers} />}

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
          onChange={handleMessageChange}
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
