import React from 'react';
import { cn } from '../../lib/utils';

export function ProgressBar({ value, max = 100, className, barClassName }) {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    return (
        <div className={cn("h-2 bg-zinc-800 rounded-full overflow-hidden", className)}>
            <div
                className={cn("h-full bg-neon-400 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(251,255,0,0.5)]", barClassName)}
                style={{ width: `${percentage}%` }}
            />
        </div>
    );
}
