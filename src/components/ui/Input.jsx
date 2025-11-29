import React from 'react';
import { cn } from '../../lib/utils';

export function Input({ className, ...props }) {
    return (
        <input
            className={cn(
                "glass-input w-full px-4 py-3 rounded-xl placeholder:text-zinc-500",
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
                "glass-input w-full px-4 py-3 rounded-xl appearance-none cursor-pointer",
                className
            )}
            {...props}
        />
    );
}
