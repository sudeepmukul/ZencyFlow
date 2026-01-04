import React, { useState } from 'react';
import { subDays, format, eachDayOfInterval } from 'date-fns';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';

export function Heatmap({ logs, blockSize = "w-3 h-3", gap = "gap-1", showCustomTooltip = false }) {
    const [tooltip, setTooltip] = useState(null);

    // Generate last 365 days
    const today = new Date();
    const days = eachDayOfInterval({
        start: subDays(today, 364),
        end: today
    });

    const getIntensity = (date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const count = logs.filter(l => l.date === dateStr).length;
        if (count === 0) return 0;
        if (count === 1) return 1;
        if (count <= 3) return 2;
        return 3;
    };

    const colors = {
        0: 'bg-zinc-900',
        1: 'bg-neon-400/30',
        2: 'bg-neon-400/60',
        3: 'bg-neon-400',
    };

    const handleMouseEnter = (e, day, habitsCount, tasksCount) => {
        if (!showCustomTooltip) return;
        const rect = e.target.getBoundingClientRect();
        setTooltip({
            x: rect.left + rect.width / 2,
            y: rect.top - 8,
            date: format(day, 'MMMM d, yyyy'),
            habits: habitsCount,
            tasks: tasksCount,
            total: habitsCount + tasksCount
        });
    };

    const handleMouseLeave = () => {
        if (showCustomTooltip) setTooltip(null);
    };

    // Calculate months for labels
    const weeks = Array.from({ length: 53 });
    const monthLabels = weeks.map((_, weekIndex) => {
        const date = days[weekIndex * 7];
        if (!date) return null;
        // Only show month label if it's the first week of that month in our grid
        const prevWeekDate = days[(weekIndex - 1) * 7];
        if (!prevWeekDate || date.getMonth() !== prevWeekDate.getMonth()) {
            return { name: format(date, 'MMM'), index: weekIndex };
        }
        return null;
    });

    return (
        <div className="overflow-x-auto pb-2 relative">
            {/* Month Labels */}
            {/* Month Labels */}
            <div className={`flex ${gap} mb-1 min-w-max`}>
                {weeks.map((_, i) => (
                    <div key={i} className={`${blockSize.split(' ')[0]} h-4 py-1 relative` /* Width matches block, fixed height for row */}>
                        {monthLabels[i] && (
                            <span className="text-[10px] text-zinc-500 font-medium absolute top-0 -left-1 whitespace-nowrap">
                                {monthLabels[i].name}
                            </span>
                        )}
                    </div>
                ))}
            </div>

            <div className={`flex ${gap} min-w-max`}>
                {weeks.map((_, weekIndex) => (
                    <div key={weekIndex} className={`flex flex-col ${gap}`}>
                        {Array.from({ length: 7 }).map((_, dayIndex) => {
                            const dayIndexTotal = weekIndex * 7 + dayIndex;
                            if (dayIndexTotal >= days.length) return null;
                            const day = days[dayIndexTotal];
                            const dayLogs = logs.filter(l => l.date === format(day, 'yyyy-MM-dd'));
                            const habitsCount = dayLogs.filter(l => l.type !== 'task').length;
                            const tasksCount = dayLogs.filter(l => l.type === 'task').length;
                            const intensity = getIntensity(day);

                            const plainTooltip = !showCustomTooltip
                                ? `${format(day, 'MMM d, yyyy')}: ${habitsCount + tasksCount} activities`
                                : undefined;

                            return (
                                <div
                                    key={day.toISOString()}
                                    title={plainTooltip}
                                    onMouseEnter={(e) => handleMouseEnter(e, day, habitsCount, tasksCount)}
                                    onMouseLeave={handleMouseLeave}
                                    className={cn(
                                        `${blockSize} rounded-sm transition-colors cursor-pointer`,
                                        colors[intensity]
                                    )}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* GitHub-style Tooltip - Portal to Body */}
            {tooltip && createPortal(
                <div
                    className="fixed z-[9999] pointer-events-none"
                    style={{
                        left: tooltip.x,
                        top: tooltip.y,
                        transform: 'translate(-50%, -100%)'
                    }}
                >
                    <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 shadow-xl text-xs">
                        <div className="text-white font-semibold mb-1">{tooltip.total} contributions on {tooltip.date}</div>
                        <div className="text-zinc-400 space-y-0.5">
                            <div>🔥 {tooltip.habits} habits completed</div>
                            <div>✅ {tooltip.tasks} tasks completed</div>
                        </div>
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-zinc-700" />
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
