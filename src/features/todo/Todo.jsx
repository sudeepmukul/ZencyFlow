import React, { useState } from 'react';
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
    const [newTaskXP, setNewTaskXP] = useState(20);
    const [newTaskNotes, setNewTaskNotes] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState('Medium');
    const [newTaskDueDate, setNewTaskDueDate] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [sortBy, setSortBy] = useState('Priority'); // 'Priority' or 'Order'

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

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        await addTask({
            title: newTaskTitle,
            category: newTaskCategory,
            xpValue: parseInt(newTaskXP),
            notes: newTaskNotes,
            priority: newTaskPriority,
            dueDate: newTaskDueDate || null,
            order: activeTasks.length, // Append to end
        });
        setNewTaskTitle('');
        setNewTaskNotes('');
        setNewTaskXP(20);
        setNewTaskPriority('Medium');
        setNewTaskDueDate('');
    };

    const handleMoveToNextDay = async (task) => {
        alert("Task moved to next day (Visual only in MVP)");
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Tasks</h1>
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

            {/* Add Task Form */}
            <Card className="p-4">
                <form onSubmit={handleAddTask} className="space-y-4">
                    <div className="flex gap-4 items-end flex-wrap">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs font-medium text-zinc-500 mb-1">Task Title</label>
                            <Input
                                value={newTaskTitle}
                                onChange={e => setNewTaskTitle(e.target.value)}
                                placeholder="What needs to be done?"
                                className="bg-zinc-950 border-zinc-800"
                            />
                        </div>
                        <div className="w-32">
                            <label className="block text-xs font-medium text-zinc-500 mb-1">Category</label>
                            <Select
                                value={newTaskCategory}
                                onChange={e => setNewTaskCategory(e.target.value)}
                                className="bg-zinc-950 border-zinc-800"
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
                        <div className="w-28">
                            <label className="block text-xs font-medium text-zinc-500 mb-1">Priority</label>
                            <Select
                                value={newTaskPriority}
                                onChange={e => setNewTaskPriority(e.target.value)}
                                className="bg-zinc-950 border-zinc-800"
                            >
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </Select>
                        </div>
                        <div className="w-36">
                            <label className="block text-xs font-medium text-zinc-500 mb-1">Due Date</label>
                            <Input
                                type="date"
                                value={newTaskDueDate}
                                onChange={e => setNewTaskDueDate(e.target.value)}
                                className="bg-zinc-950 border-zinc-800 text-sm"
                            />
                        </div>
                        <div className="w-20">
                            <label className="block text-xs font-medium text-zinc-500 mb-1">XP</label>
                            <Input
                                type="number"
                                value={newTaskXP}
                                onChange={e => setNewTaskXP(e.target.value)}
                                className="bg-zinc-950 border-zinc-800"
                            />
                        </div>
                        <Button type="submit" disabled={!newTaskTitle.trim()}>
                            <Plus className="w-4 h-4" /> Add
                        </Button>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-zinc-500 mb-1">Notes (Optional)</label>
                        <Input
                            value={newTaskNotes}
                            onChange={e => setNewTaskNotes(e.target.value)}
                            placeholder="Add details, links, or sub-tasks..."
                            className="bg-zinc-950 border-zinc-800 text-sm"
                        />
                    </div>
                </form>
            </Card>

            {/* Task List */}
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
                                {filterCategory === 'All' ? "No active tasks. Enjoy your day!" : `No active tasks in ${filterCategory}.`}
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
    );
}
