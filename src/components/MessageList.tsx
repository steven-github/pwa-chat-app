import type { ChatMessage } from '../store/chatStore';
import { MessageReactions } from './MessageReactions';
import '../styles/chat.css';

interface MessageListProps {
  messages: ChatMessage[];
  currentUserId: string;
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
  return (
    <div className="message-list">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`message ${message.userId === currentUserId ? 'own-message' : 'other-message'}`}
        >
          <div className="message-avatar">
            {message.userName.charAt(0).toUpperCase()}
          </div>
          <div className="message-content">
            <div className="message-header">
              <span className="message-author">{message.userName}</span>
              <span className="message-time">
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <p className="message-text">{message.text}</p>
            
            {/* Message reactions */}
            {Object.keys(message.reactions || {}).length > 0 && (
              <div className="message-reactions-display">
                <MessageReactions 
                  messageId={message.id}
                  reactions={message.reactions}
                  currentUserId={currentUserId}
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
