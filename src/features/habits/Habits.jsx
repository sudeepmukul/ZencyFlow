import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useUser } from '../../contexts/UserContext';
import { Plus, Zap, ShoppingBag, Calendar } from 'lucide-react';
import { HabitCard } from './components/HabitCard';
import { HabitHeatMap } from './components/HabitHeatMap';
import { AddHabitModal } from './components/AddHabitModal';
import { MonthViewModal } from './components/MonthViewModal';
import { SEOHead } from '../../components/seo/SEOHead';

export function Habits() {
    const { habits, addHabit, updateHabit, deleteHabit, toggleHabit, habitLogs } = useData();
    const { user, spendXP, addInventoryItem } = useUser();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState(null);
    const [monthViewHabit, setMonthViewHabit] = useState(null);

    // Helper to get YYYY-MM-DD in local time
    const getLocalDateString = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Transform raw habit data into the format required by the UI
    const processedHabits = useMemo(() => {
        const today = new Date();
        // Calculate the start of the current week (Monday)
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        const monday = new Date(today);
        monday.setDate(diff);
        monday.setHours(0, 0, 0, 0);

        return habits.map(habit => {
            const thisHabitLogs = habitLogs.filter(l => l.habitId === habit.id);
            const loggedDates = new Set(thisHabitLogs.map(l => l.date)); // strings "YYYY-MM-DD"

            // 1. Calculate Week Status (Mon-Sun)
            const weekStatus = Array(7).fill(false).map((_, i) => {
                const d = new Date(monday);
                d.setDate(monday.getDate() + i);
                const dateStr = getLocalDateString(d);
                return loggedDates.has(dateStr);
            });

            // 2. Calculate History (Last 364 days for heatmap)
            const history = [];
            const endDate = new Date(); // Today
            // Go back 364 days
            for (let i = 363; i >= 0; i--) {
                const d = new Date(endDate);
                d.setDate(d.getDate() - i);
                const dateStr = getLocalDateString(d);
                history.push(loggedDates.has(dateStr));
            }

            return {
                ...habit,
                weekStatus,
                history,
                // Ensure legacy habits have an icon
                icon: habit.icon || '📝',
                best: habit.longestStreak || habit.best || 0,
            };
        });
    }, [habits, habitLogs]);

    const handleToggle = async (habitId, dayIndex) => {
        // Calculate the date based on the current week's Monday + dayIndex
        const today = new Date();
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(today);
        monday.setDate(diff);

        const targetDate = new Date(monday);
        targetDate.setDate(monday.getDate() + dayIndex);
        const dateStr = getLocalDateString(targetDate);

        // Only allow toggling if not in the future (optional rule, but good for validity)
        // For now, adhere to UI freedom or backend constraints.
        // The DataContext toggleHabit handles logic.
        await toggleHabit(habitId, dateStr);
    };

    const handleSaveHabit = async (habitData) => {
        try {
            if (habitData.id) {
                // Update
                await updateHabit(habitData);
            } else {
                // Create - Remove 'id' so DB auto-generates it
                const { id, ...newHabit } = habitData;
                await addHabit({
                    ...newHabit,
                    frequency: 'daily',
                });
            }
        } catch (error) {
            console.error("Failed to save habit:", error);
            alert("Failed to save habit. Please try again.");
        }
    };

    const handleBuyFreeze = () => {
        if (spendXP(50)) {
            addInventoryItem('streak_freeze');
            alert("❄️ Streak Freeze acquired!");
        } else {
            alert("Not enough XP! You need 50 XP.");
        }
    };

    const openNewHabitModal = () => {
        setEditingHabit(null);
        setIsModalOpen(true);
    };

    // Handler for toggling habit from month view (receives date string directly)
    const handleMonthViewToggle = async (habitId, dateStr) => {
        await toggleHabit(habitId, dateStr);
    };

    return (
        <>
            <SEOHead
                title="Habits"
                description="Build lasting habits with streak tracking, weekly progress, and visual heatmaps."
                path="/habits"
            />
            <div className="min-h-screen bg-transparent p-6 font-sans text-gray-100 selection:bg-[#FBFF00] selection:text-black md:p-12 pb-24">

                <AddHabitModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onAdd={handleSaveHabit}
                    initialData={editingHabit}
                />

                <MonthViewModal
                    isOpen={!!monthViewHabit}
                    onClose={() => setMonthViewHabit(null)}
                    habit={monthViewHabit}
                    habitLogs={habitLogs}
                    onToggle={handleMonthViewToggle}
                />

                <div className="mx-auto max-w-4xl space-y-8">
                    <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-white to-zinc-500 bg-clip-text text-transparent tracking-tight">
                                Habit Tracker
                                <span className="ml-2 inline-block h-2 w-2 rounded-full bg-[#FBFF00] align-baseline shadow-[0_0_10px_#FBFF00]"></span>
                            </h1>
                            <p className="mt-2 text-gray-400">
                                XP: <span className="font-bold text-[#FBFF00]">{user.xp || 0}</span>
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleBuyFreeze}
                                className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-gray-300 transition-all hover:border-[#FBFF00]/50 hover:bg-[#FBFF00]/10 hover:text-[#FBFF00]"
                            >
                                <div className="flex flex-col items-start leading-none">
                                    <span className="text-[10px] uppercase text-gray-500 group-hover:text-[#FBFF00]/70">Cost: 50XP</span>
                                    <span className="flex items-center gap-1">
                                        <Zap size={14} className="fill-[#FBFF00] text-[#FBFF00]" />
                                        {user.inventory?.streak_freeze || 0} Freezes
                                    </span>
                                </div>
                                <ShoppingBag size={16} className="ml-2 opacity-50 group-hover:opacity-100" />
                            </button>

                            <button
                                onClick={openNewHabitModal}
                                className="group flex items-center gap-2 rounded-full bg-[#FBFF00] px-6 py-2.5 text-sm font-bold text-black shadow-[0_0_20px_rgba(251,255,0,0.3)] transition-all hover:bg-[#e1e600] hover:shadow-[0_0_30px_rgba(251,255,0,0.5)] hover:scale-105 active:scale-95"
                            >
                                <Plus size={18} strokeWidth={3} />
                                New Habit
                            </button>
                        </div>
                    </header>

                    {/* Global Contribution Heatmap */}
                    <HabitHeatMap habits={processedHabits} />

                    <section className="space-y-6">
                        <div className="flex items-center gap-2 text-lg font-bold text-white">
                            <Calendar size={20} className="text-[#FBFF00]" />
                            <h2>Active Habits</h2>
                        </div>

                        <div className="space-y-6">
                            {processedHabits.map(habit => (
                                <HabitCard
                                    key={habit.id}
                                    habit={habit}
                                    onToggle={handleToggle}
                                    onDelete={() => deleteHabit(habit.id)}
                                    onEdit={() => {
                                        setEditingHabit(habit);
                                        setIsModalOpen(true);
                                    }}
                                    onDoubleClick={() => setMonthViewHabit(habit)}
                                />
                            ))}
                            {processedHabits.length === 0 && (
                                <div className="text-center py-12 text-zinc-500 bg-zinc-900/30 rounded-3xl border border-zinc-800 border-dashed">
                                    <p>No habits yet. Start building your legacy!</p>
                                </div>
                            )}
                        </div>
                    </section>

                </div>
            </div>
        </>
    );
}
