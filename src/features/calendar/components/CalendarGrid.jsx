import React, { useMemo } from 'react';
import { format, isSameDay, startOfDay, addMinutes, differenceInMinutes, setHours } from 'date-fns';
import { EventItem } from './EventItem';

const PIXELS_PER_MINUTE = 1.1;
const HOUR_HEIGHT = 60 * PIXELS_PER_MINUTE;

// --- COMPONENT: CalendarGrid ---
// Represents a single day column. Handles dropping events and clicking to create new ones.
export const CalendarGrid = ({ date, events, tasks, reminders, filters, categoryColors, onSlotClick, onDragStart, onDropEvent, onEventClick }) => {
    const dayStart = startOfDay(date);

    // Combine and Filter Data for this specific day
    const dayItems = useMemo(() => {
        const allItems = [];
        const safeTasks = Array.isArray(tasks) ? tasks : [];
        const safeReminders = Array.isArray(reminders) ? reminders : [];

        // 1. Process Tasks
        safeTasks.forEach(task => {
            const cat = task.category || 'General';
            // Filter Logic
            if (filters[cat] === false) return;
            if (!task.dueDate || !isSameDay(new Date(task.dueDate), date)) return;

            const startTime = new Date(task.dueDate);
            // Default to 1 hour if no endTime
            const endTime = task.endTime ? new Date(task.endTime) : addMinutes(startTime, 60);

            // Determine Color: Use centralized color map or fallback
            // This ensures the grid block matches the sidebar dot
            const color = categoryColors && categoryColors[cat] ? categoryColors[cat] : (task.categoryColor || '#8b5cf6');

            allItems.push({
                ...task,
                isTask: true,
                startTime,
                endTime,
                categoryColor: color
            });
        });

        // 2. Process Reminders
        if (filters['Reminders']) {
            safeReminders.forEach(rem => {
                if (!rem.date || !isSameDay(new Date(rem.date), date)) return;

                const startTime = new Date(rem.date);
                const endTime = addMinutes(startTime, 30); // Reminders default to 30 mins

                allItems.push({
                    ...rem,
                    isReminder: true,
                    startTime,
                    endTime,
                    title: rem.text || rem.title
                });
            });
        }

        return allItems;
    }, [tasks, reminders, events, date, filters]);

    // HTML5 Drop Handlers
    const handleDragOver = (e) => {
        e.preventDefault(); // Necessary to allow dropping
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e) => {
        e.preventDefault();
        onDropEvent(e, date);
    };

    return (
        <div
            className="relative border-r border-zinc-800/50 min-w-[120px] group bg-transparent hover:bg-zinc-900/10 transition-colors"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            {/* Background Hour Lines */}
            {Array.from({ length: 24 }).map((_, i) => (
                <div
                    key={i}
                    className="absolute w-full border-b border-zinc-800/30 group-hover:border-zinc-800/50 transition-colors pointer-events-none"
                    style={{ top: `${i * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
                />
            ))}

            {/* Click Handler Layer */}
            <div className="absolute inset-0 z-0" onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickY = e.clientY - rect.top;
                const minutes = clickY / PIXELS_PER_MINUTE;
                const snapped = addMinutes(dayStart, Math.round(minutes / 15) * 15);
                onSlotClick(snapped);
            }} />

            {/* Event Items */}
            {dayItems.map(item => {
                const top = differenceInMinutes(item.startTime, dayStart) * PIXELS_PER_MINUTE;
                const height = differenceInMinutes(item.endTime, item.startTime) * PIXELS_PER_MINUTE;
                const safeHeight = Math.max(height, 20);

                return (
                    <EventItem
                        key={item.id}
                        event={item}
                        onDragStart={onDragStart}
                        onClick={onEventClick}
                        style={{ top: `${top}px`, height: `${safeHeight}px` }}
                    />
                );
            })}
        </div>
    );
};
