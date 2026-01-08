import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Plus, Bell, Trash2, Calendar, Clock, X } from 'lucide-react';

export function RemindersWidget({ isAdding, setIsAdding }) {
    const { reminders, addReminder, deleteReminder } = useData();
    const [newText, setNewText] = useState('');
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('');

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newText.trim()) return;

        await addReminder({
            text: newText,
            date: newDate || null,
            time: newTime || null,
            completed: false
        });

        setNewText('');
        setNewDate('');
        setNewTime('');
        setIsAdding(false);
    };

    // Sort by date and time (nearest first)
    const sortedReminders = [...reminders].sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        const dateA = new Date(a.date + (a.time ? `T${a.time}` : ''));
        const dateB = new Date(b.date + (b.time ? `T${b.time}` : ''));
        return dateA - dateB;
    });

    const formatTime = (time) => {
        if (!time) return null;
        const [hours, minutes] = time.split(':').map(Number);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return null;
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } catch {
            return dateStr;
        }
    };

    return (
        <Card className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Bell className="w-5 h-5 text-neon-400" />
                    Upcoming Reminders
                </h3>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsAdding(!isAdding)}
                    className="text-neon-400 hover:text-neon-300 w-8 h-8"
                >
                    {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </Button>
            </div>

            {isAdding && (
                <form onSubmit={handleAdd} className="mb-4 space-y-3 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                    <Input
                        value={newText}
                        onChange={e => setNewText(e.target.value)}
                        placeholder="What do you need to remember?"
                        className="bg-zinc-950 border-zinc-700 text-sm w-full"
                        autoFocus
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <div
                            className="relative cursor-pointer hover:bg-zinc-800/50 rounded-lg transition-colors"
                            onClick={() => document.getElementById('reminder-date-input').showPicker?.()}
                        >
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                            <Input
                                id="reminder-date-input"
                                type="date"
                                value={newDate}
                                onChange={e => setNewDate(e.target.value)}
                                className="bg-zinc-950 border-zinc-700 text-sm pl-9 w-full cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden"
                            />
                        </div>
                        <div
                            className="relative cursor-pointer hover:bg-zinc-800/50 rounded-lg transition-colors"
                            onClick={() => document.getElementById('reminder-time-input').showPicker?.()}
                        >
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                            <Input
                                id="reminder-time-input"
                                type="time"
                                value={newTime}
                                onChange={e => setNewTime(e.target.value)}
                                className="bg-zinc-950 border-zinc-700 text-sm pl-9 w-full cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden"
                            />
                        </div>
                    </div>
                    <Button
                        type="submit"
                        disabled={!newText.trim()}
                        className="w-full bg-neon-400 hover:bg-neon-500 text-black font-bold"
                    >
                        Add Reminder
                    </Button>
                </form>
            )}

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {sortedReminders.length === 0 ? (
                    <div className="text-center text-zinc-500 py-8 text-sm">
                        No upcoming reminders.
                    </div>
                ) : (
                    sortedReminders.map(reminder => (
                        <div
                            key={reminder.id}
                            className="group flex items-center justify-between p-3 bg-zinc-900/30 rounded-lg border border-zinc-800/50 hover:border-neon-400/30 transition-colors"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-zinc-200 font-medium truncate">{reminder.text}</p>
                                {(reminder.date || reminder.time) && (
                                    <div className="text-xs text-zinc-500 mt-1 flex items-center gap-3">
                                        {reminder.date && (
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3 text-neon-400" />
                                                {formatDate(reminder.date)}
                                            </span>
                                        )}
                                        {reminder.time && (
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3 text-neon-400" />
                                                {formatTime(reminder.time)}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => deleteReminder(reminder.id)}
                                className="ml-2 opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all p-1"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
}
