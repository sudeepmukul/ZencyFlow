import React from 'react';

export function TimeGrid({ pixelsPerMinute }) {
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
        <div className="relative w-full h-full pointer-events-none select-none">
            {hours.map((hour) => (
                <div
                    key={hour}
                    className="absolute w-full border-t border-zinc-800/50 flex items-start"
                    style={{ top: hour * 60 * pixelsPerMinute, height: 60 * pixelsPerMinute }}
                >
                    <span className="absolute -left-12 -top-2 text-[10px] text-zinc-500 font-mono w-10 text-right">
                        {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                    </span>
                </div>
            ))}
            {/* Current Time Indicator (Static for now, will be updated by parent or self) */}
        </div>
    );
}
