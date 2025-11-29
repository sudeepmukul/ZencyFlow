import React from 'react';
import { useData } from '../../contexts/DataContext';
import { Card } from '../../components/ui/Card';
import { cn } from '../../lib/utils';
import { Check } from 'lucide-react';
import { startOfWeek, addDays, format, isSameDay } from 'date-fns';

export function HabitGrid({ habit, logs }) {
    const { toggleHabit } = useData();
    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 1 }); // Monday start
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(start, i));

    const isCompleted = (date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return logs.some(log => log.habitId === habit.id && log.date === dateStr);
    };

    const handleToggle = async (date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        await toggleHabit(habit.id, dateStr);
    };

    return (
        <Card className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-white truncate">{habit.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                        {habit.category}
                    </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                        <span className="text-neon-400 font-bold">{habit.streak}</span> streak
                    </span>
                    <span>•</span>
                    <span>Best: {habit.longestStreak}</span>
                </div>
            </div>

            <div className="flex gap-2">
                {weekDays.map((day, i) => {
                    const completed = isCompleted(day);
                    const isToday = isSameDay(day, today);
                    const isFuture = day > today;

                    return (
                        <div key={i} className="flex flex-col items-center gap-1">
                            <span className="text-[10px] text-zinc-500 uppercase">{format(day, 'EEE')}</span>
                            <button
                                disabled={isFuture}
                                onClick={() => handleToggle(day)}
                                className={cn(
                                    "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 border",
                                    completed
                                        ? "bg-neon-400 border-neon-400 text-black shadow-[0_0_10px_rgba(251,255,0,0.3)] hover:bg-neon-500 hover:border-neon-500"
                                        : isToday
                                            ? "bg-zinc-800 border-zinc-600 hover:border-neon-400/50"
                                            : "bg-zinc-900 border-zinc-800 hover:border-zinc-700",
                                    isFuture && "opacity-30 cursor-not-allowed hover:border-zinc-800"
                                )}
                            >
                                {completed && <Check className="w-5 h-5" />}
                            </button>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}
