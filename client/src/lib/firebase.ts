import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, GoogleAuthProvider, onAuthStateChanged, type User } from "firebase/auth";

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

async function createServerSession(user: User): Promise<void> {
  const idToken = await user.getIdToken();
  const response = await fetch('/api/auth/firebase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
    credentials: 'include',
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Server session creation failed:', errorData);
    throw new Error(errorData.message || 'Failed to authenticate with server');
  }
}

export async function signInWithGoogle(): Promise<User | null> {
  try {
    // Try popup first, fall back to redirect if it fails
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    await createServerSession(user);
    return user;
  } catch (error: any) {
    console.error('Google sign-in error:', error);
    
    // If popup was blocked or failed due to domain issues, try redirect
    if (error.code === 'auth/popup-blocked' || 
        error.code === 'auth/popup-closed-by-user' ||
        error.code === 'auth/unauthorized-domain') {
      console.log('Popup failed, trying redirect...');
      await signInWithRedirect(auth, provider);
      return null;
    }
    
    throw error;
  }
}

// Handle redirect result on page load
export async function handleRedirectResult(): Promise<User | null> {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      await createServerSession(result.user);
      return result.user;
    }
    return null;
  } catch (error) {
    console.error('Redirect result error:', error);
    return null;
  }
}

export async function signOutFirebase(): Promise<void> {
  await signOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}
