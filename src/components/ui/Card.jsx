import React from 'react';
import { cn } from '../../lib/utils';

export function Card({ className, children, ...props }) {
    return (
        <div
            className={cn(
                "glass-card p-6 rounded-2xl",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
