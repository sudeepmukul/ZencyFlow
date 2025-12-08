import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Plus, Bell, Trash2, Calendar } from 'lucide-react';

export function RemindersWidget({ isAdding, setIsAdding }) {
    const { reminders, addReminder, deleteReminder } = useData();
    const [newText, setNewText] = useState('');
    const [newDate, setNewDate] = useState('');

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newText.trim()) return;

        await addReminder({
            text: newText,
            date: newDate || null,
            completed: false
        });

        setNewText('');
        setNewDate('');
        setIsAdding(false);
    };

    // Sort by date (nearest first)
    const sortedReminders = [...reminders].sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(a.date) - new Date(b.date);
    });

    return (
        <Card className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Bell className="w-5 h-5 text-neon-400" />
                    Upcoming Reminders
                </h3>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAdding(!isAdding)}
                    className="text-neon-400 hover:text-neon-300"
                >
                    <Plus className="w-4 h-4" />
                </Button>
            </div>

            {isAdding && (
                <form onSubmit={handleAdd} className="mb-4 space-y-2 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
                    <Input
                        value={newText}
                        onChange={e => setNewText(e.target.value)}
                        placeholder="Reminder details..."
                        className="bg-zinc-950 border-zinc-800 text-sm"
                        autoFocus
                    />
                    <div className="flex gap-2">
                        <Input
                            type="date"
                            value={newDate}
                            onChange={e => setNewDate(e.target.value)}
                            className="bg-zinc-950 border-zinc-800 text-sm"
                        />
                        <Button type="submit" size="sm" disabled={!newText.trim()}>Add</Button>
                    </div>
                </form>
            )}

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {sortedReminders.length === 0 ? (
                    <div className="text-center text-zinc-500 py-8 text-sm">
                        No upcoming reminders.
                    </div>
                ) : (
                    sortedReminders.map(reminder => (
                        <div key={reminder.id} className="group flex items-start justify-between p-3 bg-zinc-900/30 rounded-lg border border-zinc-800/50 hover:border-zinc-700 transition-colors">
                            <div>
                                {reminder.date && (
                                    <div className="text-[10px] text-neon-400 mb-1 flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        Deadline : {new Date(reminder.date).toLocaleDateString()}
                                    </div>
                                )}
                                <p className="text-sm text-zinc-300 line-clamp-2">{reminder.text}</p>
                            </div>
                            <button
                                onClick={() => deleteReminder(reminder.id)}
                                className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-all"
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
