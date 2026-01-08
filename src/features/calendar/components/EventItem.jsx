import React from 'react';
import { format } from 'date-fns';

// --- COMPONENT: EventItem ---
// The visual block for an event or reminder. 
// Uses native HTML5 drag events to avoid external dependency issues.
export const EventItem = ({ event, style, onDragStart, onClick, onDoubleClick }) => {
    const isReminder = event.type === 'reminder' || event.isReminder;
    const isCompleted = event.status === 'completed';

    // Requirement: Reminders = #fbff00 (Yellow), Quests = Category Color
    const bgColor = isReminder
        ? '#fbff00'
        : (event.categoryColor || event.color || '#3b82f6');

    // Requirement: Reminders text is dark for contrast, others white
    const textColor = isReminder ? 'text-black font-bold' : 'text-white';
    const borderColor = isReminder ? 'border-yellow-600' : 'border-zinc-700';

    const handleClick = (e) => {
        e.stopPropagation();
        onClick?.(event);
    };

    const handleDoubleClick = (e) => {
        e.stopPropagation();
        onDoubleClick?.(event, e);
    };

    // Build tooltip text
    const buildTooltip = () => {
        const lines = [event.title];

        if (event.startTime && event.endTime) {
            try {
                const start = format(new Date(event.startTime), 'h:mm a');
                const end = format(new Date(event.endTime), 'h:mm a');
                lines.push(`⏰ ${start} - ${end}`);
            } catch { }
        }

        if (event.category) {
            lines.push(`📁 ${event.category}`);
        }

        if (event.priority) {
            const priorityEmoji = event.priority === 'High' ? '🔴' : event.priority === 'Medium' ? '🟡' : '🟢';
            lines.push(`${priorityEmoji} ${event.priority} Priority`);
        }

        if (event.xpValue) {
            lines.push(`✨ +${event.xpValue} XP`);
        }

        if (event.notes) {
            lines.push(`📝 ${event.notes.substring(0, 50)}${event.notes.length > 50 ? '...' : ''}`);
        }

        if (isCompleted) {
            lines.push('✅ Completed');
        }

        if (event.isRepeatInstance) {
            lines.push('🔁 Repeating Task');
        }

        return lines.join('\n');
    };

    return (
        <div
            draggable={true}
            onDragStart={(e) => onDragStart(e, event)}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            title={buildTooltip()}
            className={`absolute rounded-md px-2 py-1 text-xs cursor-grab active:cursor-grabbing transition-all hover:brightness-110 hover:scale-[1.02] overflow-hidden border z-10 shadow-sm ${textColor} ${borderColor} ${isCompleted ? 'opacity-50' : ''}`}
            style={{
                ...style,
                backgroundColor: bgColor,
                // Add small gap for visual separation when stacking
                width: style?.width ? `calc(${style.width} - 4px)` : '95%',
                left: style?.left || '2.5%',
                marginLeft: '2px'
            }}
        >
            <div className={`font-medium truncate leading-tight pointer-events-none ${isCompleted ? 'line-through' : ''}`}>
                {event.title}
            </div>

            {!isReminder && event.priority === 'High' && !isCompleted && (
                <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            )}
        </div>
    );
};
