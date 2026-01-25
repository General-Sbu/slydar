import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, signOut, GoogleAuthProvider, onAuthStateChanged, type User } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA94MfOnralkwev4D6j52SZIzn90x3i_fs",
  authDomain: "slydar-81381.firebaseapp.com",
  projectId: "slydar-81381",
  storageBucket: "slydar-81381.firebasestorage.app",
  messagingSenderId: "869415266609",
  appId: "1:869415266609:web:0640d59da20be2ae32a810",
  measurementId: "G-J24QWY8J9B"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    const idToken = await user.getIdToken();
    const response = await fetch('/api/auth/firebase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to authenticate with server');
    }
    
    return user;
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
}

export async function signOutFirebase(): Promise<void> {
  await signOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}
