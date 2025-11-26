/**
 * Optional: Firestore Setup Helper Component
 * 
 * Use this component on your first app load to auto-initialize Firestore collections
 * 
 * Example usage in App.tsx:
 * import { FirestoreSetup } from './components/FirestoreSetup'
 * 
 * Then add to your App component:
 * {user && <FirestoreSetup onComplete={() => console.log('Setup done!')} />}
 */

import { useState } from 'react';
import { db } from '../config/firebase';
import { firebaseInit, cleanupExamples } from '../utils/firestoreSetup';

interface FirestoreSetupProps {
  onComplete?: () => void;
  autoCleanup?: boolean; // If true, deletes example docs after setup
}

export function FirestoreSetup({ onComplete, autoCleanup = false }: FirestoreSetupProps) {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInit = async () => {
    if (initialized || loading) return;

    setLoading(true);
    setMessage('Creating collections...');

    try {
      await firebaseInit(db);
      setMessage('✅ Collections created!');

      if (autoCleanup) {
        setMessage('Cleaning up examples...');
        await cleanupExamples(db);
        setMessage('✅ Setup complete!');
      }

      setInitialized(true);
      onComplete?.();
    } catch (error) {
      setMessage('❌ Setup failed - check console');
      console.error('Firestore setup error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-initialize on first mount (optional)
  // Uncomment if you want auto-setup:
  // useEffect(() => {
  //   if (!initialized && !loading) {
  //     handleInit();
  //   }
  // }, [initialized, loading]);

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      padding: '15px',
      background: '#f5f5f5',
      border: '1px solid #ddd',
      borderRadius: '8px',
      maxWidth: '300px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      zIndex: 1000,
    }}>
      <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>
        {message || 'Firestore Setup Helper'}
      </p>

      {!initialized && (
        <button
          onClick={handleInit}
          disabled={loading}
          style={{
            padding: '8px 16px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            fontSize: '14px',
          }}
        >
          {loading ? 'Setting up...' : 'Initialize Collections'}
        </button>
      )}

      {initialized && (
        <div style={{ fontSize: '12px', color: '#666' }}>
          Collections ready to use!
        </div>
      )}
    </div>
  );
}
