import React from 'react';
import { cn } from '../../lib/utils';

export function Button({ className, variant = 'primary', size = 'md', ...props }) {
    const variants = {
        primary: 'glass-button-primary font-bold',
        secondary: 'bg-white/5 text-white hover:bg-white/10 border border-white/5 backdrop-blur-sm',
        danger: 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 backdrop-blur-sm',
        ghost: 'hover:bg-white/5 text-zinc-400 hover:text-white transition-colors',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2',
        lg: 'px-6 py-3 text-lg',
        icon: 'p-2',
    };

    return (
        <button
            className={cn(
                "rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        />
    );
}
