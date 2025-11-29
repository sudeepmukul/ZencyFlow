import React, { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Outlet } from 'react-router-dom';
import { TimerWidget } from '../timer/TimerWidget';
import { CheckInModal } from '../timer/CheckInModal';
import { NotificationManager } from '../../lib/notifications';
import { useData } from '../../contexts/DataContext';

export function Layout() {
    const { habits, habitLogs } = useData();

    // Notification Logic
    useEffect(() => {
        const checkReminders = () => {
            const now = new Date();
            const hour = now.getHours();
            const minute = now.getMinutes();
            const today = now.toISOString().split('T')[0];

            // Daily Habit Reminder (8 PM)
            if (hour === 20 && minute === 0) {
                const incompleteHabits = habits.filter(h =>
                    !habitLogs.some(l => l.habitId === h.id && l.date === today)
                );

                if (incompleteHabits.length > 0) {
                    NotificationManager.send("Daily Habit Check 🌙", {
                        body: `You have ${incompleteHabits.length} habits left for today. Keep your streak alive!`,
                        tag: 'daily-reminder'
                    });
                }
            }

            // Streak Warning (10 PM)
            if (hour === 22 && minute === 0) {
                const atRiskHabits = habits.filter(h =>
                    h.streak > 0 &&
                    !habitLogs.some(l => l.habitId === h.id && l.date === today)
                );

                if (atRiskHabits.length > 0) {
                    NotificationManager.send("Streak Warning! 🔥", {
                        body: `Don't lose your streak! You have ${atRiskHabits.length} habits at risk.`,
                        tag: 'streak-warning',
                        requireInteraction: true
                    });
                }
            }
        };

        // Check every minute
        const interval = setInterval(checkReminders, 60000);
        return () => clearInterval(interval);
    }, [habits, habitLogs]);

    return (
        <div className="flex h-screen text-white overflow-hidden font-sans selection:bg-neon-500/30 relative">
            <div className="breathing-bg"></div>

            <Sidebar />
            <main className="flex-1 overflow-y-auto glass-panel m-4 rounded-[30px] border border-white/10 relative z-10">
                <div className="max-w-7xl mx-auto p-8">
                    <Outlet />
                </div>
            </main>
            <TimerWidget />
            <CheckInModal />
        </div>
    );
}
