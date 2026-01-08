import { db } from '../lib/db';

export const initializeDefaultData = async (dataContext) => {
    try {
        console.log("Initializing Default Data (Direct DB Mode)...");
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        // --- 1. Tasks ---
        const task1 = {
            id: crypto.randomUUID(),
            title: "Sign up for Zency Flow",
            description: "Welcome to your new productivity journey!",
            status: "completed",
            priority: "High",
            xpValue: 50,
            completedAt: new Date().toISOString(),
            repeat: "once",
            category: "Personal",
            createdAt: new Date(),
            updatedAt: new Date().toISOString()
        };
        const task2 = {
            id: crypto.randomUUID(),
            title: "Drink Water",
            description: "Stay hydrated! Aim for 2 liters today.",
            status: "pending",
            priority: "Medium",
            xpValue: 10,
            repeat: "daily",
            category: "Health",
            dueDate: todayStr,
            createdAt: new Date(),
            updatedAt: new Date().toISOString()
        };
        const task3 = {
            id: crypto.randomUUID(),
            title: "Plan Tomorrow",
            description: "Spend 5 minutes planning your tasks for tomorrow.",
            status: "pending",
            priority: "Medium",
            xpValue: 20,
            repeat: "daily",
            category: "Productivity",
            dueDate: todayStr,
            createdAt: new Date(),
            updatedAt: new Date().toISOString()
        };

        await db.add('tasks', task1);
        await db.add('tasks', task2);
        await db.add('tasks', task3);

        // --- 2. Habits ---
        const habits = [
            {
                id: crypto.randomUUID(),
                name: "Drink Water",
                icon: "💧",
                color: "#3b82f6",
                goal: 1,
                frequency: "daily",
                streak: 0,
                longestStreak: 0,
                createdAt: new Date(),
                updatedAt: new Date().toISOString()
            },
            {
                id: crypto.randomUUID(),
                name: "Workout",
                icon: "💪",
                color: "#ef4444",
                goal: 1,
                frequency: "daily",
                streak: 0,
                longestStreak: 0,
                createdAt: new Date(),
                updatedAt: new Date().toISOString()
            },
            {
                id: crypto.randomUUID(),
                name: "Read a Book",
                icon: "📚",
                color: "#eab308",
                goal: 1,
                frequency: "daily",
                streak: 0,
                longestStreak: 0,
                createdAt: new Date(),
                updatedAt: new Date().toISOString()
            }
        ];
        for (const h of habits) await db.add('habits', h);

        // --- 3. Journal ---
        await db.add('journal_entries', {
            id: crypto.randomUUID(),
            title: "My First Day with Zency Flow",
            content: "I signed up for Zency Flow Today! Excited to start tracking my habits and goals.",
            mood: "excited",
            tags: ["new-beginning", "productivity"],
            date: todayStr,
            createdAt: new Date(),
            updatedAt: new Date().toISOString()
        });

        // --- 4. Goals ---
        const goals = [
            {
                id: crypto.randomUUID(),
                title: "Read 12 Books",
                target: 12,
                current: 0,
                unit: "books",
                category: "Personal Growth",
                status: "active",
                deadline: new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0],
                createdAt: new Date(),
                updatedAt: new Date().toISOString()
            },
            {
                id: crypto.randomUUID(),
                title: "Run 100km",
                target: 100,
                current: 0,
                unit: "km",
                category: "Fitness",
                status: "active",
                deadline: new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0],
                createdAt: new Date(),
                updatedAt: new Date().toISOString()
            },
            {
                id: crypto.randomUUID(),
                title: "Meditate 50 Times",
                target: 50,
                current: 0,
                unit: "sessions",
                category: "Mindfulness",
                status: "active",
                deadline: new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0],
                createdAt: new Date(),
                updatedAt: new Date().toISOString()
            },
        ];
        for (const g of goals) await db.add('goals', g);

        // --- 5. Sleep Logs (Past 3 Days) ---
        const sleepData = [7, 8, 5.5]; // 7, 8, 5.5 hours
        for (let i = 0; i < 3; i++) {
            const date = new Date(now);
            date.setDate(date.getDate() - (3 - i)); // -3, -2, -1 days ago (Chronological: oldest first)
            const dateStr = date.toISOString().split('T')[0];

            await db.put('sleep_logs', {
                id: dateStr, // ID is date
                date: dateStr,
                hours: sleepData[i], // FIXED: 'hours' matches Sleep.jsx expectation
                quality: sleepData[i] >= 8 ? 'Good' : 'Average',
                bedTime: "23:00",
                wakeTime: "07:00",
                updatedAt: new Date().toISOString()
            });
        }

        // --- 6. Rewards ---
        const rewards = [
            {
                id: crypto.randomUUID(),
                name: "Cheat Meal",
                cost: 500,
                icon: "🍕",
                description: "Enjoy a guilt-free meal.",
                createdAt: new Date(),
                updatedAt: new Date().toISOString()
            },
            {
                id: crypto.randomUUID(),
                name: "Movie Night",
                cost: 1000,
                icon: "🎬",
                description: "Rent a movie or go to the cinema.",
                createdAt: new Date(),
                updatedAt: new Date().toISOString()
            }
        ];
        for (const r of rewards) await db.add('rewards', r);

        // --- 7. Refresh App Data ---
        if (dataContext && dataContext.refreshData) {
            console.log("Refreshing Data...");
            await dataContext.refreshData();
        }

        console.log("Default Data Initialized Successfully!");
        return true;

    } catch (error) {
        console.error("Failed to initialize default data:", error);
        return false;
    }
};
