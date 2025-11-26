import React from 'react';

interface UserPresenceProps {
  users: Array<{ userId: string; userName: string; status: 'online' | 'offline' }>;
}

export const UserPresence: React.FC<UserPresenceProps> = ({ users }) => {
  const onlineUsers = users.filter((u) => u.status === 'online');

  return (
    <div className="user-presence">
      <span className="online-count">
        🟢 {onlineUsers.length} {onlineUsers.length === 1 ? 'user' : 'users'} online
      </span>
      <div className="user-list">
        {users.map((user) => (
          <div key={user.userId} className="user-item">
            <div className={`status-dot ${user.status}`}></div>
            <span className="user-name">{user.userName}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
