import React, { useMemo } from 'react';
import { format, isSameDay, startOfDay, addMinutes, differenceInMinutes, setHours } from 'date-fns';
import { EventItem } from './EventItem';

const PIXELS_PER_MINUTE = 1.1;
const HOUR_HEIGHT = 60 * PIXELS_PER_MINUTE;

// --- COMPONENT: CalendarGrid ---
// Represents a single day column. Handles dropping events and clicking to create new ones.
export const CalendarGrid = ({ date, currentTime, events, tasks, reminders, filters, categoryColors, onSlotClick, onDragStart, onDropEvent, onEventClick }) => {
    const dayStart = startOfDay(date);
    const isToday = currentTime && isSameDay(date, currentTime);
    const currentMinutes = isToday ? differenceInMinutes(currentTime, dayStart) : 0;
    const currentTop = currentMinutes * PIXELS_PER_MINUTE;

    // Combine and Filter Data for this specific day
    const dayItems = useMemo(() => {
        const allItems = [];
        const safeTasks = Array.isArray(tasks) ? tasks : [];
        const safeReminders = Array.isArray(reminders) ? reminders : [];
        const safeEvents = Array.isArray(events) ? events : [];

        // 1. Process Tasks
        safeTasks.forEach(task => {
            const cat = task.category || 'General';
            // Filter Logic
            if (filters[cat] === false) return;
            if (!task.dueDate) return;

            // Parse dueDate safely - handle both ISO datetime and date-only formats
            let taskDate;
            try {
                taskDate = new Date(task.dueDate);
                if (isNaN(taskDate.getTime())) return;
            } catch (e) { return; }

            // Check if this task belongs to this day
            if (!isSameDay(taskDate, date)) return;

            // Determine start time
            // If dueDate is date-only (2026-01-04) without time, default to 9 AM for visibility
            const isDayOnly = typeof task.dueDate === 'string' && task.dueDate.length <= 10;
            let startTime = taskDate;
            if (isDayOnly || (taskDate.getHours() === 0 && taskDate.getMinutes() === 0)) {
                // Default to 9 AM for all-day or date-only tasks
                startTime = setHours(startOfDay(date), 9);
            }

            // Default to 1 hour if no endTime
            const endTime = task.endTime ? new Date(task.endTime) : addMinutes(startTime, 60);

            // Determine Color: Use centralized color map or fallback
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
        if (filters['Reminders'] !== false) {
            safeReminders.forEach(rem => {
                if (!rem.date) return;
                let remDate;
                try {
                    remDate = new Date(rem.date);
                    if (isNaN(remDate.getTime())) return;
                } catch (e) { return; }

                if (!isSameDay(remDate, date)) return;

                const startTime = remDate;
                const endTime = addMinutes(startTime, 30);

                allItems.push({
                    ...rem,
                    isReminder: true,
                    startTime,
                    endTime,
                    title: rem.text || rem.title,
                    categoryColor: '#fbff00'
                });
            });
        }

        // 3. Process Calendar Events
        safeEvents.forEach(event => {
            if (!event.startTime) return;
            let eventDate;
            try {
                eventDate = new Date(event.startTime);
                if (isNaN(eventDate.getTime())) return;
            } catch (e) { return; }

            if (!isSameDay(eventDate, date)) return;

            const cat = event.category || 'General';
            if (filters[cat] === false) return;

            const startTime = eventDate;
            const endTime = event.endTime ? new Date(event.endTime) : addMinutes(startTime, 60);
            const color = categoryColors && categoryColors[cat] ? categoryColors[cat] : (event.color || '#8b5cf6');

            allItems.push({
                ...event,
                isCalendarEvent: true,
                startTime,
                endTime,
                categoryColor: color
            });
        });

        return allItems;
    }, [tasks, reminders, events, date, filters, categoryColors]);

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
            className="relative border-r border-zinc-800/50 group bg-transparent hover:bg-zinc-900/10 transition-colors"
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

            {/* Current Time Indicator */}
            {isToday && (
                <div
                    className="absolute w-full border-t-2 border-red-500 z-20 pointer-events-none flex items-center"
                    style={{ top: `${currentTop}px` }}
                >
                    <div className="w-2 h-2 bg-red-500 rounded-full -ml-1" />
                </div>
            )}

            {/* Click Handler Layer */}
            <div className="absolute inset-0 z-0" onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickY = e.clientY - rect.top;
                const minutes = clickY / PIXELS_PER_MINUTE;
                const snapped = addMinutes(dayStart, Math.round(minutes / 15) * 15);
                onSlotClick(snapped);
            }} />

            {/* Event Items - with overlap stacking */}
            {(() => {
                // Calculate overlapping groups and positions
                const positionedItems = [];
                const sortedItems = [...dayItems].sort((a, b) => a.startTime - b.startTime);

                // For each item, find overlapping items and assign columns
                sortedItems.forEach((item, idx) => {
                    const itemStart = item.startTime.getTime();
                    const itemEnd = item.endTime.getTime();

                    // Find all items that overlap with this one
                    const overlapping = sortedItems.filter(other => {
                        const otherStart = other.startTime.getTime();
                        const otherEnd = other.endTime.getTime();
                        // Two events overlap if one starts before the other ends
                        return itemStart < otherEnd && itemEnd > otherStart;
                    });

                    // Find the index of this item within overlapping group (for column assignment)
                    const sortedOverlapping = overlapping.sort((a, b) => {
                        // Sort by start time, then by id for consistent ordering
                        const timeDiff = a.startTime - b.startTime;
                        if (timeDiff !== 0) return timeDiff;
                        return String(a.id).localeCompare(String(b.id));
                    });

                    const columnIndex = sortedOverlapping.findIndex(o => o.id === item.id);
                    const totalColumns = overlapping.length;

                    positionedItems.push({
                        ...item,
                        columnIndex,
                        totalColumns
                    });
                });

                return positionedItems.map(item => {
                    const top = differenceInMinutes(item.startTime, dayStart) * PIXELS_PER_MINUTE;
                    const height = differenceInMinutes(item.endTime, item.startTime) * PIXELS_PER_MINUTE;
                    const safeHeight = Math.max(height, 20);

                    // Calculate width and left position for stacking
                    const widthPercent = 100 / item.totalColumns;
                    const leftPercent = item.columnIndex * widthPercent;

                    return (
                        <EventItem
                            key={item.id}
                            event={item}
                            onDragStart={onDragStart}
                            onClick={onEventClick}
                            style={{
                                top: `${top}px`,
                                height: `${safeHeight}px`,
                                width: `${widthPercent}%`,
                                left: `${leftPercent}%`
                            }}
                        />
                    );
                });
            })()}
        </div>
    );
};
