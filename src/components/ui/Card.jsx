import React from 'react';
import { cn } from '../../lib/utils';

export function Card({ className, children, ...props }) {
    return (
        <div
            className={cn(
                "bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm",
                "hover:border-neon-400/30 transition-colors duration-300",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
