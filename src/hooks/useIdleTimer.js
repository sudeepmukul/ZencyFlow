import { useEffect, useRef } from 'react';

export const useIdleTimer = ({ onIdle, timeout = 300000 }) => { // Default 5 minutes
    const timerRef = useRef(null);

    useEffect(() => {
        const resetTimer = () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(onIdle, timeout);
        };

        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

        // Initial start
        resetTimer();

        // Add listeners
        events.forEach(event => {
            document.addEventListener(event, resetTimer);
        });

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            events.forEach(event => {
                document.removeEventListener(event, resetTimer);
            });
        };
    }, [onIdle, timeout]);
};
