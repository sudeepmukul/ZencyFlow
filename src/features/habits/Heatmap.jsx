import React from 'react';
import { subDays, format, eachDayOfInterval, startOfYear, endOfYear } from 'date-fns';
import { cn } from '../../lib/utils';

export function Heatmap({ logs }) {
    // Generate last 365 days or current year
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

    return (
        <div className="overflow-x-auto pb-2">
            <div className="flex gap-1 min-w-max">
                {/* Simplified rendering: Columns of weeks */}
                {Array.from({ length: 53 }).map((_, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1">
                        {Array.from({ length: 7 }).map((_, dayIndex) => {
                            const dayIndexTotal = weekIndex * 7 + dayIndex;
                            if (dayIndexTotal >= days.length) return null;
                            const day = days[dayIndexTotal];
                            const intensity = getIntensity(day);

                            return (
                                <div
                                    key={day.toISOString()}
                                    title={`${format(day, 'MMM d, yyyy')}: ${logs.filter(l => l.date === format(day, 'yyyy-MM-dd')).length} habits`}
                                    className={cn(
                                        "w-3 h-3 rounded-sm transition-colors",
                                        colors[intensity]
                                    )}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}
