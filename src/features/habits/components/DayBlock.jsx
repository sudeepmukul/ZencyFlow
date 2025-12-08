import React, { useState } from 'react';
import { Check } from 'lucide-react';

export const DayBlock = ({ day, isCompleted, onClick, disabled }) => {
    const [isAnimating, setIsAnimating] = useState(false);

    const handleClick = () => {
        if (disabled) return;
        setIsAnimating(true);
        onClick();
        setTimeout(() => setIsAnimating(false), 300);
    };

    return (
        <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">
                {day}
            </span>
            <button
                onClick={handleClick}
                disabled={disabled}
                className={`
          group relative flex h-12 w-12 items-center justify-center rounded-xl border-2 transition-all duration-300 ease-out
          ${isCompleted
                        ? 'border-[#FBFF00] bg-[#FBFF00] text-black shadow-[0_0_20px_rgba(251,255,0,0.4)]'
                        : 'border-white/10 bg-white/5 hover:border-[#FBFF00]/50 hover:bg-white/10'
                    }
          ${isAnimating ? 'scale-90' : 'scale-100 hover:scale-105'}
        `}
            >
                <div
                    className={`transition-all duration-300 ${isCompleted ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                        }`}
                >
                    <Check strokeWidth={4} size={20} />
                </div>
                {isCompleted && (
                    <span className="absolute inset-0 -z-10 animate-ping rounded-xl bg-[#FBFF00] opacity-20 duration-700" />
                )}
            </button>
        </div>
    );
};
