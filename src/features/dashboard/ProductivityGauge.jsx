import React from 'react';
import { cn } from '../../lib/utils';

export function ProductivityGauge({ value, label, size = "md" }) {
    // value is 0-100
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    const sizeClasses = {
        sm: "w-20 h-20",
        md: "w-24 h-24",
        lg: "w-32 h-32"
    };

    return (
        <div className="flex flex-col items-center">
            <div className={cn("relative flex items-center justify-center", sizeClasses[size])}>
                {/* Background Circle */}
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="50%"
                        cy="50%"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="transparent"
                        className="text-zinc-800"
                    />
                    {/* Progress Circle */}
                    <circle
                        cx="50%"
                        cy="50%"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="text-neon-400 transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={cn("font-bold text-white", size === 'sm' ? "text-lg" : "text-xl")}>{value}%</span>
                </div>
            </div>
            <span className="text-[10px] text-zinc-400 mt-1 font-bold uppercase tracking-wider">{label}</span>
        </div>
    );
}
