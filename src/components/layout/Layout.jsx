import React, { useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TimerWidget } from '../timer/TimerWidget';
import { CheckInModal } from '../timer/CheckInModal';
import { useData } from '../../contexts/DataContext';
import { NotificationManager } from '../../lib/notifications';
import { PanelLeftOpen } from 'lucide-react';

export function Layout() {
    const { tasks, habits, habitLogs } = useData();
    const lastNotificationRef = useRef({});
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

    useEffect(() => {
        NotificationManager.requestPermission();

        // Optional: Auto-collapse on resize to mobile
        const handleResize = () => {
            if (window.innerWidth < 768) setIsSidebarOpen(false);
            else setIsSidebarOpen(true);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const checkNotifications = () => {
            const now = new Date();
            const hour = now.getHours();
            const minute = now.getMinutes();
            const today = now.toISOString().split('T')[0];
            const timeKey = `${today}-${hour}`;

            // Prevent duplicate notifications in the same hour block
            if (lastNotificationRef.current[timeKey]) return;

            // 1. Daily Summary (08:00)
            if (hour === 8 && minute === 0) {
                const pendingTasks = tasks.filter(t => t.status !== 'completed').length;
                if (pendingTasks > 0) {
                    NotificationManager.send("Good Morning! ☀️", {
                        body: `You have ${pendingTasks} tasks pending for today. Let's crush it!`
                    });
                    lastNotificationRef.current[timeKey] = true;
                }
            }

            // 2. Overdue Tasks (09:00)
            if (hour === 9 && minute === 0) {
                const overdueTasks = tasks.filter(t =>
                    t.status !== 'completed' &&
                    t.dueDate &&
                    new Date(t.dueDate) < new Date().setHours(0, 0, 0, 0)
                );

                if (overdueTasks.length > 0) {
                    NotificationManager.send("Overdue Tasks ⚠️", {
                        body: `You have ${overdueTasks.length} overdue tasks. Time to catch up!`
                    });
                    lastNotificationRef.current[timeKey] = true;
                }
            }

            // 3. Daily Habit Check (20:00)
            if (hour === 20 && minute === 0) {
                const completedHabits = habitLogs.filter(l => l.date === today).length;
                const remaining = habits.length - completedHabits;

                if (remaining > 0) {
                    NotificationManager.send("Evening Check-in 🌙", {
                        body: `You still have ${remaining} habits to complete today. Keep the streak alive!`
                    });
                    lastNotificationRef.current[timeKey] = true;
                }
            }

            // 4. Streak Warning (22:00)
            if (hour === 22 && minute === 0) {
                const completedHabitIds = habitLogs.filter(l => l.date === today).map(l => l.habitId);
                const atRiskHabits = habits.filter(h => !completedHabitIds.includes(h.id) && h.streak > 0);

                if (atRiskHabits.length > 0) {
                    NotificationManager.send("Streak Warning! 🔥", {
                        body: `Don't lose your streak in ${atRiskHabits[0].title}${atRiskHabits.length > 1 ? ' and others' : ''}!`
                    });
                    lastNotificationRef.current[timeKey] = true;
                }
            }
        };

        const interval = setInterval(checkNotifications, 60000); // Check every minute
        checkNotifications(); // Run immediately

        return () => clearInterval(interval);
    }, [tasks, habits, habitLogs]);

    return (
        <div className="flex h-screen text-white overflow-hidden font-sans selection:bg-neon-500/30 relative">
            <div className="breathing-bg"></div>

            {/* Sidebar with toggle prop */}
            <div className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-20'} flex-shrink-0 relative`}>
                <div className={`h-full absolute top-0 left-0 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
                    <Sidebar
                        isOpen={isSidebarOpen}
                        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                    />
                </div>
            </div>

            <main id="main-content" className="flex-1 overflow-y-auto glass-panel m-0 md:m-4 rounded-none md:rounded-[30px] border-0 md:border border-white/10 relative z-10">
                <div className="max-w-7xl mx-auto p-4 md:p-8">
                    <Outlet />
                </div>
            </main>
            <TimerWidget />
            <CheckInModal />
        </div>
    );
}
