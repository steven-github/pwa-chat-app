import { useEffect, useState } from 'react';
import { useAuthStore } from './store/authStore';
import { initAuthListener } from './services/authService';
import { Layout } from './components/Layout';
import { AuthForm } from './components/AuthForm';
import { ChatRoom } from './components/ChatRoom';
import { RoomList } from './components/RoomList';
import './styles/global.css';

function App() {
  const { user, loading } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedRoomName, setSelectedRoomName] = useState<string>('');

  useEffect(() => {
    const unsubscribe = initAuthListener();
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}>
        <div style={{ color: 'white', fontSize: '1.5rem' }}>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm isLogin={isLogin} onToggle={() => setIsLogin(!isLogin)} />;
  }

  return (
    <Layout>
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 0, height: 'calc(100vh - 70px)' }}>
        <RoomList 
          onSelectRoom={(roomId, roomName) => {
            setSelectedRoomId(roomId);
            setSelectedRoomName(roomName);
          }}
          selectedRoomId={selectedRoomId || undefined}
        />
        {selectedRoomId ? (
          <ChatRoom roomId={selectedRoomId} roomName={selectedRoomName} />
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            background: '#f9f9f9',
          }}>
            <div style={{ textAlign: 'center', color: '#999' }}>
              <p style={{ fontSize: '16px', fontWeight: 500 }}>Select a room to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default App;
