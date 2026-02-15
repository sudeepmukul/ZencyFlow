import React, { useState, useEffect, useMemo, useRef } from 'react';
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay, startOfDay, addMinutes, differenceInMinutes, setHours } from 'date-fns';
import { Pencil, Trash2, ArrowRight, CheckCircle } from 'lucide-react';
import { useData } from '../../../contexts/DataContext';
import { CalendarSidebar } from './CalendarSidebar';
import { CalendarGrid } from './CalendarGrid';
import { QuestModal } from './QuestModal';

// --- CONSTANTS ---
const PIXELS_PER_MINUTE = 1.1;
const HOUR_HEIGHT = 60 * PIXELS_PER_MINUTE;

// --- COMPONENT: MasterCalendar ---
// The main layout and logic.
export function MasterCalendar() {
    const {
        tasks,
        reminders,
        calendarEvents,
        updateTask,
        addTask,
        updateCalendarEvent,
        deleteTask,
        categories
    } = useData();

    // State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [draggedEvent, setDraggedEvent] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [modalState, setModalState] = useState({ isOpen: false, data: null, selectedDate: null });
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, event: null });
    const contextMenuRef = useRef(null);

    const [categoryFilters, setCategoryFilters] = useState({
        'Work': true,
        'Personal': true,
        'Urgent': true,
        'General': true,
        'Reminders': true,
    });

    // Close context menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
                setContextMenu({ visible: false, x: 0, y: 0, event: null });
            }
        };
        if (contextMenu.visible) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [contextMenu.visible]);

    // Timer for Current Time Indicator
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update minutely
        return () => clearInterval(timer);
    }, []);

    // Derived
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    // ... (Dynamic Category & Color Calculation logic - keep as is) ...
    const { availableCategories, categoryColors } = useMemo(() => {
        const safeTasks = tasks || [];
        const cats = new Set(['Work', 'Personal', 'Urgent', 'General']);

        // Add custom categories from Settings
        if (categories) {
            categories.forEach(c => cats.add(c.name));
        }

        const colors = {
            'Work': '#3b82f6',    // Blue
            'Personal': '#10b981',// Emerald
            'Urgent': '#ef4444',  // Red
            'General': '#8b5cf6', // Purple
            'Reminders': '#fbff00'// Yellow
        };

        safeTasks.forEach(t => {
            if (t.category) {
                cats.add(t.category);
                if (!colors[t.category]) {
                    if (t.categoryColor) {
                        colors[t.category] = t.categoryColor;
                    } else {
                        const str = t.category;
                        let hash = 0;
                        for (let i = 0; i < str.length; i++) {
                            hash = str.charCodeAt(i) + ((hash << 5) - hash);
                        }
                        const hue = Math.abs(hash % 360);
                        colors[t.category] = `hsl(${hue}, 70%, 50%)`;
                    }
                }
            }
        });

        return {
            availableCategories: Array.from(cats),
            categoryColors: colors
        };
    }, [tasks]);

    // Ensure filters exist for all categories
    useEffect(() => {
        setCategoryFilters(prev => {
            const next = { ...prev };
            let changed = false;
            availableCategories.forEach(cat => {
                if (next[cat] === undefined) {
                    next[cat] = true;
                    changed = true;
                }
            });
            return changed ? next : prev;
        });
    }, [availableCategories]);

    // Handlers
    const toggleFilter = (cat) => {
        setCategoryFilters(prev => ({
            ...prev,
            [cat]: !prev[cat]
        }));
    };

    const handleSlotClick = (clickedDate) => {
        setModalState({
            isOpen: true,
            data: null,
            selectedDate: clickedDate.toISOString() // Pass full ISO with time
        });
    };

    const handleEventClick = (event) => {
        // Single click does nothing - use double-click for context menu
        // This prevents accidental edits when clicking to select
    };

    const handleSaveQuest = async (questData) => {
        if (questData.id) {
            await updateTask(questData);
        } else {
            // Remove id if undefined to ensure clean creation
            const { id, ...newQuest } = questData;
            await addTask(newQuest);
        }
        setModalState({ isOpen: false, data: null, selectedDate: null });
    };

    const handleDeleteQuest = async (id) => {
        await deleteTask(id);
        setModalState({ isOpen: false, data: null, selectedDate: null });
    };

    // Context Menu Handlers
    const handleEventDoubleClick = (event, e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!event.isTask) return; // Only for tasks

        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            event: event
        });
    };

    const handleContextEdit = () => {
        if (contextMenu.event) {
            setModalState({
                isOpen: true,
                data: contextMenu.event,
                selectedDate: null
            });
        }
        setContextMenu({ visible: false, x: 0, y: 0, event: null });
    };

    const handleContextDelete = async () => {
        if (contextMenu.event && contextMenu.event.id) {
            const eventData = contextMenu.event;
            const originalTask = tasks.find(t => t.id === eventData.id);

            if (originalTask) {
                // Check if this is a repeat instance
                if (eventData.isRepeatInstance) {
                    // For repeat instances: Add this date to exclusions list
                    // This removes only this occurrence, not the entire recurring task
                    const instanceDate = new Date(eventData.startTime);
                    const dateKey = format(instanceDate, 'yyyy-MM-dd');

                    const existingExclusions = originalTask.repeatExclusions || [];
                    if (!existingExclusions.includes(dateKey)) {
                        await updateTask({
                            ...originalTask,
                            repeatExclusions: [...existingExclusions, dateKey]
                        });
                    }
                } else {
                    // For original task: Delete the entire task
                    await deleteTask(originalTask.id);
                }
            }
        }
        setContextMenu({ visible: false, x: 0, y: 0, event: null });
    };

    const handleContextNextDay = async () => {
        if (contextMenu.event && contextMenu.event.id) {
            const eventData = contextMenu.event;
            const originalTask = tasks.find(t => t.id === eventData.id);

            if (originalTask) {
                // Check if this is a repeat instance (not the original occurrence)
                if (eventData.isRepeatInstance) {
                    // For repeat instances: Create a NEW independent task for the next day
                    // This doesn't affect the original recurring task
                    const instanceDate = new Date(eventData.startTime);
                    const nextDate = addDays(instanceDate, 1);

                    const duration = eventData.endTime
                        ? differenceInMinutes(new Date(eventData.endTime), new Date(eventData.startTime))
                        : 60;

                    const newTaskEndTime = addMinutes(nextDate, duration);

                    // Create new independent task (no repeat)
                    const { id, repeatEnabled, repeatDays, isRepeatInstance, ...taskWithoutId } = originalTask;
                    await addTask({
                        ...taskWithoutId,
                        dueDate: nextDate.toISOString(),
                        startTime: nextDate.toISOString(),
                        endTime: newTaskEndTime.toISOString(),
                        repeatEnabled: false,
                        repeatDays: [],
                        notes: originalTask.notes ? `${originalTask.notes}\n(Moved from repeat)` : '(Moved from repeat)'
                    });
                } else {
                    // For original task: Move the actual task to next day
                    const currentDate = new Date(originalTask.dueDate || originalTask.startTime);
                    const nextDate = addDays(currentDate, 1);

                    const newDueDate = nextDate.toISOString();
                    let newEndTime = null;

                    if (originalTask.endTime) {
                        const currentEnd = new Date(originalTask.endTime);
                        const newEnd = addDays(currentEnd, 1);
                        newEndTime = newEnd.toISOString();
                    }

                    await updateTask({
                        ...originalTask,
                        dueDate: newDueDate,
                        startTime: newDueDate,
                        endTime: newEndTime
                    });
                }
            }
        }
        setContextMenu({ visible: false, x: 0, y: 0, event: null });
    };

    const handleContextMarkDone = async () => {
        if (contextMenu.event && contextMenu.event.id) {
            const eventData = contextMenu.event;
            const originalTask = tasks.find(t => t.id === eventData.id);

            if (originalTask) {
                // Toggle the completion status
                const newStatus = originalTask.status === 'completed' ? 'pending' : 'completed';
                await updateTask({
                    ...originalTask,
                    status: newStatus,
                    completedAt: newStatus === 'completed' ? new Date().toISOString() : null
                });
            }
        }
        setContextMenu({ visible: false, x: 0, y: 0, event: null });
    };

    const handleDragStart = (e, event) => {
        setDraggedEvent(event);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setDragImage(e.target, 0, 0);
    };

    const handleDropEvent = async (e, targetDate) => {
        if (!draggedEvent) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const offsetY = e.clientY - rect.top;

        // Convert Y position to time
        const minutesFromStart = offsetY / PIXELS_PER_MINUTE;
        const snappedMinutes = Math.round(minutesFromStart / 15) * 15;

        const newStartTime = addMinutes(startOfDay(targetDate), snappedMinutes);

        // Calculate duration to preserve it
        const originalStart = new Date(draggedEvent.startTime);
        const originalEnd = new Date(draggedEvent.endTime);
        let duration = 60;
        if (!isNaN(originalStart) && !isNaN(originalEnd)) {
            duration = differenceInMinutes(originalEnd, originalStart);
        }

        const newEndTime = addMinutes(newStartTime, duration);

        if (draggedEvent.isTask) {
            const originalTask = tasks.find(t => t.id === draggedEvent.id);
            if (originalTask) {
                // Check if this is a repeat instance
                if (draggedEvent.isRepeatInstance) {
                    // For repeat instances: Create a NEW independent task
                    const { id, repeatEnabled, repeatDays, isRepeatInstance, ...taskWithoutId } = originalTask;
                    await addTask({
                        ...taskWithoutId,
                        dueDate: newStartTime.toISOString(),
                        startTime: newStartTime.toISOString(),
                        endTime: newEndTime.toISOString(),
                        repeatEnabled: false,
                        repeatDays: [],
                        notes: originalTask.notes ? `${originalTask.notes}\n(Moved from repeat)` : '(Moved from repeat)'
                    });
                } else {
                    // For original task: Update the actual task
                    await updateTask({
                        ...originalTask,
                        dueDate: newStartTime.toISOString(),
                        startTime: newStartTime.toISOString(),
                        endTime: newEndTime.toISOString()
                    });
                }
            }
        }
        // ... (Reminder/CalendarEvent drag logic)
        setDraggedEvent(null);
    };

    return (
        <div className="flex h-[calc(100vh-100px)] overflow-hidden bg-zinc-950 border border-zinc-900 rounded-xl shadow-2xl text-zinc-300 font-sans">

            <QuestModal
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ ...modalState, isOpen: false })}
                onSave={handleSaveQuest}
                onDelete={handleDeleteQuest}
                initialData={modalState.data}
                selectedDate={modalState.selectedDate}
                availableCategories={availableCategories}
            />

            {/* Sidebar */}
            <CalendarSidebar
                currentMonth={currentDate}
                onPrevMonth={() => setCurrentDate(subWeeks(currentDate, 1))}
                onNextMonth={() => setCurrentDate(addWeeks(currentDate, 1))}
                filters={categoryFilters}
                onToggleFilter={toggleFilter}
                availableCategories={availableCategories}
                categoryColors={categoryColors}
            />

            {/* Main Calendar Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">

                {/* Header: Days */}
                <div className="flex border-b border-zinc-800 bg-zinc-900/50 pr-[16px]">
                    {/* Time Column Spacer */}
                    <div className="w-16 flex-shrink-0 border-r border-zinc-800 bg-zinc-900/30" />

                    {/* Day Columns Header */}
                    <div className="flex-1 grid grid-cols-7">
                        {weekDays.map(day => (
                            <div key={day.toString()} className={`py-3 text-center border-r border-zinc-800/30 ${isSameDay(day, new Date()) ? 'bg-zinc-900/80' : ''}`}>
                                <div className={`text-xs uppercase font-bold mb-1 ${isSameDay(day, new Date()) ? 'text-neon-400 text-blue-400' : 'text-zinc-500'}`}>
                                    {format(day, 'EEE')}
                                </div>
                                <div className={`text-2xl font-light ${isSameDay(day, new Date()) ? 'text-white' : 'text-zinc-400'}`}>
                                    {format(day, 'd')}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Scrollable Grid Container */}
                <div className="flex-1 overflow-y-auto flex relative custom-scrollbar">

                    {/* Time Axis (Left Only) */}
                    <div className="w-16 flex-shrink-0 border-r border-zinc-800 bg-zinc-900/20 text-xs font-mono text-zinc-500 select-none pt-2 relative z-20">
                        {Array.from({ length: 24 }).map((_, i) => (
                            <div
                                key={i}
                                className="relative box-border"
                                style={{ height: `${HOUR_HEIGHT}px` }}
                            >
                                <span className="absolute -top-3 right-2">
                                    {format(setHours(startOfDay(new Date()), i), 'h a')}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Events Grid */}
                    <div className="flex-1 grid grid-cols-7" style={{ height: `${24 * HOUR_HEIGHT}px` }}>
                        {weekDays.map(day => (
                            <CalendarGrid
                                key={day.toISOString()}
                                date={day}
                                currentTime={currentTime}
                                events={calendarEvents}
                                tasks={tasks}
                                reminders={reminders}
                                filters={categoryFilters}
                                categoryColors={categoryColors}
                                onSlotClick={handleSlotClick}
                                onEventClick={handleEventClick}
                                onEventDoubleClick={handleEventDoubleClick}
                                onDragStart={handleDragStart}
                                onDropEvent={handleDropEvent}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Context Menu Tooltip */}
            {contextMenu.visible && (
                <div
                    ref={contextMenuRef}
                    className="fixed z-50 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl py-2 min-w-[160px] animate-in fade-in zoom-in-95 duration-150"
                    style={{
                        top: `${contextMenu.y}px`,
                        left: `${contextMenu.x > window.innerWidth - 180 ? contextMenu.x - 170 : contextMenu.x}px`,
                        transform: 'translate(0, 8px)'
                    }}
                >
                    <button
                        onClick={handleContextEdit}
                        className="w-full px-4 py-2.5 text-left text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center gap-3 transition-colors"
                    >
                        <Pencil size={16} className="text-blue-400" />
                        Edit Quest
                    </button>
                    <button
                        onClick={handleContextNextDay}
                        className="w-full px-4 py-2.5 text-left text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center gap-3 transition-colors"
                    >
                        <ArrowRight size={16} className="text-green-400" />
                        Move to Next Day
                    </button>
                    <button
                        onClick={handleContextMarkDone}
                        className="w-full px-4 py-2.5 text-left text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white flex items-center gap-3 transition-colors"
                    >
                        <CheckCircle size={16} className={contextMenu.event?.status === 'completed' ? 'text-yellow-400' : 'text-emerald-400'} />
                        {contextMenu.event?.status === 'completed' ? 'Mark as Pending' : 'Mark as Done'}
                    </button>
                    <div className="my-1 border-t border-zinc-800" />
                    <button
                        onClick={handleContextDelete}
                        className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-3 transition-colors"
                    >
                        <Trash2 size={16} />
                        Delete Quest
                    </button>
                </div>
            )}
        </div>
    );
}

