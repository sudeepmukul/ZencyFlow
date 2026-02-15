import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '../lib/db';
import { db as firestore } from '../lib/firebase';
import { doc, setDoc, deleteDoc, collection, getDocs, writeBatch, onSnapshot } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { useUser } from './UserContext';
import { TASK_PENALTIES } from '../lib/penaltyConfig';

// Track stopped timer IDs to prevent duplicate stops
const stoppedTimerIds = new Set();

const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const { user, addXP, addHearts, updateProfile, checkAchievements } = useUser();
    const { currentUser } = useAuth();
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
    const [rewards, setRewards] = useState([]);
    const [rewardHistory, setRewardHistory] = useState([]);
    const [activityLogs, setActivityLogs] = useState([]);
    const [syncStatus, setSyncStatus] = useState('offline'); // 'offline' | 'syncing' | 'synced'

    // Activity Log Helper
    const addActivityLog = async (logEntry) => {
        const entry = {
            ...logEntry,
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        await db.add('activity_logs', entry);
        await syncItem('activity_logs', entry);
        setActivityLogs(prev => [entry, ...prev]);
    };

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
                db.getAll('calendar_layers'),
                db.getAll('rewards'),
                db.getAll('reward_history')
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

            // DAILY QUEST RESET LOGIC
            // Find all 'daily' tasks that are COMPLETED
            const completedDailyTasks = (fetchedTasks || []).filter(task =>
                task.status === 'completed' &&
                task.repeat === 'daily'
            );

            const todayStr = new Date().toISOString().split('T')[0];

            for (const dailyTask of completedDailyTasks) {
                if (!dailyTask.completedAt) continue;

                const completionDate = new Date(dailyTask.completedAt).toISOString().split('T')[0];

                // If completed on a PREVIOUS day (not today)
                if (completionDate < todayStr) {
                    // Check if we ALREADY generated a new one for today to avoid duplicates
                    // We look for a PENDING task with the SAME title and 'daily' flag
                    const alreadyReset = (fetchedTasks || []).some(t =>
                        t.title === dailyTask.title &&
                        t.repeat === 'daily' &&
                        t.status !== 'completed'
                    );

                    if (!alreadyReset) {
                        console.log(`[Daily Reset] Regenerating task: ${dailyTask.title}`);
                        const newTask = {
                            ...dailyTask,
                            id: undefined, // Let DB assign new ID
                            status: 'pending',
                            completedAt: null,
                            createdAt: new Date(),
                            originalId: dailyTask.id // Optional: track lineage
                        };
                        // Remove 'id' properly if spreading didn't do it (it does for undefined, but safer to delete)
                        delete newTask.id;

                        await db.add('tasks', newTask);
                    }
                }
            }
            // End Daily Quest Logic

            // Re-fetch tasks to include any newly generated ones
            const refreshedTasks = await db.getAll('tasks');

            const activeTasks = (refreshedTasks || []).filter(task =>
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

            setRewards(await db.getAll('rewards') || []);
            setRewardHistory(await db.getAll('reward_history') || []);

            const fetchedTimerLogs = await db.getAll('timer_logs');
            setTimerLogs(fetchedTimerLogs || []);

            try {
                const fetchedActivityLogs = await db.getAll('activity_logs');
                setActivityLogs((fetchedActivityLogs || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
            } catch (e) { setActivityLogs([]); }
        } catch (error) {
            console.error("Failed to refresh data:", error);
        }
    }, []);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    // --- CLOUD SYNC LOGIC ---

    const syncItem = async (collectionName, item, isDelete = false) => {
        if (!currentUser) return; // Only sync if logged in

        try {
            const userDocRef = doc(firestore, 'users', currentUser.uid, collectionName, item.id.toString());
            if (isDelete) {
                await deleteDoc(userDocRef);
            } else {
                // Ensure we save ISO strings for dates to avoid serializaton issues if they are Date objects
                // (Most of our app uses strings, but safety first)
                await setDoc(userDocRef, item, { merge: true });
            }
        } catch (error) {
            console.error(`[Sync] Failed to sync ${collectionName} ${item.id}:`, error);
        }
    };

    // Real-time sync from cloud using onSnapshot listeners
    useEffect(() => {
        if (!currentUser) {
            setSyncStatus('offline');
            return;
        }

        console.log('[Sync] Setting up real-time listeners for user:', currentUser.uid);
        setSyncStatus('syncing');

        const collectionsToSync = [
            'goals', 'habits', 'tasks', 'reminders', 'categories', 'rewards', 'reward_history',
            'sleep_logs', 'journal_entries', 'habit_logs', 'timer_logs', 'calendar_events', 'calendar_layers',
            'activity_logs'
        ];

        // Map collection names to state setters
        const stateSetters = {
            goals: setGoals,
            habits: setHabits,
            tasks: setTasks,
            reminders: setReminders,
            categories: setCategories,
            rewards: setRewards,
            reward_history: setRewardHistory,
            sleep_logs: setSleepLogs,
            journal_entries: setJournalEntries,
            habit_logs: setHabitLogs,
            timer_logs: setTimerLogs,
            calendar_events: setCalendarEvents,
            calendar_layers: setCalendarLayers,
            activity_logs: setActivityLogs
        };

        const unsubscribers = [];

        // Initial pull to populate local IndexedDB
        const initialPull = async () => {
            try {
                for (const colName of collectionsToSync) {
                    const querySnapshot = await getDocs(collection(firestore, 'users', currentUser.uid, colName));
                    const cloudItems = [];
                    querySnapshot.forEach((doc) => {
                        cloudItems.push(doc.data());
                    });

                    if (cloudItems.length === 0) continue;

                    // Merge logic: Last Write Wins based on updatedAt
                    const localItems = await db.getAll(colName);

                    for (const cloudItem of cloudItems) {
                        const localItem = localItems.find(i => {
                            if (colName === 'sleep_logs') {
                                return i.date === cloudItem.date;
                            }
                            return i.id === cloudItem.id;
                        });

                        let shouldUpdate = false;
                        if (!localItem) {
                            shouldUpdate = true;
                        } else {
                            const cloudTime = new Date(cloudItem.updatedAt || cloudItem.createdAt || 0).getTime();
                            const localTime = new Date(localItem.updatedAt || localItem.createdAt || 0).getTime();
                            if (cloudTime > localTime) {
                                shouldUpdate = true;
                            }
                        }

                        if (shouldUpdate) {
                            await db.put(colName, cloudItem);
                        }
                    }
                }
                await refreshData();
                console.log('[Sync] Initial pull complete');
            } catch (error) {
                console.error('[Sync] Initial pull failed:', error);
            }
        };

        initialPull();

        // Set up real-time listeners for each collection
        for (const colName of collectionsToSync) {
            const colRef = collection(firestore, 'users', currentUser.uid, colName);

            const unsub = onSnapshot(colRef, async (snapshot) => {
                if (snapshot.metadata.hasPendingWrites) {
                    // Local write, ignore to avoid loops
                    return;
                }

                console.log(`[Sync] Real-time update for ${colName}: ${snapshot.docChanges().length} changes`);

                const changes = snapshot.docChanges();
                if (changes.length === 0) return;

                for (const change of changes) {
                    const item = change.doc.data();

                    if (change.type === 'added' || change.type === 'modified') {
                        // Save to local IndexedDB
                        await db.put(colName, item);
                    } else if (change.type === 'removed') {
                        // Delete from local IndexedDB
                        const itemKey = colName === 'sleep_logs' ? item.date : item.id;
                        if (itemKey) {
                            await db.delete(colName, itemKey);
                        }
                    }
                }

                // Refresh state from local DB after updates
                const updatedItems = await db.getAll(colName);
                const setter = stateSetters[colName];
                if (setter) {
                    setter(updatedItems || []);
                }

                setSyncStatus('synced');
            }, (error) => {
                console.error(`[Sync] Listener error for ${colName}:`, error);
                setSyncStatus('offline');
            });

            unsubscribers.push(unsub);
        }

        setSyncStatus('synced');

        // Cleanup listeners on unmount or logout
        return () => {
            console.log('[Sync] Cleaning up listeners');
            unsubscribers.forEach(unsub => unsub());
        };
    }, [currentUser, refreshData]);

    // Force push all local data to cloud (for initial sync or recovery)
    const pushAllToCloud = async () => {
        if (!currentUser) {
            console.log('[Sync] Cannot push: Not logged in');
            return false;
        }

        console.log('[Sync] Pushing all local data to cloud...');
        try {
            const collectionsToSync = [
                'goals', 'habits', 'tasks', 'reminders', 'categories', 'rewards', 'reward_history',
                'sleep_logs', 'journal_entries', 'habit_logs', 'timer_logs', 'calendar_events', 'calendar_layers'
            ];

            for (const colName of collectionsToSync) {
                const localItems = await db.getAll(colName);
                for (const item of localItems) {
                    // Ensure item has updatedAt for sync comparison
                    const itemWithTimestamp = {
                        ...item,
                        updatedAt: item.updatedAt || new Date().toISOString()
                    };

                    // Handle sleep_logs which use 'date' as ID
                    const itemId = colName === 'sleep_logs' ? item.date : item.id;
                    if (!itemId) continue; // Skip items without proper ID

                    const userDocRef = doc(firestore, 'users', currentUser.uid, colName, itemId.toString());
                    await setDoc(userDocRef, itemWithTimestamp, { merge: true });
                }
                console.log(`[Sync] Pushed ${localItems.length} items from ${colName}`);
            }

            console.log('[Sync] Push complete!');
            return true;
        } catch (error) {
            console.error('[Sync] Push failed:', error);
            return false;
        }
    };


    // --- CRUD WRAPPERS ---

    const addCategory = async (name) => {
        const newCategory = {
            id: crypto.randomUUID(),
            name,
            createdAt: new Date(),
            updatedAt: new Date().toISOString()
        };
        await db.add('categories', newCategory);
        await syncItem('categories', newCategory);
        await refreshData();
    };

    const deleteCategory = async (id) => {
        await db.delete('categories', id);
        await syncItem('categories', { id }, true);
        await refreshData();
    };

    const updateCategory = async (category) => {
        const updated = { ...category, updatedAt: new Date().toISOString() };
        await db.put('categories', updated);
        await syncItem('categories', updated);
        await refreshData();
    };

    const addGoal = async (goal) => {
        const newGoal = {
            ...goal,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date().toISOString()
        };
        await db.add('goals', newGoal);
        await syncItem('goals', newGoal);
        await refreshData();
    };

    const updateGoal = async (goal) => {
        const updatedGoal = { ...goal, updatedAt: new Date().toISOString() };
        await db.put('goals', updatedGoal);
        await syncItem('goals', updatedGoal);
        await refreshData();
    };

    const deleteGoal = async (id) => {
        await db.delete('goals', id);
        await syncItem('goals', { id }, true);
        await refreshData();
    };

    const addHabit = async (habit) => {
        const newHabit = {
            ...habit,
            id: crypto.randomUUID(), // Force UUID
            streak: 0,
            longestStreak: 0,
            hearts: 3,
            maxHearts: 3,
            createdAt: new Date(),
            updatedAt: new Date().toISOString()
        };
        await db.add('habits', newHabit);
        await syncItem('habits', newHabit);
        await refreshData();
    };

    const toggleHabit = async (habitId, date) => {
        const allLogs = await db.getAll('habit_logs');
        const existing = allLogs.find(log => log.habitId === habitId && log.date === date);
        const habitXP = Math.max(5, Math.floor(100 / habits.length));

        if (existing) {
            await db.delete('habit_logs', existing.id);
            if (existing.id) await syncItem('habit_logs', existing, true);
            await addXP(-habitXP);
        } else {
            const newLog = {
                id: crypto.randomUUID(),
                habitId,
                date,
                updatedAt: new Date().toISOString()
            };
            await db.add('habit_logs', newLog);
            await syncItem('habit_logs', newLog);
            await addXP(habitXP);
            if (addHearts) await addHearts(1);
            await addActivityLog({ type: 'habit_completed', icon: '💪', message: `Completed habit`, xpChange: habitXP });
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
            const currentHearts = habit.hearts ?? 3;
            const maxH = habit.maxHearts || 3;
            let newHearts = currentHearts;
            let newStreak = streak;

            // If streak dropped (user un-toggled or missed), deduct a heart
            if (existing && streak < (habit.streak || 0)) {
                newHearts = Math.max(0, currentHearts - 1);
                if (newHearts <= 0) {
                    // All hearts gone — streak breaks
                    newStreak = 0;
                    newHearts = 0;
                    await addActivityLog({ type: 'habit_streak_broken', icon: '💔', message: `Lost streak on "${habit.title}" (no hearts left)`, xpChange: 0 });
                } else {
                    await addActivityLog({ type: 'habit_heart_lost', icon: '🖤', message: `Lost a heart on "${habit.title}" (${newHearts}/${maxH} left)`, xpChange: 0 });
                }
            }

            const updatedHabit = {
                ...habit,
                streak: newStreak,
                hearts: newHearts,
                longestStreak: Math.max(habit.longestStreak || 0, newStreak),
                updatedAt: new Date().toISOString()
            };
            await db.put('habits', updatedHabit);
            await syncItem('habits', updatedHabit);
        }

        await refreshData();
        await checkAchievements(tasks, habits);
    };

    const updateHabit = async (habit) => {
        const updatedHabit = { ...habit, updatedAt: new Date().toISOString() };
        await db.put('habits', updatedHabit);
        await syncItem('habits', updatedHabit);
        await refreshData();
    };

    const deleteHabit = async (id) => {
        await db.delete('habits', id);
        await syncItem('habits', { id }, true);
        await refreshData();
    };

    const addTask = async (task) => {
        const newTask = {
            ...task,
            id: crypto.randomUUID(),
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date().toISOString()
        };
        await db.add('tasks', newTask);
        await syncItem('tasks', newTask);
        await addActivityLog({ type: 'task_added', icon: '📋', message: `Added "${newTask.title}"`, xpChange: 0 });
        await refreshData();
        await checkAchievements([...tasks, newTask], habits);
    };

    const updateTask = async (task) => {
        const updatedTask = { ...task, updatedAt: new Date().toISOString() };
        await db.put('tasks', updatedTask);
        await syncItem('tasks', updatedTask);
        await refreshData();
    };

    const toggleTask = async (taskId) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        const updatedTask = task.status === 'completed'
            ? { ...task, status: 'pending', completedAt: null, updatedAt: new Date().toISOString() }
            : { ...task, status: 'completed', completedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };

        await db.put('tasks', updatedTask);
        await syncItem('tasks', updatedTask);

        if (updatedTask.status === 'completed') {
            const xp = task.xpValue || 20;
            await addXP(xp);
            if (addHearts) await addHearts(1);
            await addActivityLog({ type: 'task_completed', icon: '✅', message: `Completed "${task.title}"`, xpChange: xp });
        } else {
            const xp = task.xpValue || 20;
            await addXP(-xp);
            await addActivityLog({ type: 'task_uncompleted', icon: '↩️', message: `Uncompleted "${task.title}"`, xpChange: -xp });
        }

        await refreshData();

        const updatedTasks = tasks.map(t => t.id === taskId ? updatedTask : t);
        await checkAchievements(updatedTasks, habits);
    };

    const skipTask = async (taskId) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        const penalty = TASK_PENALTIES[task.priority] || TASK_PENALTIES.Low;

        const updatedTask = {
            ...task,
            status: 'skipped',
            skippedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await db.put('tasks', updatedTask);
        await syncItem('tasks', updatedTask);
        await addXP(-penalty);
        await addActivityLog({ type: 'task_skipped', icon: '📉', message: `Skipped "${task.title}"`, xpChange: -penalty, priority: task.priority });
        await refreshData();
    };

    const deleteTask = async (id) => {
        const task = tasks.find(t => t.id === id);

        if (task) {
            if (task.status === 'completed') {
                // Deleting a completed task removes its XP
                await addXP(-(task.xpValue || 20));
            } else if (task.dueDate) {
                // Check if task is overdue and incomplete - apply penalty
                const now = new Date();
                const dueDate = new Date(task.dueDate);
                if (dueDate < now) {
                    // Import penalty config
                    const { TASK_PENALTIES } = await import('../lib/penaltyConfig.js');
                    const penalty = TASK_PENALTIES[task.priority] || TASK_PENALTIES.Low;
                    console.log(`[Penalty] Task skipped: -${penalty} XP (${task.priority} priority)`);
                    await addXP(-penalty);
                }
            }
        }

        if (user.activeTimer && user.activeTimer.taskId === id) {
            console.log('[DELETE] Stopping timer for deleted task');
            await updateProfile({ activeTimer: null });
        }

        await db.delete('tasks', id);
        await syncItem('tasks', { id }, true);
        await refreshData();
    };

    const reorderTasks = async (newOrder) => {
        // This usually just updates indices. We'd need to save all changed tasks.
        // For simplicity, we just set state. If we want to persist order, we need to save each task.
        setTasks(newOrder);
        // Implement bulk sync if order is a property on task objects.
    };

    const toggleSubtask = async (taskId, subtaskId) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task || !task.subtasks) return;

        const updatedSubtasks = task.subtasks.map(s =>
            s.id === subtaskId ? { ...s, completed: !s.completed } : s
        );

        let newStatus = task.status;
        let newCompletedAt = task.completedAt;

        // Auto-complete logic based on subtasks
        const allCompleted = updatedSubtasks.length > 0 && updatedSubtasks.every(s => s.completed);

        if (allCompleted && task.status !== 'completed') {
            newStatus = 'completed';
            newCompletedAt = new Date().toISOString();
            await addXP(task.xpValue || 20);
        } else if (!allCompleted && task.status === 'completed') {
            // Reopen if no longer all completed
            newStatus = 'todo';
            newCompletedAt = null;
            await addXP(-(task.xpValue || 20));
        }

        const updatedTask = {
            ...task,
            subtasks: updatedSubtasks,
            status: newStatus,
            completedAt: newCompletedAt,
            updatedAt: new Date().toISOString()
        };

        await db.put('tasks', updatedTask);
        await syncItem('tasks', updatedTask);
        await refreshData();
    };

    const addSleepLog = async (entry) => {
        // Sleep logs use 'date' as key in DB config.
        // We'll treat date as ID
        const newEntry = { ...entry, id: entry.date, updatedAt: new Date().toISOString() };
        await db.put('sleep_logs', newEntry);
        await syncItem('sleep_logs', newEntry);
        await addXP(15);
        await refreshData();
    };

    const updateSleepLog = async (entry) => {
        const updatedEntry = { ...entry, id: entry.date, updatedAt: new Date().toISOString() };
        await db.put('sleep_logs', updatedEntry);
        await syncItem('sleep_logs', updatedEntry);
        await refreshData();
    };

    const deleteSleepLog = async (date) => {
        await db.delete('sleep_logs', date);
        await syncItem('sleep_logs', { id: date }, true);
        await refreshData();
    };

    const addJournalEntry = async (entry) => {
        const newEntry = {
            ...entry,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date().toISOString()
        };
        await db.add('journal_entries', newEntry);
        await syncItem('journal_entries', newEntry);
        await addXP(15);
        await addActivityLog({ type: 'journal_added', icon: '📝', message: `Added Journal Entry "${newEntry.title || 'Untitled'}"`, xpChange: 15 });
        await refreshData();
    };

    const updateJournalEntry = async (entry) => {
        const updatedEntry = { ...entry, updatedAt: new Date().toISOString() };
        await db.put('journal_entries', updatedEntry);
        await syncItem('journal_entries', updatedEntry);
        await addActivityLog({ type: 'journal_edited', icon: '✏️', message: `Edited Journal Entry "${updatedEntry.title || 'Untitled'}"`, xpChange: 0 });
        await refreshData();
    };

    const deleteJournalEntry = async (id) => {
        await db.delete('journal_entries', id);
        await syncItem('journal_entries', { id }, true);
        await refreshData();
    };

    const addReminder = async (reminder) => {
        const newReminder = {
            ...reminder,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date().toISOString()
        };
        await db.add('reminders', newReminder);
        await syncItem('reminders', newReminder);
        await refreshData();
    };

    const deleteReminder = async (id) => {
        await db.delete('reminders', id);
        await syncItem('reminders', { id }, true);
        await refreshData();
    };

    const addCalendarEvent = async (event) => {
        const newEvent = {
            ...event,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date().toISOString()
        };
        await db.add('calendar_events', newEvent);
        await syncItem('calendar_events', newEvent);
        await refreshData();
    };

    const updateCalendarEvent = async (event) => {
        const updatedEvent = { ...event, updatedAt: new Date().toISOString() };
        await db.put('calendar_events', updatedEvent);
        await syncItem('calendar_events', updatedEvent);
        await refreshData();
    };

    const deleteCalendarEvent = async (id) => {
        await db.delete('calendar_events', id);
        await syncItem('calendar_events', { id }, true);
        await refreshData();
    };

    const toggleCalendarLayer = async (layerId) => {
        // Toggle logic ...
        let newLayers = [...calendarLayers];
        const layerIndex = newLayers.findIndex(l => l.id === layerId);

        if (layerIndex >= 0) {
            newLayers[layerIndex] = { ...newLayers[layerIndex], enabled: !newLayers[layerIndex].enabled };
        } else {
            return;
        }

        for (const layer of newLayers) {
            await db.put('calendar_layers', layer);
            // System layers might use fixed IDs. Custom layers need proper sync.
            // For now, we only sync if it has an ID.
            if (layer.id) await syncItem('calendar_layers', { ...layer, updatedAt: new Date().toISOString() });
        }
        setCalendarLayers(newLayers);
    };

    const addCalendarLayer = async (layer) => {
        // We'll treat ID as provided or UUID
        const newLayer = {
            ...layer,
            id: layer.id || crypto.randomUUID(),
            updatedAt: new Date().toISOString()
        };
        await db.add('calendar_layers', newLayer);
        await syncItem('calendar_layers', newLayer);
        await refreshData();
    };

    const addReward = async (reward) => {
        const newReward = {
            ...reward,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date().toISOString()
        };
        await db.add('rewards', newReward);
        await syncItem('rewards', newReward);
        await refreshData();
    };

    const deleteReward = async (id) => {
        await db.delete('rewards', id);
        await syncItem('rewards', { id }, true);
        await refreshData();
    };

    const redeemReward = async (reward) => {
        if (user.xp < reward.cost) return false;

        await addXP(-reward.cost);

        const historyItem = {
            id: crypto.randomUUID(),
            rewardId: reward.id,
            rewardName: reward.name,
            cost: reward.cost,
            redeemedAt: new Date(),
            icon: reward.icon,
            updatedAt: new Date().toISOString()
        };
        await db.add('reward_history', historyItem);
        await syncItem('reward_history', historyItem);
        await addActivityLog({ type: 'reward_redeemed', icon: '🎁', message: `Bought "${reward.name}"`, xpChange: -reward.cost });

        await refreshData();
        return true;
    };

    const restoreHabitHearts = async (habitId, amount = 1) => {
        const habit = habits.find(h => h.id === habitId);
        if (!habit) return false;

        const maxH = habit.maxHearts || 3;
        const currentH = habit.hearts ?? maxH;
        const newH = Math.min(currentH + amount, maxH);

        const updatedHabit = {
            ...habit,
            hearts: newH,
            updatedAt: new Date().toISOString()
        };
        await db.put('habits', updatedHabit);
        await syncItem('habits', updatedHabit);
        await addActivityLog({ type: 'heart_bought', icon: '❤️', message: `Restored heart for "${habit.title}"`, xpChange: -200 });
        await refreshData();
        return true;
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
        skipTask,
        reorderTasks,
        toggleSubtask,
        addGoal,
        updateGoal,
        deleteGoal,
        updateGoalProgress: updateGoal,
        addHabit,
        updateHabit,
        deleteHabit,
        toggleHabit,
        toggleHabitLog: toggleHabit,
        restoreHabitHearts,
        addJournalEntry,
        updateJournalEntry,
        deleteJournalEntry,
        addSleepLog,
        updateSleepLog,
        deleteSleepLog,
        addReminder,
        deleteReminder,
        addCategory,
        updateCategory,
        deleteCategory,
        refreshData,
        calendarEvents,
        calendarLayers,
        addCalendarEvent,
        updateCalendarEvent,
        deleteCalendarEvent,
        toggleCalendarLayer,
        addCalendarLayer,
        rewards,
        rewardHistory,
        activityLogs,
        addReward,
        deleteReward,
        redeemReward,
        pushAllToCloud,
        syncStatus,
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
                    id: crypto.randomUUID(),
                    taskId,
                    startTime,
                    endTime: new Date().toISOString(),
                    duration,
                    productiveDuration,
                    checkIns,
                    createdAt: new Date(),
                    updatedAt: new Date().toISOString()
                };

                await db.add('timer_logs', logEntry);
                await syncItem('timer_logs', logEntry);

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
