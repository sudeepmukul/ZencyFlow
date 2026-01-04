import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyD-p8GEAN1vomHlDA1GreKArktKQbiLCtI",
    authDomain: "zencyflow.firebaseapp.com",
    projectId: "zencyflow",
    storageBucket: "zencyflow.firebasestorage.app",
    messagingSenderId: "688088421850",
    appId: "1:688088421850:web:d1fb47eb831aaf706adce3",
    measurementId: "G-C6CCVVC8E8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Enable Offline Persistence (The "Native" Offline Mode)
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        console.log('Firebase Persistence Failed: Multiple tabs open');
    } else if (err.code == 'unimplemented') {
        console.log('Firebase Persistence Not Supported');
    }
});