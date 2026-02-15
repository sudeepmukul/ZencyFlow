import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Firebase Cloud Messaging for push notifications
// Lazy-loaded to avoid issues in SSR/non-browser contexts
export const getMessagingInstance = async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        return null;
    }
    try {
        const { getMessaging, getToken, onMessage } = await import('firebase/messaging');
        const messaging = getMessaging(app);
        console.log('[Firebase] Messaging initialized');
        return { messaging, getToken, onMessage };
    } catch (error) {
        console.log('[Firebase] Messaging not available:', error.message);
        return null;
    }
};

// Enable Offline Persistence (The "Native" Offline Mode)
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        console.log('Firebase Persistence Failed: Multiple tabs open');
    } else if (err.code == 'unimplemented') {
        console.log('Firebase Persistence Not Supported');
    }
});