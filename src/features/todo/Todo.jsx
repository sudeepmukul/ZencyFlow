import React, { useState } from 'react';
import { RemindersWidget } from '../dashboard/RemindersWidget';
import { useData } from '../../contexts/DataContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Plus, GripVertical, CheckCircle, Calendar, Trash2, Play, AlertCircle, Clock } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../../lib/utils';

// Priority Colors
const PRIORITY_COLORS = {
    High: 'text-red-400 border-red-400/20 bg-red-400/10',
    Medium: 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10',
    Low: 'text-green-400 border-green-400/20 bg-green-400/10',
};

// Sortable Item Component
function SortableTaskItem({ task, onToggle, onDelete, onMoveToNextDay, onStartTimer, activeTimer, totalDuration }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
    };

    const isActive = activeTimer?.taskId === task.id;

    const formatDuration = (seconds) => {
        if (!seconds) return null;
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    };

    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date().setHours(0, 0, 0, 0) && task.status !== 'completed';

    return (
        <div ref={setNodeRef} style={style} className={cn("mb-3", isDragging && "opacity-50")}>
            <Card className={cn(
                "p-4 flex items-center gap-4 transition-all group",
                isActive ? "bg-neon-400/5 border-neon-400/30" : "bg-zinc-900/80 hover:border-neon-400/30",
                isOverdue && "border-red-500/30 bg-red-500/5"
            )}>
                <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-zinc-600 hover:text-zinc-400">
                    <GripVertical className="w-5 h-5" />
                </div>

                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className={cn("font-medium", isActive ? "text-neon-400" : "text-white")}>
                            {task.title}
                        </h3>

                        {/* Priority Badge */}
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium", PRIORITY_COLORS[task.priority || 'Medium'])}>
                            {task.priority || 'Medium'}
                        </span>

                        {/* Due Date Badge */}
                        {task.dueDate && (
                            <span className={cn(
                                "text-[10px] px-1.5 py-0.5 rounded border flex items-center gap-1",
                                isOverdue ? "text-red-400 border-red-400/20 bg-red-400/10" : "text-zinc-400 border-zinc-700 bg-zinc-800"
                            )}>
                                <Calendar className="w-3 h-3" />
                                {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                        )}

                        {task.notes && (
                            <span className="text-xs text-zinc-500 truncate max-w-[200px]" title={task.notes}>
                                - {task.notes}
                            </span>
                        )}
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                            {task.category}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-neon-400/10 text-neon-400 border border-neon-400/20">
                            +{task.xpValue} XP
                        </span>
                        {totalDuration > 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                                <Play className="w-2 h-2" /> {formatDuration(totalDuration)}
                            </span>
                        )}
                        {isActive && (
                            <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-neon-400 text-black font-bold animate-pulse">
                                <Play className="w-3 h-3 fill-current" /> Active
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!isActive && (
                        <Button variant="ghost" size="icon" onClick={() => onStartTimer(task.id)} title="Start Timer" className="text-neon-400 hover:text-neon-300 hover:bg-neon-400/10">
                            <Play className="w-4 h-4" />
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => onMoveToNextDay(task)} title="Move to Next Day">
                        <Calendar className="w-4 h-4 text-blue-400" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(task.id)} title="Delete">
                        <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => onToggle(task.id)} className="ml-2">
                        <CheckCircle className="w-4 h-4" /> Done
                    </Button>
                </div>
            </Card>
        </div>
    );
}

