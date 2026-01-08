import React, { useState, useEffect } from 'react';
import { X, Clock, Tag, AlertCircle, Calendar, Trophy, FileText, AlignLeft, Plus, Trash2, CheckCircle2, Circle, Repeat } from 'lucide-react';
import { format, addDays, isSameDay } from 'date-fns';
import { Button } from '../../../components/ui/Button';

const PRIORITIES = ['Low', 'Medium', 'High'];
const CATEGORIES = ['Work', 'Personal', 'Urgent', 'General', 'Health', 'Social'];
const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const QuestModal = ({ isOpen, onClose, onSave, onDelete, initialData, selectedDate, availableCategories = [] }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('General');
    const [priority, setPriority] = useState('Medium');
    const [xpValue, setXpValue] = useState(25);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [notes, setNotes] = useState('');
    const [subtasks, setSubtasks] = useState([]);
    const [newSubtask, setNewSubtask] = useState('');
    const [repeatEnabled, setRepeatEnabled] = useState(false);
    const [repeatDays, setRepeatDays] = useState([]);

    // Merge defaults with passed categories
    const allCategories = Array.from(new Set([...CATEGORIES, ...availableCategories]));

    // Reset or populate form when opening
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setTitle(initialData.title || '');
                setCategory(initialData.category || 'General');
                setPriority(initialData.priority || 'Medium');
                setXpValue(initialData.xpValue || 25);
                setNotes(initialData.notes || '');
                setSubtasks(initialData.subtasks || []);
                setRepeatEnabled(initialData.repeatEnabled || false);
                setRepeatDays(initialData.repeatDays || []);

                const d = new Date(initialData.dueDate || initialData.startTime || new Date());
                if (!isNaN(d.getTime())) {
                    setDate(d.toISOString().split('T')[0]);

                    // Parse start time
                    if (initialData.dueDate && initialData.dueDate.includes('T') && !initialData.dueDate.endsWith('T00:00:00.000Z')) {
                        setStartTime(format(new Date(initialData.dueDate), 'HH:mm'));
                    } else if (initialData.startTime) {
                        setStartTime(format(new Date(initialData.startTime), 'HH:mm'));
                    } else {
                        setStartTime('');
                    }

                    // Parse end time
                    if (initialData.endTime) {
                        setEndTime(format(new Date(initialData.endTime), 'HH:mm'));
                    } else if (initialData.duration) {
                        setEndTime('');
                    } else {
                        setEndTime('');
                    }
                }
            } else {
                // New Task
                setTitle('');
                setCategory('General');
                setPriority('Medium');
                setXpValue(25);
                setNotes('');
                setSubtasks([]);
                setNewSubtask('');
                setRepeatEnabled(false);
                setRepeatDays([]);
                const d = selectedDate ? new Date(selectedDate) : new Date();
                setDate(d.toISOString().split('T')[0]);
                setStartTime('');
                setEndTime('');
            }
        }
    }, [isOpen, initialData, selectedDate]);

    // Auto-update XP based on Priority
    useEffect(() => {
        if (!initialData) {
            switch (priority) {
                case 'High': setXpValue(50); break;
                case 'Medium': setXpValue(25); break;
                case 'Low': setXpValue(10); break;
                default: setXpValue(25);
            }
        }
    }, [priority, initialData]);

    // Lock main content scroll when open
    useEffect(() => {
        const mainContent = document.getElementById('main-content');
        if (isOpen && mainContent) {
            mainContent.style.overflow = 'hidden';
        }
        return () => {
            if (mainContent) {
                mainContent.style.overflow = '';
            }
        };
    }, [isOpen]);


    if (!isOpen) return null;

    // Toggle a day in the repeat days array
    const toggleRepeatDay = (day) => {
        setRepeatDays(prev =>
            prev.includes(day)
                ? prev.filter(d => d !== day)
                : [...prev, day]
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        let finalDueDate = `${date}T00:00:00`;
        let finalEndTime = null;

        if (startTime) {
            finalDueDate = `${date}T${startTime}:00`;

            if (endTime) {
                finalEndTime = `${date}T${endTime}:00`;
                // Validation: End must be after Start
                if (finalEndTime <= finalDueDate) {
                    alert('End time must be after start time');
                    return;
                }
            } else {
                // Default to 1 hour if no end time provided
                const startD = new Date(finalDueDate);
                startD.setHours(startD.getHours() + 1);
                finalEndTime = startD.toISOString();
            }
        }

        onSave({
            id: initialData?.id,
            title,
            category,
            priority,
            xpValue: parseInt(xpValue) || 0,
            dueDate: finalDueDate,
            startTime: finalDueDate,
            endTime: finalEndTime,
            notes,
            subtasks,
            repeatEnabled,
            repeatDays: repeatEnabled ? repeatDays : []
        });
        onClose();
    };

    const setDatePreset = (offset) => {
        const d = new Date();
        d.setDate(d.getDate() + offset);
        setDate(d.toISOString().split('T')[0]);
    };

    const isDateActive = (checkDateStr) => {
        return date === checkDateStr;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const tmrwStr = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];

    // Subtask handlers
    const addSubtask = () => {
        if (!newSubtask.trim()) return;
        setSubtasks([...subtasks, {
            id: crypto.randomUUID(),
            title: newSubtask.trim(),
            completed: false
        }]);
        setNewSubtask('');
    };

    const removeSubtask = (id) => {
        setSubtasks(subtasks.filter(s => s.id !== id));
    };

    const toggleSubtask = (id) => {
        setSubtasks(subtasks.map(s =>
            s.id === id ? { ...s, completed: !s.completed } : s
        ));
    };


    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm">
            <div className="min-h-full flex items-center justify-center p-4 pb-10">
                <div className="w-full max-w-2xl bg-[#121212] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

                    {/* Header */}
                    <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                        <div>
                            <h2 className="text-xl font-bold text-[#FBFF00] uppercase tracking-wide">
                                {initialData ? 'Edit Quest' : 'Quest Title'}
                            </h2>
                            {!initialData && <p className="text-zinc-500 text-xs mt-1">Define your new mission</p>}
                        </div>
                        <button
                            onClick={onClose}
                            className="text-zinc-500 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-full"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">

                        {/* Title Input */}
                        <div>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter quest name..."
                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#FBFF00]/50 focus:ring-1 focus:ring-[#FBFF00]/20 transition-all font-medium"
                                autoFocus
                            />
                        </div>

                        {/* Repeat Toggle Section */}
                        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Repeat size={18} className={repeatEnabled ? 'text-[#FBFF00]' : 'text-zinc-500'} />
                                    <div>
                                        <p className="text-sm font-medium text-zinc-300">Repeat Weekly</p>
                                        <p className="text-xs text-zinc-600">Set days to repeat this quest</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setRepeatEnabled(!repeatEnabled)}
                                    className={`relative w-12 h-6 rounded-full transition-all duration-200 ${repeatEnabled
                                            ? 'bg-[#FBFF00]'
                                            : 'bg-zinc-700'
                                        }`}
                                >
                                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-200 ${repeatEnabled ? 'left-7' : 'left-1'
                                        }`} />
                                </button>
                            </div>

                            {/* Day Selector - only shown when repeat is enabled */}
                            {repeatEnabled && (
                                <div className="flex gap-2 flex-wrap pt-2 border-t border-zinc-800/50">
                                    {DAYS_OF_WEEK.map(day => (
                                        <button
                                            key={day}
                                            type="button"
                                            onClick={() => toggleRepeatDay(day)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all duration-150 ${repeatDays.includes(day)
                                                    ? 'bg-[#FBFF00] text-black shadow-[0_0_10px_rgba(251,255,0,0.3)]'
                                                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300'
                                                }`}
                                        >
                                            {day}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* Category */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Category</label>
                                <div className="relative">
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-300 focus:outline-none focus:border-[#FBFF00]/50 appearance-none text-sm font-medium"
                                    >
                                        {allCategories.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                    <Tag className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
                                </div>
                            </div>

                            {/* Priority */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Priority</label>
                                <div className="relative">
                                    <select
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value)}
                                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-3 py-2.5 text-zinc-300 focus:outline-none focus:border-[#FBFF00]/50 appearance-none text-sm font-medium"
                                    >
                                        {PRIORITIES.map(p => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                    <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
                                </div>
                            </div>

                            {/* XP Reward */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">XP Reward</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                        <span className="text-[#FBFF00] font-black text-xs">XP</span>
                                    </div>
                                    <input
                                        type="number"
                                        value={xpValue}
                                        onChange={(e) => setXpValue(e.target.value)}
                                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-[#FBFF00]/50 font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Date & Time Row */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Time & Duration</label>
                            <div className="flex flex-wrap gap-3">
                                {/* Date Picker */}
                                <div
                                    onClick={() => document.getElementById('date-input').showPicker()}
                                    className="flex-1 min-w-[150px] bg-zinc-900/50 border border-zinc-800 rounded-xl px-3 flex items-center gap-2 focus-within:border-[#FBFF00]/50 transition-colors cursor-pointer hover:bg-zinc-800/50"
                                >
                                    <Calendar className="w-4 h-4 text-zinc-500" />
                                    <input
                                        id="date-input"
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="bg-transparent border-none text-zinc-300 text-sm focus:ring-0 w-full p-2 cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden"
                                    />
                                </div>

                                {/* Start Time */}
                                <div
                                    onClick={() => document.getElementById('start-time-input').showPicker()}
                                    className="w-[110px] bg-zinc-900/50 border border-zinc-800 rounded-xl px-3 flex items-center gap-2 focus-within:border-[#FBFF00]/50 transition-colors cursor-pointer hover:bg-zinc-800/50"
                                >
                                    <Clock className="w-4 h-4 text-zinc-500" />
                                    <input
                                        id="start-time-input"
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="bg-transparent border-none text-zinc-300 text-sm focus:ring-0 w-full p-2 cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden"
                                        placeholder="Start"
                                    />
                                </div>

                                {/* Arrow Divider */}
                                <div className="self-center text-zinc-600">→</div>

                                {/* End Time */}
                                <div
                                    onClick={() => document.getElementById('end-time-input').showPicker()}
                                    className="w-[110px] bg-zinc-900/50 border border-zinc-800 rounded-xl px-3 flex items-center gap-2 focus-within:border-[#FBFF00]/50 transition-colors cursor-pointer hover:bg-zinc-800/50"
                                >
                                    <Clock className="w-4 h-4 text-zinc-500" />
                                    <input
                                        id="end-time-input"
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        className="bg-transparent border-none text-zinc-300 text-sm focus:ring-0 w-full p-2 cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden"
                                        placeholder="End"
                                        disabled={!startTime}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Notes (Optional)</label>
                            <div className="relative">
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Add details..."
                                    rows={2}
                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-[#FBFF00]/50 resize-none"
                                />
                            </div>
                        </div>

                        {/* Subtasks */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Subtasks (Optional)</label>

                            {/* Add Subtask Input */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newSubtask}
                                    onChange={(e) => setNewSubtask(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                                    placeholder="Add a subtask..."
                                    className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-[#FBFF00]/50"
                                />
                                <button
                                    type="button"
                                    onClick={addSubtask}
                                    disabled={!newSubtask.trim()}
                                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center gap-1.5"
                                >
                                    <Plus size={16} />
                                    <span className="text-sm font-medium">Add</span>
                                </button>
                            </div>

                            {/* Subtask List */}
                            {subtasks.length > 0 && (
                                <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                                    {subtasks.map((subtask) => (
                                        <div
                                            key={subtask.id}
                                            className="flex items-center gap-3 bg-zinc-900/30 border border-zinc-800/50 rounded-lg px-3 py-2 group"
                                        >
                                            <button
                                                type="button"
                                                onClick={() => toggleSubtask(subtask.id)}
                                                className="shrink-0 text-zinc-500 hover:text-[#FBFF00] transition-colors"
                                            >
                                                {subtask.completed ? (
                                                    <CheckCircle2 size={18} className="text-[#FBFF00]" />
                                                ) : (
                                                    <Circle size={18} />
                                                )}
                                            </button>
                                            <span className={`flex-1 text-sm ${subtask.completed ? 'text-zinc-500 line-through' : 'text-zinc-300'}`}>
                                                {subtask.title}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => removeSubtask(subtask.id)}
                                                className="shrink-0 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {subtasks.length > 0 && (
                                <p className="text-xs text-zinc-600">
                                    {subtasks.filter(s => s.completed).length}/{subtasks.length} completed
                                </p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={!title.trim()}
                                className="w-full bg-[#FBFF00] hover:bg-[#d4d800] text-black font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(251,255,0,0.2)]"
                            >
                                <PlusIcon className="w-5 h-5" />
                                {initialData ? 'Save Changes' : 'Create Quest'}
                            </button>
                            {initialData && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (window.confirm('Delete this quest?')) {
                                            onDelete(initialData.id);
                                            onClose();
                                        }
                                    }}
                                    className="w-full mt-3 py-2 text-xs font-medium text-red-500/70 hover:text-red-500 transition-colors"
                                >
                                    Delete Quest
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Simple Plus Icon Component since we are not importing lucide-react Plus directly in top level if it conflicts
function PlusIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
        </svg>
    )
}
