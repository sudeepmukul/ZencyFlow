import React, { useEffect, useState, useRef } from 'react';
import { useData } from '../../contexts/DataContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Pause, Play, Square, Clock } from 'lucide-react';
import { CheckInModal } from './CheckInModal';
import { useIdleTimer } from '../../hooks/useIdleTimer';

export function TimerWidget() {
    const { activeTimer, stopTimer, pauseTimer, resumeTimer, syncTimerDuration, timerSettings } = useData();
    const [showCheckIn, setShowCheckIn] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isStopping, setIsStopping] = useState(false);
    const lastSyncRef = useRef(0);

    // Initialize local state from DB when timer loads
    useEffect(() => {
        if (activeTimer) {
            const now = Date.now();
            let currentSession = 0;
            if (!activeTimer.isPaused && activeTimer.lastResumeTime) {
                currentSession = (now - new Date(activeTimer.lastResumeTime).getTime()) / 1000;
            }
            setElapsedTime(Math.floor((activeTimer.accumulatedTime || 0) + currentSession));
        }
    }, [activeTimer?.taskId, activeTimer?.lastResumeTime, activeTimer?.accumulatedTime]);

    // Auto Pause on Idle
    useIdleTimer({
        onIdle: () => {
            if (activeTimer && !activeTimer.isPaused) {
                console.log('[TIMER] Auto-pausing due to inactivity');
                pauseTimer();
                new Notification("Timer Paused ⏸️", {
                    body: "We paused your timer because you've been idle.",
                    icon: '/vite.svg'
                });
            }
        },
        timeout: 5 * 60 * 1000 // 5 minutes
    });

    useEffect(() => {
        let interval;
        if (activeTimer && !activeTimer.isPaused) {
            interval = setInterval(() => {
                // Calculate precise time based on wall clock (avoids throttle lag)
                const now = Date.now();
                let currentSession = 0;
                if (activeTimer.lastResumeTime) {
                    currentSession = (now - new Date(activeTimer.lastResumeTime).getTime()) / 1000;
                }
                const total = (activeTimer.accumulatedTime || 0) + currentSession;
                const newTime = Math.floor(total);

                setElapsedTime(newTime);

                // Sync with DB every 30 seconds
                if (now - lastSyncRef.current > 30000) {
                    syncTimerDuration(newTime);
                    lastSyncRef.current = now;
                }

                const lastCheckInTime = new Date(activeTimer.lastCheckIn).getTime();
                const minutesSinceCheckIn = (now - lastCheckInTime) / 1000 / 60;

                if (minutesSinceCheckIn >= (timerSettings.checkInInterval || 30) && !showCheckIn) {
                    setShowCheckIn(true);
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [activeTimer, syncTimerDuration, timerSettings, showCheckIn]);

    const handleStop = async () => {
        if (isStopping) return;
        setIsStopping(true);
        // Sync final duration before stopping (optional now since we pass it, but good for safety)
        await syncTimerDuration(elapsedTime);
        await stopTimer(elapsedTime);
        setIsStopping(false);
    };

    // CRITICAL: Widget closes when activeTimer becomes null
    if (!activeTimer) return null;

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const efficiency = timerSettings.efficiency || 0.6;
    const productiveSeconds = Math.round(elapsedTime * efficiency);

    return (
        <>
            <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
                <Card className="p-4 w-80 shadow-2xl border-neon-400/30 bg-zinc-950/95 backdrop-blur-md">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <div className="text-xs text-neon-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-neon-400 animate-pulse"></span>
                                Active Session
                            </div>
                            <h3 className="font-bold text-white truncate w-48" title={activeTimer.taskTitle}>
                                {activeTimer.taskTitle}
                            </h3>
                        </div>
                        <div className="flex gap-1">
                            {activeTimer.isPaused ? (
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={resumeTimer}
                                    className="h-8 w-8 text-green-400 hover:text-green-300"
                                >
                                    <Play className="w-4 h-4" />
                                </Button>
                            ) : (
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={pauseTimer}
                                    className="h-8 w-8 text-yellow-400 hover:text-yellow-300"
                                >
                                    <Pause className="w-4 h-4" />
                                </Button>
                            )}
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={handleStop}
                                disabled={isStopping}
                                className={`h-8 w-8 text-red-400 hover:text-red-300 ${isStopping ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <Square className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-end justify-between mt-4">
                        <div>
                            <div className="text-3xl font-mono font-bold text-white tracking-widest">
                                {formatTime(elapsedTime)}
                            </div>
                            <div className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                ~{Math.floor(productiveSeconds / 60)}m productive ({efficiency * 100}%)
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            <CheckInModal
                isOpen={showCheckIn}
                onClose={() => setShowCheckIn(false)}
            />
        </>
    );
}