export function Todo() {
    const { tasks, addTask, updateTask, toggleTask, deleteTask, categories, startTimer, activeTimer, timerLogs } = useData();
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskCategory, setNewTaskCategory] = useState('General');
    const [newTaskXP, setNewTaskXP] = useState(25);
    const [newTaskNotes, setNewTaskNotes] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState('Medium');
    const [newTaskDueDate, setNewTaskDueDate] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [sortBy, setSortBy] = useState('Priority'); // 'Priority' or 'Order'
    const [isAddingReminder, setIsAddingReminder] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const activeTasks = tasks
        .filter(t => t.status !== 'completed')
        .filter(t => filterCategory === 'All' || t.category === filterCategory)
        .sort((a, b) => {
            if (sortBy === 'Priority') {
                const priorityOrder = { High: 3, Medium: 2, Low: 1 };
                const pA = priorityOrder[a.priority || 'Medium'];
                const pB = priorityOrder[b.priority || 'Medium'];
                if (pA !== pB) return pB - pA; // Higher priority first
            }
            return (a.order || 0) - (b.order || 0);
        });

    const completedTasks = tasks
        .filter(t => t.status === 'completed')
        .filter(t => filterCategory === 'All' || t.category === filterCategory)
        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

    const getTaskDuration = (taskId) => {
        const logs = timerLogs?.filter(l => l.taskId === taskId) || [];
        const totalSeconds = logs.reduce((acc, log) => acc + (log.duration || 0), 0);

        // Add active session if it matches this task
        if (activeTimer?.taskId === taskId) {
            return totalSeconds + activeTimer.duration;
        }
        return totalSeconds;
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = activeTasks.findIndex(t => t.id === active.id);
            const newIndex = activeTasks.findIndex(t => t.id === over.id);

            const newOrder = arrayMove(activeTasks, oldIndex, newIndex);

            // Update order in DB
            newOrder.forEach((task, index) => {
                updateTask({ ...task, order: index });
            });
        }
    };

    const handlePriorityChange = (e) => {
        const priority = e.target.value;
        setNewTaskPriority(priority);

        // Auto-set XP based on priority (User can still override)
        const xpValues = {
            'High': 35,
            'Medium': 25,
            'Low': 10
        };
        setNewTaskXP(xpValues[priority] || 25);
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        let finalDueDate = null;
        if (newTaskDueDate) {
            finalDueDate = newTaskDueDate;
            const timeInput = document.getElementById('quest-time-input')?.value;
            if (timeInput) {
                finalDueDate = `${newTaskDueDate}T${timeInput}:00`;
            } else {
                // Default to T00:00:00 if strictly date, but for now standard YYYY-MM-DD logic holds
                // If we want it to show on Calendar but "All Day", current logic filters T00:00:00
                // If user picks date but no time -> T00:00 (All Day)
            }
        }

        await addTask({
            title: newTaskTitle,
            category: newTaskCategory,
            xpValue: parseInt(newTaskXP),
            notes: newTaskNotes,
            priority: newTaskPriority,
            dueDate: finalDueDate,
            order: activeTasks.length, // Append to end
        });
        setNewTaskTitle('');
        setNewTaskNotes('');
        setNewTaskXP(25);
        setNewTaskPriority('Medium');
        setNewTaskDueDate('');
        if (document.getElementById('quest-time-input')) document.getElementById('quest-time-input').value = '';
    };

    const handleMoveToNextDay = async (task) => {
        alert("Task moved to next day (Visual only in MVP)");
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-white to-zinc-500 bg-clip-text text-transparent">Quests & Reminders</h1>

                {/* Global Controls */}
                <div className="flex items-center gap-4">
                    <Select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                        className="bg-zinc-900 border-zinc-700 text-sm py-1 h-8 w-32"
                    >
                        <option value="Priority">Sort: Priority</option>
                        <option value="Order">Sort: Manual</option>
                    </Select>
                    <Select
                        value={filterCategory}
                        onChange={e => setFilterCategory(e.target.value)}
                        className="bg-zinc-900 border-zinc-700 text-sm py-1 h-8 w-32"
                    >
                        <option value="All">All Categories</option>
                        <option value="General">General</option>
                        <option value="Work">Work</option>
                        <option value="Personal">Personal</option>
                        <option value="Urgent">Urgent</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                    </Select>
                    <div className="text-sm text-zinc-400">
                        {activeTasks.length} active • {completedTasks.length} completed
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Quests (60-65% width) -> col-span-8 */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Add Quest Form */}
                    <Card className="p-4">
                        <form onSubmit={handleAddTask} className="space-y-4">
                            {/* Title Section */}
                            <div>
                                <label className="block text-[10px] font-bold text-neon-400 uppercase tracking-wider mb-1.5">Quest Title</label>
                                <Input
                                    value={newTaskTitle}
                                    onChange={e => setNewTaskTitle(e.target.value)}
                                    placeholder="Enter quest name..."
                                    className="bg-zinc-900/50 border-zinc-700/50 text-base py-2 h-10 ring-offset-0 focus:border-neon-400/50 focus:ring-1 focus:ring-neon-400/20 transition-all placeholder:text-zinc-600"
                                    autoFocus
                                />
                            </div>

                            {/* Metadata Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-[10px] font-medium text-zinc-500 mb-1">Category</label>
                                    <Select
                                        value={newTaskCategory}
                                        onChange={e => setNewTaskCategory(e.target.value)}
                                        className="bg-zinc-900/50 border-zinc-700/50 focus:border-neon-400/50 h-10 py-2 text-sm"
                                    >
                                        <option>General</option>
                                        <option>Work</option>
                                        <option>Personal</option>
                                        <option>Urgent</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </Select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-medium text-zinc-500 mb-1">Priority</label>
                                    <Select
                                        value={newTaskPriority}
                                        onChange={handlePriorityChange}
                                        className="bg-zinc-900/50 border-zinc-700/50 focus:border-neon-400/50 h-10 py-2 text-sm"
                                    >
                                        <option value="High">High</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Low">Low</option>
                                    </Select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-medium text-zinc-500 mb-1">XP Reward</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neon-400 font-bold text-[10px]">XP</div>
                                        <Input
                                            type="number"
                                            value={newTaskXP}
                                            onChange={e => setNewTaskXP(e.target.value)}
                                            className="bg-zinc-900/50 border-zinc-700/50 pl-9 h-10 py-2 text-sm focus:border-neon-400/50"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Detail Row: Due Date & Notes */}
                            <div className="flex flex-col gap-4">
                                {/* Enhanced Due Date */}
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-medium text-zinc-500">Due Date</label>
                                    <div className="flex gap-2">

                                        {/* Quick Buttons */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const d = new Date();
                                                setNewTaskDueDate(d.toISOString().split('T')[0]);
                                            }}
                                            className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-md text-[10px] font-medium text-zinc-300 transition-colors border border-zinc-700 hover:border-zinc-600"
                                        >
                                            Today
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const d = new Date();
                                                d.setDate(d.getDate() + 1);
                                                setNewTaskDueDate(d.toISOString().split('T')[0]);
                                            }}
                                            className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-md text-[10px] font-medium text-zinc-300 transition-colors border border-zinc-700 hover:border-zinc-600"
                                        >
                                            Tmrw
                                        </button>

                                        {/* Date Input */}
                                        <div className="relative flex-1">
                                            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                                            <Input
                                                type="date"
                                                value={newTaskDueDate}
                                                onChange={e => setNewTaskDueDate(e.target.value)}
                                                className="bg-zinc-900/50 border-zinc-700/50 pl-8 h-9 text-xs text-zinc-300 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                            />
                                        </div>

                                        {/* Time Input */}
                                        <div className="relative w-24">
                                            <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                                            <Input
                                                type="time"
                                                id="quest-time-input"
                                                className="bg-zinc-900/50 border-zinc-700/50 pl-8 h-9 text-xs text-zinc-300 [&::-webkit-calendar-picker-indicator]:invert"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Notes */}
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-medium text-zinc-500">Notes (Optional)</label>
                                    <Input
                                        value={newTaskNotes}
                                        onChange={e => setNewTaskNotes(e.target.value)}
                                        placeholder="Add details..."
                                        className="bg-zinc-900/50 border-zinc-700/50 h-9 text-xs focus:border-neon-400/50"
                                    />
                                </div>
                            </div>

                            {/* Submit Action */}
                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    disabled={!newTaskTitle.trim()}
                                    className="w-full h-10 text-black font-bold text-sm bg-gradient-to-r from-neon-400 to-neon-500 hover:from-neon-300 hover:to-neon-400 transition-all shadow-[0_0_15px_rgba(251,255,0,0.15)] hover:shadow-[0_0_20px_rgba(251,255,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Quest
                                </Button>
                            </div>
                        </form>
                    </Card>

                    {/* Quest List */}
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext items={activeTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-3">
                                {activeTasks.map(task => (
                                    <SortableTaskItem
                                        key={task.id}
                                        task={task}
                                        onToggle={toggleTask}
                                        onDelete={deleteTask}
                                        onMoveToNextDay={handleMoveToNextDay}
                                        onStartTimer={startTimer}
                                        activeTimer={activeTimer}
                                        totalDuration={getTaskDuration(task.id)}
                                    />
                                ))}
                                {activeTasks.length === 0 && (
                                    <div className="text-center py-10 text-zinc-500">
                                        {filterCategory === 'All' ? "No active quests. Enjoy your day!" : `No active quests in ${filterCategory}.`}
                                    </div>
                                )}
                            </div>
                        </SortableContext>
                    </DndContext>

                    {/* Completed Tasks */}
                    {completedTasks.length > 0 && (
                        <div className="pt-8 border-t border-zinc-800">
                            <h3 className="text-lg font-bold text-zinc-400 mb-4">Completed Today</h3>
                            <div className="space-y-2 opacity-60">
                                {completedTasks.map(task => (
                                    <div key={task.id} className="flex items-center justify-between p-3 bg-zinc-900/30 rounded-lg border border-zinc-800/50 group">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => toggleTask(task.id)}
                                                className="text-neon-400 hover:text-neon-300 transition-colors"
                                                title="Undo"
                                            >
                                                <CheckCircle className="w-5 h-5" />
                                            </button>
                                            <div>
                                                <span className="line-through text-zinc-500 block">{task.title}</span>
                                                {task.notes && <span className="text-xs text-zinc-600 block">{task.notes}</span>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-neon-400">+{task.xpValue} XP</span>
                                            <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Reminders (35-40% width) -> col-span-4 */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="sticky top-6">
                        <RemindersWidget isAdding={isAddingReminder} setIsAdding={setIsAddingReminder} />

                        <div className="mt-6 p-4 rounded-xl bg-neon-400/5 border border-neon-400/20">
                            <h4 className="flex items-center gap-2 text-neon-400 font-bold mb-2">
                                <AlertCircle className="w-4 h-4" /> Pro Tip
                            </h4>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                Use reminders for quick, time-sensitive to-dos that don't need XP or complexity.
                                Keep Quests for your main work.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
