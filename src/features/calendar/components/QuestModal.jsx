import React, { useState, useEffect } from 'react';
import { X, Clock, Tag, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const PRIORITIES = ['Low', 'Medium', 'High'];
const CATEGORIES = ['Work', 'Personal', 'Urgent', 'General', 'Health', 'Social'];

export const QuestModal = ({ isOpen, onClose, onSave, onDelete, initialData, selectedDate }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('General');
    const [priority, setPriority] = useState('Medium');
    const [time, setTime] = useState('12:00');

    // Reset or populate form when opening
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setTitle(initialData.title || '');
                setCategory(initialData.category || 'General');
                setPriority(initialData.priority || 'Medium');
                // Extract time from initialData.dueDate or startTime
                const d = new Date(initialData.dueDate || initialData.startTime);
                if (!isNaN(d)) {
                    setTime(format(d, 'HH:mm'));
                }
            } else if (selectedDate) {
                setTitle('');
                setCategory('General');
                setPriority('Medium');
                setTime(format(selectedDate, 'HH:mm'));
            }
        }
    }, [isOpen, initialData, selectedDate]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            id: initialData?.id, // undefined if new
            title,
            category,
            priority,
            time, // Parent will combine with date
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-zinc-500 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-bold text-white mb-6">
                    {initialData ? 'Edit Quest' : 'New Quest'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="What needs to be done?"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FBFF00] transition-colors"
                            autoFocus
                        />
                    </div>

                    {/* Time */}
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                            <Clock size={12} /> Time
                        </label>
                        <input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FBFF00] transition-colors"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Category */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                                <Tag size={12} /> Category
                            </label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FBFF00] transition-colors appearance-none"
                            >
                                {CATEGORIES.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        {/* Priority */}
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                                <AlertCircle size={12} /> Priority
                            </label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FBFF00] transition-colors appearance-none"
                            >
                                {PRIORITIES.map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        {initialData && (
                            <button
                                type="button"
                                onClick={() => {
                                    if (window.confirm('Delete this quest?')) {
                                        onDelete(initialData.id);
                                        onClose();
                                    }
                                }}
                                className="px-4 py-2 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors font-medium text-sm"
                            >
                                Delete
                            </button>
                        )}
                        <button
                            type="submit"
                            className="flex-1 bg-[#FBFF00] hover:bg-[#e1e600] text-black font-bold py-2 rounded-lg transition-all active:scale-[0.98]"
                        >
                            {initialData ? 'Save Changes' : 'Create Quest'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
