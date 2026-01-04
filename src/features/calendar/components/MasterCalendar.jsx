import React, { useState, useEffect, useMemo } from 'react';
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay, startOfDay, addMinutes, differenceInMinutes, setHours } from 'date-fns';
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

    const [categoryFilters, setCategoryFilters] = useState({
        'Work': true,
        'Personal': true,
        'Urgent': true,
        'General': true,
        'Reminders': true,
    });

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
        if (event.isTask) {
            setModalState({
                isOpen: true,
                data: event,
                selectedDate: null
            });
        }
        // Future: Handle Reminder/CalendarEvent editing
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
                await updateTask({
                    ...originalTask,
                    dueDate: newStartTime.toISOString(), // Keep legacy field sync
                    startTime: newStartTime.toISOString(),
                    endTime: newEndTime.toISOString()
                });
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
                                onDragStart={handleDragStart}
                                onDropEvent={handleDropEvent}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

