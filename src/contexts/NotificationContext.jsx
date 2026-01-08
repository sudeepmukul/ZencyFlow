import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import { useData } from './DataContext';
import { useUser } from './UserContext';
import { NotificationManager } from '../lib/notifications';

const NotificationContext = createContext();

// Default notification settings
const DEFAULT_NOTIFICATION_SETTINGS = {
    enabled: false,
    reminders: true,
    taskSchedules: true,
    timerCheckIns: true,
    streakReminders: true,
    streakReminderHour: 20, // 8 PM
};

export const NotificationProvider = ({ children }) => {
    const { tasks, reminders, habits, habitLogs, activeTimer, timerSettings } = useData();
    const { user, updateProfile } = useUser();

    // Get notification settings from user profile
    const notificationSettings = user?.settings?.notifications || DEFAULT_NOTIFICATION_SETTINGS;

    // Refs to track previous state for change detection
    const prevRemindersRef = useRef([]);
    const prevTasksRef = useRef([]);
    const timerCheckInRef = useRef(null);
    const streakReminderRef = useRef(null);

    // Update notification settings
    const updateNotificationSettings = useCallback(async (updates) => {
        await updateProfile({
            settings: {
                ...user?.settings,
                notifications: {
                    ...notificationSettings,
                    ...updates
                }
            }
        });
    }, [user?.settings, notificationSettings, updateProfile]);

    // Enable notifications (request permission + enable setting)
    const enableNotifications = useCallback(async () => {
        console.log('[Notifications] Requesting permission...');
        const granted = await NotificationManager.requestPermission();
        console.log('[Notifications] Permission granted:', granted);
        if (granted) {
            await updateNotificationSettings({ enabled: true });
            console.log('[Notifications] Settings updated, sending test notification...');
            // Use force=true since permission was just granted
            NotificationManager.send("Notifications Enabled! 🔔", {
                body: "You'll now receive reminders to stay on track.",
            }, true);
            return true;
        }
        return false;
    }, [updateNotificationSettings]);

    // --- REMINDER NOTIFICATIONS ---
    useEffect(() => {
        if (!notificationSettings.enabled || !notificationSettings.reminders) {
            NotificationManager.cancelAllWithPrefix('reminder-');
            return;
        }

        // Schedule notifications for all reminders with datetime
        reminders.forEach(reminder => {
            if (!reminder.date) return;

            // Build target datetime
            let targetDate;
            if (reminder.time) {
                // Combine date and time
                const [hours, minutes] = reminder.time.split(':').map(Number);
                targetDate = new Date(reminder.date);
                targetDate.setHours(hours, minutes, 0, 0);
            } else {
                // Default to 9 AM if no time specified
                targetDate = new Date(reminder.date);
                targetDate.setHours(9, 0, 0, 0);
            }

            const key = `reminder-${reminder.id}`;
            console.log(`[Notifications] Scheduling reminder: ${key} for ${targetDate}`);
            NotificationManager.scheduleAt(key, "🔔 Reminder", {
                body: reminder.text,
                tag: key,
            }, targetDate);
        });

        // Cancel notifications for removed reminders
        const currentIds = new Set(reminders.map(r => r.id));
        prevRemindersRef.current.forEach(prevReminder => {
            if (!currentIds.has(prevReminder.id)) {
                NotificationManager.cancelScheduled(`reminder-${prevReminder.id}`);
            }
        });

        prevRemindersRef.current = reminders;
    }, [reminders, notificationSettings.enabled, notificationSettings.reminders]);

    // --- TASK SCHEDULE NOTIFICATIONS ---
    useEffect(() => {
        if (!notificationSettings.enabled || !notificationSettings.taskSchedules) {
            NotificationManager.cancelAllWithPrefix('task-');
            return;
        }

        // Schedule notifications for tasks with due datetime
        tasks.forEach(task => {
            if (!task.dueDate || task.status === 'completed') return;

            // Only schedule if dueDate has a time component
            const dueDate = new Date(task.dueDate);

            // Skip if no time component (ends in 00:00:00)
            const hasTime = task.dueDate.includes('T') && !task.dueDate.endsWith('00:00:00.000Z');
            if (!hasTime) return;

            const key = `task-${task.id}`;
            NotificationManager.scheduleAt(key, "📋 Task Due Now", {
                body: `${task.title} • ${task.category || 'General'} • +${task.xpValue || 20} XP`,
                tag: key,
            }, dueDate);
        });

        // Cancel notifications for completed/removed tasks
        const currentIds = new Set(tasks.filter(t => t.status !== 'completed').map(t => t.id));
        prevTasksRef.current.forEach(prevTask => {
            if (!currentIds.has(prevTask.id)) {
                NotificationManager.cancelScheduled(`task-${prevTask.id}`);
            }
        });

        prevTasksRef.current = tasks;
    }, [tasks, notificationSettings.enabled, notificationSettings.taskSchedules]);

    // --- TIMER CHECK-IN NOTIFICATIONS ---
    useEffect(() => {
        // Clear existing check-in timer
        if (timerCheckInRef.current) {
            clearInterval(timerCheckInRef.current);
            timerCheckInRef.current = null;
        }

        if (!notificationSettings.enabled || !notificationSettings.timerCheckIns) {
            return;
        }

        if (!activeTimer || activeTimer.isPaused) {
            return;
        }

        const checkInIntervalMs = (timerSettings?.checkInInterval || 30) * 60 * 1000;

        // Calculate time since last check-in
        const lastCheckIn = new Date(activeTimer.lastCheckIn);
        const timeSinceCheckIn = Date.now() - lastCheckIn.getTime();

        // Time until next check-in
        const timeUntilCheckIn = Math.max(0, checkInIntervalMs - timeSinceCheckIn);

        // Set timeout for next check-in notification
        const checkInTimeout = setTimeout(() => {
            NotificationManager.send("⏱️ Still Working?", {
                body: `You've been working on "${activeTimer.taskTitle}" for a while. Check in!`,
                tag: 'timer-checkin',
                requireInteraction: true,
            });

            // Set up recurring interval
            timerCheckInRef.current = setInterval(() => {
                if (activeTimer && !activeTimer.isPaused) {
                    NotificationManager.send("⏱️ Focus Check-In", {
                        body: `Still focused on "${activeTimer.taskTitle}"?`,
                        tag: 'timer-checkin',
                        requireInteraction: true,
                    });
                }
            }, checkInIntervalMs);
        }, timeUntilCheckIn);

        timerCheckInRef.current = checkInTimeout;

        return () => {
            if (timerCheckInRef.current) {
                clearTimeout(timerCheckInRef.current);
                clearInterval(timerCheckInRef.current);
            }
        };
    }, [activeTimer, timerSettings, notificationSettings.enabled, notificationSettings.timerCheckIns]);

    // --- STREAK BREAKING REMINDERS ---
    useEffect(() => {
        if (streakReminderRef.current) {
            clearTimeout(streakReminderRef.current);
            streakReminderRef.current = null;
        }

        if (!notificationSettings.enabled || !notificationSettings.streakReminders) {
            return;
        }

        if (!habits || habits.length === 0) {
            return;
        }

        // Calculate next reminder time
        const now = new Date();
        const reminderTime = new Date();
        reminderTime.setHours(notificationSettings.streakReminderHour, 0, 0, 0);

        // If reminder time passed today, schedule for tomorrow
        if (reminderTime <= now) {
            reminderTime.setDate(reminderTime.getDate() + 1);
        }

        const delay = reminderTime.getTime() - now.getTime();

        streakReminderRef.current = setTimeout(() => {
            // Check for habits at risk
            const today = new Date().toISOString().split('T')[0];
            const habitsAtRisk = habits.filter(habit => {
                // Check if habit was completed today
                const completedToday = habitLogs?.some(
                    log => log.habitId === habit.id && log.date === today
                );
                // If not completed and has a streak > 0, it's at risk
                return !completedToday && (habit.streak || 0) > 0;
            });

            if (habitsAtRisk.length > 0) {
                const habitNames = habitsAtRisk.slice(0, 3).map(h => h.name).join(', ');
                const moreCount = habitsAtRisk.length > 3 ? ` +${habitsAtRisk.length - 3} more` : '';

                NotificationManager.send("🔥 Streak at Risk!", {
                    body: `Complete today: ${habitNames}${moreCount}`,
                    tag: 'streak-reminder',
                    requireInteraction: true,
                });
            }

            // Reschedule for next day
            const nextDay = new Date();
            nextDay.setDate(nextDay.getDate() + 1);
            nextDay.setHours(notificationSettings.streakReminderHour, 0, 0, 0);

            // This will trigger the effect again to schedule
        }, delay);

        return () => {
            if (streakReminderRef.current) {
                clearTimeout(streakReminderRef.current);
            }
        };
    }, [habits, habitLogs, notificationSettings.enabled, notificationSettings.streakReminders, notificationSettings.streakReminderHour]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            NotificationManager.clearAll();
        };
    }, []);

    const value = {
        notificationSettings,
        updateNotificationSettings,
        enableNotifications,
        isEnabled: NotificationManager.isEnabled(),
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
