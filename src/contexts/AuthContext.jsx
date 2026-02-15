import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from '../lib/firebase';
import {
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    signOut,
    onAuthStateChanged,
    setPersistence,
    browserLocalPersistence
} from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Detect if running in PWA standalone mode or mobile
const isPWAOrMobile = () => {
    // Check if running as installed PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
        || window.navigator.standalone // iOS Safari
        || document.referrer.includes('android-app://');

    // Check if mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        || window.innerWidth < 768;

    return isStandalone || isMobile;
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null);

    const login = async () => {
        setAuthError(null);
        try {
            // Force local persistence to ensure session survives
            await setPersistence(auth, browserLocalPersistence);

            // 1. Prefer Redirect for Mobile / PWA
            // Popups are often blocked or buggy in standalone mode/social browsers
            if (isPWAOrMobile()) {
                console.log('[Auth] Mobile/PWA detected, using signInWithRedirect...');
                return signInWithRedirect(auth, googleProvider);
            }

            // 2. Try Popup for Desktop
            console.log('[Auth] Desktop detected, attempting signInWithPopup...');
            try {
                const result = await signInWithPopup(auth, googleProvider);
                console.log('[Auth] Popup login successful:', result.user.email);
                return result;
            } catch (popupError) {
                // If popup blocked or failed, fall back to redirect
                if (popupError.code === 'auth/popup-blocked' ||
                    popupError.code === 'auth/popup-closed-by-user' ||
                    popupError.code === 'auth/cancelled-popup-request') {
                    console.log('[Auth] Popup failed, falling back to redirect:', popupError.code);
                    return signInWithRedirect(auth, googleProvider);
                }
                throw popupError;
            }
        } catch (error) {
            console.error('[Auth] Login error:', error);
            setAuthError(error.message);
            alert(`Login Error: ${error.code || error.message}`);
            throw error;
        }
    };

    const logout = () => {
        return signOut(auth);
    };

    // Handle redirect result on app load (for mobile/PWA login)
    useEffect(() => {
        const handleRedirectResult = async () => {
            try {
                const result = await getRedirectResult(auth);
                if (result) {
                    console.log('[Auth] Redirect login successful:', result.user.email);
                    // alert(`Welcome back ${result.user.displayName}!`);
                }
            } catch (error) {
                console.error('[Auth] Redirect result error:', error);
                setAuthError(error.message);
                alert(`Redirect Error: ${error.message}`);
            }
        };

        handleRedirectResult();
    }, []);

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
            if (user) {
                console.log('[Auth] User authenticated:', user.email);
            }
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        login,
        logout,
        authError
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
