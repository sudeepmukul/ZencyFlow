import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/db';
import { useXP } from '../hooks/useXP';
import confetti from 'canvas-confetti';
import { NotificationManager } from '../lib/notifications';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState({
        xp: 0,
        level: 0,
        name: 'Zen Master',
        settings: {}
    });
    const { calculateLevel, calculateNextLevelXP, calculateProgress } = useXP();

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
                // Fallback user so app doesn't crash/hang
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
            // Trigger level up event or notification (can be handled by UI)
            console.log('Level Up!');

            // Fire confetti!
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#a855f7', '#ec4899', '#eab308', '#22c55e'] // Purple, Pink, Yellow, Green
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

    const unlockBadge = async (badgeId) => {
        const currentBadges = user.badges || [];
        if (!currentBadges.includes(badgeId)) {
            const newBadges = [...currentBadges, badgeId];
            await updateProfile({ badges: newBadges });

            // Notify user
            NotificationManager.send("Badge Unlocked! 🏆", {
                body: `You unlocked a new badge! Check your profile.`,
                icon: '/vite.svg'
            });

            // Fire confetti
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 },
                colors: ['#FFD700', '#FFA500', '#FF4500'] // Gold colors
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
            const completedTasks = tasks.filter(t => t.status === 'completed').length;

            // 1. First Steps
            if (completedTasks >= 1) await unlockBadge('first_task');

            // 2. Task Master (50 tasks)
            if (completedTasks >= 50) await unlockBadge('task_master');

            // 3. Level 5
            if (user.level >= 5) await unlockBadge('level_5');

            // 4. Streak 7 (Any habit with streak >= 7)
            const hasLongStreak = habits.some(h => h.streak >= 7);
            if (hasLongStreak) await unlockBadge('streak_7');
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
