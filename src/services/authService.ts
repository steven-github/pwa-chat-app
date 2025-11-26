import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuthStore } from '../store/authStore';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  latitude?: number;
  longitude?: number;
  subscriptionStatus: 'free' | 'active' | 'canceled' | 'past_due';
  subscriptionPlan?: string;
  createdAt: Date;
  lastLogin?: Date;
}

export const initAuthListener = () => {
  return onAuthStateChanged(auth, async (user) => {
    const { setUser, setLoading } = useAuthStore.getState();
    setLoading(true);

    if (user) {
      try {
        // Fetch user profile from Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setUser(user);
          return;
        }
      } catch (error: unknown) {
        console.error('Error fetching user profile:', error);
      }
    }

    setUser(user);
    setLoading(false);
  });
};

export const registerWithEmail = async (
  email: string,
  password: string,
  displayName: string
) => {
  const { setError } = useAuthStore.getState();

  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;

    // Create user profile in Firestore
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName,
      subscriptionStatus: 'free',
      createdAt: new Date(),
    };

    await setDoc(doc(db, 'users', user.uid), userProfile);
    setError(null);
    return user;
  } catch (error: unknown) {
    const errorMessage = (error as Error).message || 'Registration failed';
    setError(errorMessage);
    throw error;
  }
};

export const loginWithEmail = async (email: string, password: string) => {
  const { setError } = useAuthStore.getState();

  try {
    const result = await signInWithEmailAndPassword(auth, email, password);

    // Update last login
    const userRef = doc(db, 'users', result.user.uid);
    await setDoc(userRef, { lastLogin: new Date() }, { merge: true });

    setError(null);
    return result.user;
  } catch (error: unknown) {
    const errorMessage = (error as Error).message || 'Login failed';
    setError(errorMessage);
    throw error;
  }
};

export const loginWithGoogle = async () => {
  const { setError } = useAuthStore.getState();

  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Create or update user profile
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Anonymous',
        photoURL: user.photoURL || undefined,
        subscriptionStatus: 'free',
        createdAt: new Date(),
      };
      await setDoc(userRef, userProfile);
    } else {
      await setDoc(userRef, { lastLogin: new Date() }, { merge: true });
    }

    setError(null);
    return user;
  } catch (error: unknown) {
    const errorMessage = (error as Error).message || 'Google login failed';
    setError(errorMessage);
    throw error;
  }
};

export const logout = async () => {
  const { setError } = useAuthStore.getState();

  try {
    await signOut(auth);
    setError(null);
  } catch (error: unknown) {
    const errorMessage = (error as Error).message || 'Logout failed';
    setError(errorMessage);
    throw error;
  }
};
