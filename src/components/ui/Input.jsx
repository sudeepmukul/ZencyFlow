import React from 'react';
import { cn } from '../../lib/utils';

export function Input({ className, ...props }) {
    return (
        <input
            className={cn(
                "w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-100 placeholder:text-zinc-500",
                "focus:outline-none focus:border-neon-400/50 focus:ring-1 focus:ring-neon-400/50 transition-all duration-200",
                className
            )}
            {...props}
        />
    );
}

export function Select({ className, ...props }) {
    return (
        <select
            className={cn(
                "w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2 text-zinc-100",
                "focus:outline-none focus:border-neon-400/50 focus:ring-1 focus:ring-neon-400/50 transition-all duration-200",
                className
            )}
            {...props}
        />
    );
}
