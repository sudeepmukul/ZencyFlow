import React, { useState, useEffect, useMemo } from 'react';
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay, startOfDay, addMinutes, differenceInMinutes, setHours } from 'date-fns';
import { useData } from '../../../contexts/DataContext';
import { CalendarSidebar } from './CalendarSidebar';
import { CalendarGrid } from './CalendarGrid';

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
        addCalendarEvent
    } = useData();

    // State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [draggedEvent, setDraggedEvent] = useState(null);
    const [categoryFilters, setCategoryFilters] = useState({
        'Work': true,
        'Personal': true,
        'Urgent': true,
        'General': true,
        'Reminders': true,
    });

    // Derived
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    // Dynamic Category & Color Calculation
    const { availableCategories, categoryColors } = useMemo(() => {
        const safeTasks = tasks || [];
        const cats = new Set(['Work', 'Personal', 'Urgent', 'General']);
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
                // If this custom category doesn't have a color yet, try to find one from the task
                if (!colors[t.category]) {
                    if (t.categoryColor) {
                        colors[t.category] = t.categoryColor;
                    } else {
                        // Deterministic color generation for unknown categories
                        // Simple hash to HSL
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

    // Ensure filters exist for all categories (auto-enable new ones)
    useEffect(() => {
        setCategoryFilters(prev => {
            const next = { ...prev };
            let changed = false;
            availableCategories.forEach(cat => {
                if (next[cat] === undefined) {
                    next[cat] = true; // Default to existing behavior
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

    const handleSlotClick = async (clickedDate) => {
        const title = prompt("New Quest Title:");
        if (title) {
            await addTask({
                title,
                dueDate: clickedDate.toISOString(),
                priority: 'Medium',
                category: 'General'
            });
        }
    };

    const handleDragStart = (e, event) => {
        setDraggedEvent(event);
        e.dataTransfer.effectAllowed = 'move';
        // Make ghost image slightly transparent or use default
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
        // Safety check for invalid dates
        let duration = 60;
        if (!isNaN(originalStart) && !isNaN(originalEnd)) {
            duration = differenceInMinutes(originalEnd, originalStart);
        }

        const newEndTime = addMinutes(newStartTime, duration);

        if (draggedEvent.isTask) {
            // CRITICAL FIX: Merge with original task to prevent data loss (title, category, etc.)
            const originalTask = tasks.find(t => t.id === draggedEvent.id);
            if (originalTask) {
                await updateTask({
                    ...originalTask, // Merge existing data
                    dueDate: newStartTime.toISOString(),
                    endTime: newEndTime.toISOString()
                });
            }
        } else if (draggedEvent.isReminder) {
            // Reminders might be read-only or single-point in some systems, 
            // but if we want to move them:
            // Note: Reminders in DataContext might not have 'updateReminder' exposed broadly 
            // or might just have 'date' field.
            // Let's assume we can't easily move reminders yet unless we add updateReminder to DataContext
            // But for now, let's just log or ignore if no update method.
            // Actually, the user snippet didn't show updateReminder either.
        } else {
            const originalEvent = calendarEvents.find(e => e.id === draggedEvent.id);
            if (originalEvent) {
                await updateCalendarEvent({
                    ...originalEvent,
                    startTime: newStartTime.toISOString(),
                    endTime: newEndTime.toISOString()
                });
            }
        }

        setDraggedEvent(null);
    };

    return (
        <div className="flex h-[calc(100vh-100px)] overflow-hidden bg-zinc-950 border border-zinc-900 rounded-xl shadow-2xl text-zinc-300 font-sans">

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
                                events={calendarEvents}
                                tasks={tasks}
                                reminders={reminders}
                                filters={categoryFilters}
                                categoryColors={categoryColors}
                                onSlotClick={handleSlotClick}
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

