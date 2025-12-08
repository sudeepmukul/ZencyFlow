import React, { useEffect, useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export function CheckInModal({ isOpen, onClose }) {
    const { checkIn, pauseTimer } = useData();
    const [timeLeft, setTimeLeft] = useState(120); // 2 minutes to respond

    useEffect(() => {
        let interval;
        if (isOpen) {
            // Play sound when modal opens
            playNotificationSound();

            setTimeLeft(120);
            interval = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        // Auto-pause if time runs out
                        pauseTimer();
                        onClose();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isOpen, pauseTimer, onClose]);

    // Simple beep using Web Audio API
    const playNotificationSound = () => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;

            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
            osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5); // Drop to A4

            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.5);
        } catch (e) {
            console.error("Audio playback failed", e);
        }
    };

    const handleConfirm = () => {
        checkIn();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={() => { }} title="Still Working?">
            <div className="text-center py-6">
                <div className="w-16 h-16 bg-neon-400/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <AlertTriangle className="w-8 h-8 text-neon-400" />
                </div>

                <h3 className="text-xl font-bold text-white mb-2">Are you still focused?</h3>
                <p className="text-zinc-400 mb-6">
                    Just checking in to make sure you're still working on your task.
                    <br />
                    <span className="text-xs text-zinc-500">Auto-pausing in {timeLeft} seconds</span>
                </p>

                <div className="flex gap-3 justify-center">
                    <Button variant="ghost" onClick={() => { pauseTimer(); onClose(); }}>
                        Pause Timer
                    </Button>
                    <Button onClick={handleConfirm} className="px-8">
                        <CheckCircle className="w-4 h-4 mr-2" /> Yes, Continue
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
