import React from 'react';

interface TypingIndicatorProps {
  typingUsers: Array<{ userId: string; userName: string }>;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ typingUsers }) => {
  if (typingUsers.length === 0) return null;

  const names = typingUsers.map((u) => u.userName).join(', ');
  const isPlural = typingUsers.length > 1;

  return (
    <div className="typing-indicator">
      <div className="typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <span className="typing-text">
        {names} {isPlural ? 'are' : 'is'} typing...
      </span>
    </div>
  );
};
