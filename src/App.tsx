import { useEffect, useState } from 'react';
import { useAuthStore } from './store/authStore';
import { initAuthListener } from './services/authService';
import { Layout } from './components/Layout';
import { AuthForm } from './components/AuthForm';
import './styles/global.css';

function App() {
  const { user, loading } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);

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
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Welcome, {user.displayName || user.email}!</h2>
        <p>Chat features coming soon...</p>
      </div>
    </Layout>
  );
}

export default App;
