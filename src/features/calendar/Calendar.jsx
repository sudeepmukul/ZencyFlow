import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ChevronLeft, ChevronRight, CheckCircle, Moon, Book, CheckSquare } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, subMonths, isSameMonth, isSameDay, isToday } from 'date-fns';
import { cn } from '../../lib/utils';

export function Calendar() {
    const { tasks, habitLogs, sleepLogs, journalEntries } = useData();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);

    const days = eachDayOfInterval({
        start: startOfWeek(startOfMonth(currentMonth)),
        end: endOfWeek(endOfMonth(currentMonth))
    });

    const getDayData = (date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const completedTasks = tasks.filter(t => t.status === 'completed' && t.completedAt && format(new Date(t.completedAt), 'yyyy-MM-dd') === dateStr);
        const habitsDone = habitLogs.filter(l => l.date === dateStr);
        const sleep = sleepLogs.find(l => l.date === dateStr);
        const journal = journalEntries.filter(j => j.date === dateStr);

        return { completedTasks, habitsDone, sleep, journal };
    };

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Calendar</h1>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft /></Button>
                    <h2 className="text-xl font-bold text-white w-40 text-center">{format(currentMonth, 'MMMM yyyy')}</h2>
                    <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight /></Button>
                </div>
            </div>

            <Card className="p-6">
                <div className="grid grid-cols-7 mb-4 text-center text-zinc-500 font-medium text-sm">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {days.map(day => {
                        const { completedTasks, habitsDone, sleep, journal } = getDayData(day);
                        const hasActivity = completedTasks.length > 0 || habitsDone.length > 0 || sleep || journal.length > 0;

                        return (
                            <div
                                key={day.toISOString()}
                                onClick={() => setSelectedDate(day)}
                                className={cn(
                                    "min-h-[100px] p-2 rounded-lg border transition-all cursor-pointer hover:border-neon-400/50",
                                    !isSameMonth(day, currentMonth) ? "bg-zinc-950/30 border-zinc-900 text-zinc-600" : "bg-zinc-900/50 border-zinc-800 text-zinc-300",
                                    isToday(day) && "border-neon-400 bg-neon-400/5"
                                )}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={cn("text-sm font-medium", isToday(day) && "text-neon-400")}>
                                        {format(day, 'd')}
                                    </span>
                                    {sleep && (
                                        <span className={cn("text-[10px] px-1 rounded", sleep.hours >= 8 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400")}>
                                            {sleep.hours}h
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    {completedTasks.length > 0 && (
                                        <div className="flex items-center gap-1 text-[10px] text-blue-400">
                                            <CheckCircle className="w-3 h-3" /> {completedTasks.length} Tasks
                                        </div>
                                    )}
                                    {habitsDone.length > 0 && (
                                        <div className="flex items-center gap-1 text-[10px] text-purple-400">
                                            <CheckSquare className="w-3 h-3" /> {habitsDone.length} Habits
                                        </div>
                                    )}
                                    {journal.length > 0 && (
                                        <div className="flex items-center gap-1 text-[10px] text-pink-400">
                                            <Book className="w-3 h-3" /> Journal
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {selectedDate && (
                <DayDetailModal
                    date={selectedDate}
                    data={getDayData(selectedDate)}
                    onClose={() => setSelectedDate(null)}
                />
            )}
        </div>
    );
}

function DayDetailModal({ date, data, onClose }) {
    const { completedTasks, habitsDone, sleep, journal } = data;

    return (
        <Modal isOpen={!!date} onClose={onClose} title={format(date, 'EEEE, MMMM d, yyyy')}>
            <div className="space-y-6">
                {/* Sleep */}
                <div className="space-y-2">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase flex items-center gap-2">
                        <Moon className="w-4 h-4" /> Sleep
                    </h3>
                    {sleep ? (
                        <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 flex justify-between items-center">
                            <span>{sleep.hours} hours</span>
                            <span className="text-zinc-500 text-sm">{sleep.quality}</span>
                        </div>
                    ) : (
                        <div className="text-zinc-500 text-sm italic">No sleep log.</div>
                    )}
                </div>

                {/* Habits */}
                <div className="space-y-2">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase flex items-center gap-2">
                        <CheckSquare className="w-4 h-4" /> Habits Completed
                    </h3>
                    {habitsDone.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                            {habitsDone.map((h, i) => (
                                <div key={i} className="p-2 bg-zinc-900 rounded border border-zinc-800 text-sm text-zinc-300">
                                    Habit ID: {h.habitId} {/* Ideally fetch title */}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-zinc-500 text-sm italic">No habits completed.</div>
                    )}
                </div>

                {/* Tasks */}
                <div className="space-y-2">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Tasks Completed
                    </h3>
                    {completedTasks.length > 0 ? (
                        <div className="space-y-2">
                            {completedTasks.map(t => (
                                <div key={t.id} className="p-2 bg-zinc-900 rounded border border-zinc-800 text-sm text-zinc-300 flex justify-between">
                                    <span>{t.title}</span>
                                    <span className="text-neon-400 text-xs">+{t.xpValue} XP</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-zinc-500 text-sm italic">No tasks completed.</div>
                    )}
                </div>

                {/* Journal */}
                <div className="space-y-2">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase flex items-center gap-2">
                        <Book className="w-4 h-4" /> Journal
                    </h3>
                    {journal.length > 0 ? (
                        <div className="space-y-2">
                            {journal.map(j => (
                                <div key={j.id} className="p-3 bg-zinc-900 rounded border border-zinc-800">
                                    <div className="text-xs text-zinc-500 mb-1">Mood: {j.mood}</div>
                                    <p className="text-sm text-zinc-300">{j.content}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-zinc-500 text-sm italic">No journal entry.</div>
                    )}
                </div>
            </div>
        </Modal>
    );
}
