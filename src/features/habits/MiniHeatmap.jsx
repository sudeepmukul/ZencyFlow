import React from 'react';
import { eachDayOfInterval, subDays, format, isSameDay } from 'date-fns';
import { cn } from '../../lib/utils';

export function MiniHeatmap({ habitId, logs, days = 90 }) {
    const today = new Date();
    const startDate = subDays(today, days);
    const dateRange = eachDayOfInterval({ start: startDate, end: today });

    return (
        <div className="flex gap-[2px] flex-wrap max-w-full">
            {dateRange.map(date => {
                const isCompleted = logs.some(log => log.habitId === habitId && log.date === format(date, 'yyyy-MM-dd'));
                return (
                    <div
                        key={date.toISOString()}
                        title={format(date, 'MMM d, yyyy')}
                        className={cn(
                            "w-2 h-2 rounded-[1px]",
                            isCompleted ? "bg-neon-400 shadow-[0_0_4px_rgba(251,255,0,0.5)]" : "bg-zinc-800/50"
                        )}
                    />
                );
            })}
        </div>
    );
}
