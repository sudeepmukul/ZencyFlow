import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/db';
import { useXP } from '../hooks/useXP';
import confetti from 'canvas-confetti';
import { useToast } from './ToastContext';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState({
        xp: 0,
        level: 0,
        name: 'Zen Master',
        settings: {}
    });
    const { calculateLevel, calculateNextLevelXP, calculateProgress } = useXP();
    const { addToast } = useToast();

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const loadUser = async () => {
            try {
                // Safety timeout: If DB takes too long (>2s), force load default
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("DB Timeout")), 2000));
                const dbPromise = db.get('user', 'profile');

                const userData = await Promise.race([dbPromise, timeoutPromise]);

                if (mounted) {
                    if (userData) {
                        setUser(userData);
                    } else {
                        // Initial user setup
                        const initialUser = {
                            id: 'profile',
                            xp: 0,
                            level: 0,
                            name: 'Zen Master',
                            settings: { theme: 'neon' }
                        };
                        await db.put('user', initialUser);
                        setUser(initialUser);
                    }
                }
            } catch (error) {
                console.error("Failed to load user (using fallback):", error);
                if (mounted) {
                    setUser({
                        id: 'profile',
                        xp: 0,
                        level: 0,
                        name: 'Zen Master (Offline)',
                        settings: { theme: 'neon' }
                    });
                }
            } finally {
                if (mounted) setIsLoading(false);
            }
        };
        loadUser();
        return () => { mounted = false; };
    }, []);

    const updateProfile = async (updates) => {
        const updatedUser = { ...user, ...updates };
        await db.put('user', updatedUser);
        setUser(updatedUser);
    };

    const addXP = async (amount) => {
        const newXP = user.xp + amount;
        const newLevel = calculateLevel(newXP);

        const updatedUser = {
            ...user,
            xp: newXP,
            level: newLevel
        };

        await db.put('user', updatedUser);
        setUser(updatedUser);

        if (newLevel > user.level) {
            addToast("Level Up! ⚡", `You reached Level ${newLevel}!`, "achievement");

            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#a855f7', '#ec4899', '#eab308', '#22c55e']
            });

            return { leveledUp: true, newLevel };
        }
    };

    const spendXP = (amount) => {
        if (user.xp >= amount) {
            updateProfile({ xp: user.xp - amount });
            return true;
        }
        return false;
    };

    const addInventoryItem = (item, amount = 1) => {
        const currentInventory = user.inventory || {};
        const currentAmount = currentInventory[item] || 0;
        updateProfile({
            inventory: {
                ...currentInventory,
                [item]: currentAmount + amount
            }
        });
    };

    const useInventoryItem = (item) => {
        const currentInventory = user.inventory || {};
        if (currentInventory[item] > 0) {
            updateProfile({
                inventory: {
                    ...currentInventory,
                    [item]: currentInventory[item] - 1
                }
            });
            return true;
        }
        return false;
    };

    // Helper to queue unlock
    const unlockBadge = async (badgeId) => {
        // This exists for manual calling if needed, but primary logic is now in checkAchievements
        const currentBadges = user.badges || [];
        if (!currentBadges.includes(badgeId)) {
            const newBadges = [...currentBadges, badgeId];
            await updateProfile({ badges: newBadges });

            const labels = {
                'planner': 'Planner',
                'weekend_warrior': 'Weekend Warrior',
                'clean_slate': 'Clean Slate',
                'prioritizer': 'Prioritizer',
                'early_bird': 'Early Bird',
                'night_owl': 'Night Owl',
                'eat_the_frog': 'Eat the Frog',
                'first_task': 'First Steps',
                'veteran': 'Veteran',
                'elite': 'Elite',
                'grandmaster': 'Grandmaster',
                'legend': 'Legend',
                'level_5': 'Level 5',
                'streak_7': 'On Fire',
                'survivor': 'Survivor'
            };
            addToast("Achievement Unlocked! 🏆", `You earned the '${labels[badgeId] || 'New'}' badge!`, "achievement");
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 },
                colors: ['#FFD700', '#FFA500', '#FF4500']
            });
            return true;
        }
        return false;
    };

    const value = {
        user,
        addXP,
        updateProfile,
        levelProgress: calculateProgress(user.xp, user.level),
        nextLevelXP: calculateNextLevelXP(user.level),
        isLoading,
        spendXP,
        addInventoryItem,
        useInventoryItem,
        unlockBadge,
        checkAchievements: async (tasks, habits) => {
            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];
            const completedTasks = tasks.filter(t => t.status === 'completed');
            const completedCount = completedTasks.length;

            // Atomic unlock queue
            const badgesToUnlock = [];
            const currentBadges = new Set(user.badges || []);

            // Helper to queue unlock
            const queueUnlock = (id) => {
                if (!currentBadges.has(id)) {
                    badgesToUnlock.push(id);
                    currentBadges.add(id); // Prevent duplicate adds in same loop
                }
            };

            // --- EXISTING & MILESTONES ---

            // 1. First Steps (1 task)
            if (completedCount >= 1) queueUnlock('first_task');

            // 2. Veteran (25 tasks)
            if (completedCount >= 25) queueUnlock('veteran');

            // 3. Elite (50 tasks)
            if (completedCount >= 50) queueUnlock('elite');

            // 4. Grandmaster (100 tasks)
            if (completedCount >= 100) queueUnlock('grandmaster');

            // 5. Legend (150 tasks)
            if (completedCount >= 150) queueUnlock('legend');

            // 6. Level 5
            if (user.level >= 5) queueUnlock('level_5');

            // 7. Streak 7
            if (habits.some(h => h.streak >= 7)) queueUnlock('streak_7');


            // --- BEHAVIORAL ---

            // 8. Planner: Schedule a task for a future date
            const hasFutureTask = tasks.some(t => {
                if (!t.dueDate) return false;
                const taskDate = t.dueDate.split('T')[0];
                return taskDate > todayStr;
            });
            if (hasFutureTask) queueUnlock('planner');

            // 9. Prioritizer: Use a "High Priority" flag
            const hasHighPriority = tasks.some(t => t.priority === 'High');
            if (hasHighPriority) queueUnlock('prioritizer');

            // 10. Clean Slate: Clear daily to-do list
            const completedToday = completedTasks.filter(t => t.completedAt?.startsWith(todayStr));
            const activeDueToday = tasks.filter(t =>
                t.status !== 'completed' &&
                t.dueDate &&
                t.dueDate <= todayStr
            );

            // If I have completed tasks today, and NO active tasks due today -> Clean Slate.
            if ((activeDueToday.length + completedToday.length) > 0 && activeDueToday.length === 0) {
                queueUnlock('clean_slate');
            }


            // --- TIME BASED ---

            completedTasks.forEach(t => {
                if (!t.completedAt) return;
                const completedDate = new Date(t.completedAt);
                const localHour = completedDate.getHours();

                // 11. Early Bird: Before 7:00 AM
                if (localHour < 7) queueUnlock('early_bird');

                // 12. Night Owl: After 10:00 PM (22:00)
                if (localHour >= 22) queueUnlock('night_owl');
            });

            // 13. Weekend Warrior: Complete 10 tasks on Sat/Sun
            const weekendTaskCount = completedTasks.filter(t => {
                if (!t.completedAt) return false;
                const d = new Date(t.completedAt).getDay();
                return d === 0 || d === 6; // 0=Sun, 6=Sat
            }).length;

            if (weekendTaskCount >= 10) queueUnlock('weekend_warrior');


            // 14. Eat the Frog: Hardest task first thing in the morning.
            if (completedToday.length > 0) {
                const todaySorted = [...completedToday].sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));
                const firstTask = todaySorted[0];
                if (firstTask.priority === 'High') {
                    queueUnlock('eat_the_frog');
                }
            }

            // --- COMMIT CHANGES ---
            if (badgesToUnlock.length > 0) {
                // 1. Update State/DB ONCE
                const newBadges = [...(user.badges || []), ...badgesToUnlock];
                await updateProfile({ badges: newBadges });

                // 2. Notifications
                const labels = {
                    'planner': 'Planner',
                    'weekend_warrior': 'Weekend Warrior',
                    'clean_slate': 'Clean Slate',
                    'prioritizer': 'Prioritizer',
                    'early_bird': 'Early Bird',
                    'night_owl': 'Night Owl',
                    'eat_the_frog': 'Eat the Frog',
                    'first_task': 'First Steps',
                    'veteran': 'Veteran',
                    'elite': 'Elite',
                    'grandmaster': 'Grandmaster',
                    'legend': 'Legend',
                    'level_5': 'Level 5',
                    'streak_7': 'On Fire',
                    'survivor': 'Survivor'
                };

                // Show separate toasts for each new discovery
                badgesToUnlock.forEach(id => {
                    addToast("Achievement Unlocked! 🏆", `You earned the '${labels[id] || 'New'}' badge!`, "achievement");
                });

                // Single Confetti Blast
                confetti({
                    particleCount: 150,
                    spread: 100,
                    origin: { y: 0.6 },
                    colors: ['#FFD700', '#FFA500', '#FF4500']
                });
            }
        }
    };

    return (
        <UserContext.Provider value={value}>
            {!isLoading && children}
            {isLoading && <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-neon-400">Loading ZencyFlow...</div>}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
