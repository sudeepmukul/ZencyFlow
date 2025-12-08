import React from 'react';

// --- COMPONENT: EventItem ---
// The visual block for an event or reminder. 
// Uses native HTML5 drag events to avoid external dependency issues.
export const EventItem = ({ event, style, onDragStart }) => {
    const isReminder = event.type === 'reminder' || event.isReminder;

    // Requirement: Reminders = #fbff00 (Yellow), Quests = Category Color
    const bgColor = isReminder
        ? '#fbff00'
        : (event.categoryColor || event.color || '#3b82f6');

    // Requirement: Reminders text is dark for contrast, others white
    const textColor = isReminder ? 'text-black font-bold' : 'text-white';
    const borderColor = isReminder ? 'border-yellow-600' : 'border-zinc-700';

    return (
        <div
            draggable={true}
            onDragStart={(e) => onDragStart(e, event)}
            className={`absolute w-[95%] left-[2.5%] rounded-md px-2 py-1 text-xs cursor-grab active:cursor-grabbing transition-all hover:brightness-110 overflow-hidden border z-10 shadow-sm ${textColor} ${borderColor}`}
            style={{
                ...style,
                backgroundColor: bgColor,
            }}
        >
            <div className="font-medium truncate leading-tight pointer-events-none">
                {event.title}
            </div>

            {!isReminder && event.priority === 'High' && (
                <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            )}
        </div>
    );
};
