import React, { useState } from 'react';
import { addReaction } from '../services/chatService';

interface MessageReactionsProps {
  messageId: string;
  reactions?: Record<string, string[]>;
  currentUserId: string;
  onReactionClick?: (emoji: string) => void;
}

const EMOJI_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥', '✨'];

export const MessageReactions: React.FC<MessageReactionsProps> = ({
  messageId,
  reactions = {},
  currentUserId,
  onReactionClick,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReactionClick = async (emoji: string) => {
    setLoading(true);
    try {
      await addReaction(messageId, emoji, currentUserId);
      onReactionClick?.(emoji);
    } catch (error) {
      console.error('Error adding reaction:', error);
    } finally {
      setLoading(false);
      setShowPicker(false);
    }
  };

  return (
    <div className="message-reactions">
      {/* Existing reactions */}
      <div className="reactions-display">
        {Object.entries(reactions).map(([emoji, userIds]) => (
          <button
            key={emoji}
            className={`reaction-pill ${userIds.includes(currentUserId) ? 'reacted' : ''}`}
            onClick={() => handleReactionClick(emoji)}
            disabled={loading}
            title={userIds.join(', ')}
          >
            <span className="emoji">{emoji}</span>
            <span className="count">{userIds.length}</span>
          </button>
        ))}
      </div>

      {/* Add reaction button */}
      <div className="add-reaction">
        <button
          className="add-reaction-btn"
          onClick={() => setShowPicker(!showPicker)}
          title="Add reaction"
          disabled={loading}
        >
          😊
        </button>

        {/* Emoji picker popup */}
        {showPicker && (
          <div className="emoji-picker">
            {EMOJI_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                className="emoji-option"
                onClick={() => handleReactionClick(emoji)}
                disabled={loading}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
