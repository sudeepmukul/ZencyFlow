import React, { useState } from 'react';
import { RemindersWidget } from '../dashboard/RemindersWidget';
import { useData } from '../../contexts/DataContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Plus, GripVertical, CheckCircle, Calendar, Trash2, Play, AlertCircle, Clock, RotateCw, Edit2, ChevronLeft, ChevronRight, Trophy, CheckCircle2, Circle } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../../lib/utils';
import { QuestModal } from '../calendar/components/QuestModal';
import { format, addDays, isSameDay } from 'date-fns';
import { SEOHead } from '../../components/seo/SEOHead';

// Priority Colors
const PRIORITY_COLORS = {
    High: 'text-red-400 border-red-400/20 bg-red-400/10',
    Medium: 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10',
    Low: 'text-green-400 border-green-400/20 bg-green-400/10',
};

// Sortable Item Component
function SortableTaskItem({ task, onToggle, onDelete, onEdit, onMoveToNextDay, onStartTimer, activeTimer, totalDuration, onToggleSubtask }) {
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
                "p-0 transition-all group overflow-hidden", // Removed p-4 flex ...
                isActive ? "bg-neon-400/5 border-neon-400/30" : "bg-zinc-900/80 hover:border-neon-400/30",
                isOverdue && "border-red-500/30 bg-red-500/5"
            )}>
                {/* Main Task Row */}
                <div className="p-4 flex items-center gap-4">
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
                                    {task.dueDate.includes('T') && !task.dueDate.endsWith('00:00:00') && (
                                        <span className="ml-1 opacity-75">
                                            {format(new Date(task.dueDate), 'HH:mm')}
                                        </span>
                                    )}
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
                            {task.repeat === 'daily' && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1" title="Daily Quest">
                                    <RotateCw className="w-2.5 h-2.5" /> Daily
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
                        <Button variant="ghost" size="icon" onClick={() => onEdit(task)} title="Edit Task">
                            <Edit2 className="w-4 h-4 text-zinc-400 hover:text-white" />
                        </Button>
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
                </div>

                {/* Subtasks List */}
                {task.subtasks && task.subtasks.length > 0 && (
                    <div className="bg-black/20 border-t border-white/5 p-2 space-y-1">
                        {task.subtasks.map((subtask, idx) => (
                            <div
                                key={subtask.id}
                                className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors group/sub"
                            >
                                {/* Visual hierarchy line */}
                                <div className="text-zinc-600">
                                    <span className="text-xs">↳</span>
                                </div>

                                <button
                                    onClick={() => onToggleSubtask(task.id, subtask.id)}
                                    className="shrink-0 text-zinc-500 hover:text-[#FBFF00] transition-colors"
                                >
                                    {subtask.completed ? (
                                        <CheckCircle2 size={16} className="text-[#FBFF00]" />
                                    ) : (
                                        <Circle size={16} />
                                    )}
                                </button>
                                <span className={cn("text-xs flex-1", subtask.completed ? "text-zinc-500 line-through" : "text-zinc-300")}>
                                    {subtask.title}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}

export function Todo() {
    const { tasks, addTask, updateTask, toggleTask, toggleSubtask, deleteTask, categories, startTimer, activeTimer, timerLogs } = useData();
    const [filterCategory, setFilterCategory] = useState('All');
    const [sortBy, setSortBy] = useState('Priority'); // 'Priority' or 'Order'
    const [isAddingReminder, setIsAddingReminder] = useState(false);

    // Feature States
    const [isQuestModalOpen, setIsQuestModalOpen] = useState(false);
    const [viewDate, setViewDate] = useState(new Date());
    const [editingTask, setEditingTask] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // --- Navigation Logic ---
    const handleDateNav = (direction) => {
        const newDate = new Date(viewDate);
        newDate.setDate(viewDate.getDate() + direction);
        setViewDate(newDate);
    };

    const getNavLabel = () => {
        if (isSameDay(viewDate, new Date())) return 'Today';
        if (isSameDay(viewDate, addDays(new Date(), 1))) return 'Tomorrow';
        if (isSameDay(viewDate, addDays(new Date(), -1))) return 'Yesterday';
        return format(viewDate, 'MMM d, yyyy');
    };

    // Day names for repeat matching
    const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const activeTasks = tasks
        .filter(t => t.status !== 'completed')
        .filter(t => filterCategory === 'All' || t.category === filterCategory)
        .filter(t => {
            // Date Filtering Logic
            if (!t.dueDate) return isSameDay(viewDate, new Date()); // No date -> Today

            const taskDate = new Date(t.dueDate);

            // Check if original due date matches
            if (isSameDay(taskDate, viewDate)) return true;

            // Check if this is a repeat day (and not excluded)
            const viewDayName = DAY_NAMES[viewDate.getDay()];
            const viewDateKey = format(viewDate, 'yyyy-MM-dd');
            const isExcluded = t.repeatExclusions &&
                Array.isArray(t.repeatExclusions) &&
                t.repeatExclusions.includes(viewDateKey);

            if (t.repeatEnabled && Array.isArray(t.repeatDays) && t.repeatDays.includes(viewDayName) && !isExcluded) {
                return true;
            }

            // If viewing today, show overdue
            if (isSameDay(viewDate, new Date()) && taskDate < new Date().setHours(0, 0, 0, 0)) return true;

            return false;
        })
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
        // Completed tasks: Show based on COMPLETED date, not due date?
        // Usually simple todo lists show history in "Completed" section.
        // Let's filter by completion date matching view date for cleaner daily view
        .filter(t => {
            if (!t.completedAt) return false;
            return isSameDay(new Date(t.completedAt), viewDate);
        })
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

    const handleMoveToNextDay = async (task) => {
        const currentDue = task.dueDate ? new Date(task.dueDate) : new Date();
        const nextDay = new Date(currentDue);
        nextDay.setDate(nextDay.getDate() + 1);
        await updateTask({ ...task, dueDate: nextDay.toISOString() });
    };

    const handleSaveTask = async (taskData) => {
        if (editingTask) {
            await updateTask(taskData);
        } else {
            await addTask(taskData);
        }
        setIsQuestModalOpen(false);
        setEditingTask(null);
    };

    const handleEditTask = (task) => {
        setEditingTask(task);
        setIsQuestModalOpen(true);
    };

    const openNewQuestModal = () => {
        setEditingTask(null);
        setIsQuestModalOpen(true);
    }


    return (
        <>
            <SEOHead
                title="Quests & Reminders"
                description="Manage your daily quests and reminders. Prioritize tasks and earn XP for completing them."
                path="/todo"
            />
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
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Quests (60-65% width) -> col-span-8 */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* Navigation & Add Bar */}
                        <Card className="p-4 bg-zinc-900/80 border-zinc-800 flex justify-between items-center sticky top-20 z-30 backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-white" onClick={() => handleDateNav(-1)}>
                                    <ChevronLeft className="w-5 h-5" />
                                </Button>
                                <span className="text-lg font-bold text-white uppercase tracking-wider min-w-[120px] text-center">{getNavLabel()}</span>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-white" onClick={() => handleDateNav(1)}>
                                    <ChevronRight className="w-5 h-5" />
                                </Button>
                            </div>

                            <Button
                                className="bg-[#FBFF00] hover:bg-[#e1e600] text-black font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(251,255,0,0.2)]"
                                onClick={openNewQuestModal}
                            >
                                <Plus className="w-4 h-4" />
                                Add Quest
                            </Button>
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
                                            onEdit={handleEditTask}
                                            onMoveToNextDay={handleMoveToNextDay}
                                            onStartTimer={startTimer}
                                            activeTimer={activeTimer}
                                            totalDuration={getTaskDuration(task.id)}
                                            onToggleSubtask={toggleSubtask}
                                        />
                                    ))}
                                    {activeTasks.length === 0 && (
                                        <div className="text-center py-20 flex flex-col items-center gap-4 text-zinc-500">
                                            <Trophy className="w-12 h-12 opacity-50" />
                                            <p>No active quests for {getNavLabel()}.</p>
                                            <Button variant="outline" onClick={openNewQuestModal}>Create One</Button>
                                        </div>
                                    )}
                                </div>
                            </SortableContext>
                        </DndContext>

                        {/* Completed Tasks */}
                        {completedTasks.length > 0 && (
                            <div className="pt-8 border-t border-zinc-800">
                                <h3 className="text-lg font-bold text-zinc-400 mb-4">Completed on {getNavLabel()}</h3>
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

                {/* Quest Modal for Add/Edit */}
                <QuestModal
                    isOpen={isQuestModalOpen}
                    onClose={() => {
                        setIsQuestModalOpen(false);
                        setEditingTask(null);
                    }}
                    onSave={handleSaveTask}
                    onDelete={deleteTask}
                    initialData={editingTask}
                    selectedDate={viewDate.toISOString()}
                    availableCategories={categories?.map(c => c.name) || []}
                />
            </div>
        </>
    );
}
