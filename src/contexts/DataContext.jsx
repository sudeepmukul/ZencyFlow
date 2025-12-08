import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '../lib/db';
import { useUser } from './UserContext';

// Track stopped timer IDs to prevent duplicate stops
const stoppedTimerIds = new Set();

const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const { user, addXP, updateProfile, checkAchievements } = useUser();
    const [goals, setGoals] = useState([]);
    const [habits, setHabits] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [sleepLogs, setSleepLogs] = useState([]);
    const [journalEntries, setJournalEntries] = useState([]);
    const [habitLogs, setHabitLogs] = useState([]);
    const [timerLogs, setTimerLogs] = useState([]);
    const [reminders, setReminders] = useState([]);
    const [categories, setCategories] = useState([]);
    const [calendarEvents, setCalendarEvents] = useState([]);
    const [calendarLayers, setCalendarLayers] = useState([]);

    const refreshData = useCallback(async () => {
        try {
            const [
                fetchedGoals,
                fetchedHabits,
                fetchedTasks,
                fetchedSleep,
                fetchedJournal,
                fetchedHabitLogs,
                fetchedReminders,
                fetchedCategories,
                fetchedCalendarEvents,
                fetchedCalendarLayers
            ] = await Promise.all([
                db.getAll('goals'),
                db.getAll('habits'),
                db.getAll('tasks'),
                db.getAll('sleep_logs'),
                db.getAll('journal_entries'),
                db.getAll('habit_logs'),
                db.getAll('reminders'),
                db.getAll('categories'),
                db.getAll('calendar_events'),
                db.getAll('calendar_layers')
            ]);

            const fourDaysAgo = new Date();
            fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

            const tasksToDelete = (fetchedTasks || []).filter(task =>
                task.status === 'completed' &&
                task.completedAt &&
                new Date(task.completedAt) < fourDaysAgo
            );

            for (const task of tasksToDelete) {
                await db.delete('tasks', task.id);
            }

            const activeTasks = (fetchedTasks || []).filter(task =>
                !(task.status === 'completed' && task.completedAt && new Date(task.completedAt) < fourDaysAgo)
            );

            setGoals(fetchedGoals || []);
            setHabits(fetchedHabits || []);
            setTasks(activeTasks);
            setSleepLogs(fetchedSleep || []);
            setJournalEntries(fetchedJournal || []);
            setHabitLogs(fetchedHabitLogs || []);
            setReminders(fetchedReminders || []);
            setCategories(fetchedCategories || []);
            setCalendarEvents(fetchedCalendarEvents || []);

            // Initial Layers Setup
            if (!fetchedCalendarLayers || fetchedCalendarLayers.length === 0) {
                const defaultLayers = [
                    { id: 'tasks', name: 'Tasks', color: '#a855f7', enabled: true, type: 'system' }, // Purple
                    { id: 'work', name: 'Work', color: '#3b82f6', enabled: true, type: 'custom' }, // Blue
                    { id: 'personal', name: 'Personal', color: '#22c55e', enabled: true, type: 'custom' } // Green
                ];
                // We don't save them here to avoid async complexity in the loops, 
                // but we set state. They will be saved when user toggles/edits.
                // Actually better to save if empty so we have persistence.
                setCalendarLayers(defaultLayers);
            } else {
                setCalendarLayers(fetchedCalendarLayers);
            }

            const fetchedTimerLogs = await db.getAll('timer_logs');
            setTimerLogs(fetchedTimerLogs || []);
        } catch (error) {
            console.error("Failed to refresh data:", error);
        }
    }, []);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    const addCategory = async (name) => {
        await db.add('categories', { name, createdAt: new Date() });
        await refreshData();
    };

    const deleteCategory = async (id) => {
        await db.delete('categories', id);
        await refreshData();
    };

    const addGoal = async (goal) => {
        await db.add('goals', { ...goal, createdAt: new Date() });
        await refreshData();
    };

    const updateGoal = async (goal) => {
        await db.put('goals', goal);
        await refreshData();
    };

    const deleteGoal = async (id) => {
        await db.delete('goals', id);
        await refreshData();
    };

    const addHabit = async (habit) => {
        await db.add('habits', { ...habit, streak: 0, longestStreak: 0, createdAt: new Date() });
        await refreshData();
    };

    const toggleHabit = async (habitId, date) => {
        const allLogs = await db.getAll('habit_logs');
        const existing = allLogs.find(log => log.habitId === habitId && log.date === date);
        const habitXP = Math.max(5, Math.floor(100 / habits.length));

        if (existing) {
            await db.delete('habit_logs', existing.id);
            await addXP(-habitXP);
        } else {
            await db.add('habit_logs', { habitId, date });
            await addXP(habitXP);
        }

        const updatedLogs = await db.getAll('habit_logs');
        const thisHabitLogs = updatedLogs.filter(l => l.habitId === habitId);
        const sortedDates = thisHabitLogs.map(l => l.date).sort((a, b) => new Date(b) - new Date(a));

        let streak = 0;
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        let currentDate = null;
        if (sortedDates.includes(today)) {
            currentDate = today;
        } else if (sortedDates.includes(yesterday)) {
            currentDate = yesterday;
        }

        if (currentDate) {
            streak = 1;
            let checkDate = new Date(currentDate);
            while (true) {
                checkDate.setDate(checkDate.getDate() - 1);
                const dateStr = checkDate.toISOString().split('T')[0];
                if (sortedDates.includes(dateStr)) {
                    streak++;
                } else {
                    break;
                }
            }
        }

        const habit = habits.find(h => h.id === habitId);
        if (habit) {
            await db.put('habits', {
                ...habit,
                streak: streak,
                longestStreak: Math.max(habit.longestStreak || 0, streak)
            });
        }

        await refreshData();
        await checkAchievements(tasks, habits);
    };

    const updateHabit = async (habit) => {
        await db.put('habits', habit);
        await refreshData();
    };

    const deleteHabit = async (id) => {
        await db.delete('habits', id);
        await refreshData();
    };

    const addTask = async (task) => {
        const newTask = { ...task, status: 'pending', createdAt: new Date() };
        await db.add('tasks', newTask);
        await refreshData();
        // Optimistic check for immediate feedback (Planner, Prioritizer)
        await checkAchievements([...tasks, newTask], habits);
    };

    const updateTask = async (task) => {
        await db.put('tasks', task);
        await refreshData();
    };

    const toggleTask = async (taskId) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        const updatedTask = task.status === 'completed'
            ? { ...task, status: 'pending', completedAt: null }
            : { ...task, status: 'completed', completedAt: new Date().toISOString() };

        await db.put('tasks', updatedTask);
        if (updatedTask.status === 'completed') {
            await addXP(task.xpValue || 20);
        } else {
            await addXP(-(task.xpValue || 20));
        }

        await refreshData();

        // Pass updated state to achievement check
        const updatedTasks = tasks.map(t => t.id === taskId ? updatedTask : t);
        await checkAchievements(updatedTasks, habits);
    };

    const deleteTask = async (id) => {
        const task = tasks.find(t => t.id === id);
        if (task && task.status === 'completed') {
            await addXP(-(task.xpValue || 20));
        }

        // Stop timer if this task is currently active
        if (user.activeTimer && user.activeTimer.taskId === id) {
            console.log('[DELETE] Stopping timer for deleted task');
            await updateProfile({ activeTimer: null });
        }

        await db.delete('tasks', id);
        await refreshData();
    };

    const reorderTasks = async (newOrder) => {
        setTasks(newOrder);
    };

    const addSleepLog = async (entry) => {
        await db.put('sleep_logs', entry);
        await addXP(15);
        await refreshData();
    };

    const updateSleepLog = async (entry) => {
        await db.put('sleep_logs', entry);
        await refreshData();
    };

    const deleteSleepLog = async (date) => {
        await db.delete('sleep_logs', date);
        await refreshData();
    };

    const addJournalEntry = async (entry) => {
        await db.add('journal_entries', { ...entry, createdAt: new Date() });
        await addXP(15);
        await refreshData();
    };

    const updateJournalEntry = async (entry) => {
        await db.put('journal_entries', entry);
        await refreshData();
    };

    const deleteJournalEntry = async (id) => {
        await db.delete('journal_entries', id);
        await refreshData();
    };

    const addReminder = async (reminder) => {
        await db.add('reminders', { ...reminder, createdAt: new Date() });
        await refreshData();
    };

    const deleteReminder = async (id) => {
        await db.delete('reminders', id);
        await refreshData();
    };

    const addCalendarEvent = async (event) => {
        await db.add('calendar_events', { ...event, createdAt: new Date() });
        await refreshData();
    };

    const updateCalendarEvent = async (event) => {
        await db.put('calendar_events', event);
        await refreshData();
    };

    const deleteCalendarEvent = async (id) => {
        await db.delete('calendar_events', id);
        await refreshData();
    };

    const toggleCalendarLayer = async (layerId) => {
        let newLayers = [...calendarLayers];
        const layerIndex = newLayers.findIndex(l => l.id === layerId);

        if (layerIndex >= 0) {
            newLayers[layerIndex] = { ...newLayers[layerIndex], enabled: !newLayers[layerIndex].enabled };
        } else {
            // Should not happen for system layers, but for new custom logic
            return;
        }

        // Save all layers to DB to persist state
        for (const layer of newLayers) {
            await db.put('calendar_layers', layer);
        }
        setCalendarLayers(newLayers); // Optimistic update
    };

    const addCalendarLayer = async (layer) => {
        await db.add('calendar_layers', layer);
        await refreshData();
    };

    const value = {
        tasks,
        goals,
        habits,
        habitLogs,
        journalEntries,
        sleepLogs,
        reminders,
        categories,
        addTask,
        updateTask,
        toggleTask,
        deleteTask,
        reorderTasks,
        addGoal,
        updateGoal,
        deleteGoal,
        updateGoalProgress: updateGoal,
        addHabit,
        updateHabit,
        deleteHabit,
        toggleHabit,
        toggleHabitLog: toggleHabit,
        addJournalEntry,
        updateJournalEntry,
        deleteJournalEntry,
        addSleepLog,
        updateSleepLog,
        deleteSleepLog,
        addReminder,
        deleteReminder,
        addCategory,
        deleteCategory,
        refreshData,
        calendarEvents,
        calendarLayers,
        addCalendarEvent,
        updateCalendarEvent,
        deleteCalendarEvent,
        toggleCalendarLayer,
        addCalendarLayer,
        activeTimer: user.activeTimer || null,
        timerLogs,
        timerSettings: user.settings?.timer || { efficiency: 0.6, checkInInterval: 30 },

        startTimer: async (taskId) => {
            if (user.activeTimer) {
                alert('Stop the current timer before starting a new one.');
                return;
            }

            const task = tasks.find(t => t.id === taskId);
            if (!task) return;

            const newTimer = {
                taskId,
                taskTitle: task.title,
                startTime: new Date().toISOString(),
                duration: 0,
                accumulatedTime: 0,
                lastResumeTime: new Date().toISOString(),
                lastCheckIn: new Date().toISOString(),
                isPaused: false,
                checkIns: 0
            };

            await updateProfile({ activeTimer: newTimer });
        },

        stopTimer: async (finalDuration = null) => {
            if (!user.activeTimer) {
                console.log('[TIMER] No active timer');
                return;
            }

            const timerId = user.activeTimer.startTime;

            if (stoppedTimerIds.has(timerId)) {
                console.log('[TIMER] Already stopped:', timerId);
                await updateProfile({ activeTimer: null });
                return;
            }

            stoppedTimerIds.add(timerId);
            console.log('[TIMER] Stopping:', timerId);

            const timerData = { ...user.activeTimer };

            try {
                await updateProfile({ activeTimer: null });

                const { taskId, checkIns, startTime, accumulatedTime, lastResumeTime, isPaused } = timerData;

                // Calculate precise duration based on timestamps
                let duration = accumulatedTime || 0;
                if (!isPaused && lastResumeTime) {
                    const now = new Date();
                    const currentSession = (now - new Date(lastResumeTime)) / 1000;
                    duration += currentSession;
                }

                // Fallback to existing duration if calculation fails (safety)
                if (isNaN(duration)) duration = timerData.duration || 0;

                const efficiency = user.settings?.timer?.efficiency || 0.6;
                const productiveDuration = Math.round(duration * efficiency);

                const logEntry = {
                    taskId,
                    startTime,
                    endTime: new Date().toISOString(),
                    duration,
                    productiveDuration,
                    checkIns,
                    createdAt: new Date()
                };

                await db.add('timer_logs', logEntry);

                const xpEarned = Math.floor((productiveDuration / 1800) * 5);
                if (xpEarned > 0) {
                    await addXP(xpEarned);
                }

                await refreshData();
                await checkAchievements(tasks, habits);
                console.log('[TIMER] Stopped successfully');
            } catch (error) {
                console.error('[TIMER] Error:', error);
                await updateProfile({ activeTimer: null });
            }
        },

        pauseTimer: async () => {
            if (!user.activeTimer || user.activeTimer.isPaused) return;

            const now = new Date();
            const lastResume = new Date(user.activeTimer.lastResumeTime || now); // Fallback to now avoids huge jump if missing
            const currentSession = (now - lastResume) / 1000;
            const newAccumulated = (user.activeTimer.accumulatedTime || 0) + currentSession;

            await updateProfile({
                activeTimer: {
                    ...user.activeTimer,
                    isPaused: true,
                    lastResumeTime: null,
                    accumulatedTime: newAccumulated,
                    duration: newAccumulated // Update display duration
                }
            });
        },

        resumeTimer: async () => {
            if (!user.activeTimer || !user.activeTimer.isPaused) return;
            await updateProfile({
                activeTimer: {
                    ...user.activeTimer,
                    isPaused: false,
                    lastResumeTime: new Date().toISOString(),
                    lastCheckIn: new Date().toISOString()
                }
            });
        },

        syncTimerDuration: async (newDuration) => {
            // We kept this for compatibility, but with new logic, duration is derived from timestamps.
            // However, we can update the 'duration' field for simple UI reads if they don't calculate it.
            if (!user.activeTimer || user.activeTimer.isPaused) return;

            // Recalculate based on wall clock to ensure we don't save drifted time
            const now = new Date();
            const lastResume = new Date(user.activeTimer.lastResumeTime);
            const currentSession = (now - lastResume) / 1000;
            const total = (user.activeTimer.accumulatedTime || 0) + currentSession;

            // Only update DB if we want to checkpoint the 'duration' field for redundancy
            await updateProfile({
                activeTimer: {
                    ...user.activeTimer,
                    duration: total
                }
            });
        },

        checkIn: async () => {
            if (!user.activeTimer) return;
            await updateProfile({
                activeTimer: {
                    ...user.activeTimer,
                    lastCheckIn: new Date().toISOString(),
                    checkIns: (user.activeTimer.checkIns || 0) + 1
                }
            });
        },

        updateTimerSettings: async (newSettings) => {
            await updateProfile({
                settings: {
                    ...user.settings,
                    timer: { ...user.settings?.timer, ...newSettings }
                }
            });
        }
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
