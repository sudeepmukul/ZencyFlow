import React from 'react';
import { Flame, Trophy, Edit2, Trash2 } from 'lucide-react';
import { DayBlock } from './DayBlock';
import { ConsistencyStrip } from './ConsistencyStrip';
import { PixelHeart } from './PixelHeart';

export const HabitCard = ({ habit, onToggle, onEdit, onDelete, onDoubleClick }) => {
    const completedCount = habit.weekStatus.filter(Boolean).length;
    const progressPercent = (completedCount / 7) * 100;
    const hearts = habit.hearts ?? 3;
    const maxHearts = habit.maxHearts || 3;

    const getMotivation = () => {
        if (hearts <= 0) return "Streak broken 💔";
        if (hearts === 1) return "Last heart! ⚠️";
        if (habit.streak > 10) return "Unstoppable! 🔥";
        if (habit.streak > 3) return "Great momentum!";
        if (completedCount === 7) return "Perfect Week!";
        return "You got this.";
    };

    return (
        <div
            className="group relative overflow-hidden rounded-3xl border border-white/5 bg-[#1A1A1A] p-6 transition-all duration-300 hover:border-[#FBFF00]/20 hover:bg-[#202020] hover:shadow-[0_0_40px_-10px_rgba(251,255,0,0.1)] cursor-pointer"
            onDoubleClick={onDoubleClick}
        >
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#FBFF00]/5 blur-3xl transition-opacity duration-500 group-hover:opacity-100 opacity-0" />

            <div className="relative z-10 mb-6 flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FBFF00]/10 text-[#FBFF00] text-xl border border-[#FBFF00]/20`}>
                        {habit.icon}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-[#FBFF00] transition-colors">{habit.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs font-medium text-gray-300 border border-white/5">
                                {habit.category}
                            </span>
                            <span className="text-xs">•</span>
                            <span className="text-[#FBFF00] font-medium animate-pulse">{getMotivation()}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <button
                            onClick={onEdit}
                            className="rounded-lg p-2 text-gray-500 hover:bg-[#FBFF00]/10 hover:text-[#FBFF00] transition-colors"
                        >
                            <Edit2 size={16} />
                        </button>
                        <button
                            onClick={onDelete}
                            className="rounded-lg p-2 text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>

                    <div className="flex items-center gap-3 rounded-full border border-white/10 bg-black/20 px-4 py-2 backdrop-blur-sm group-hover:border-[#FBFF00]/30 transition-colors">
                        <div className="flex items-center gap-1.5 text-[#FBFF00]">
                            <Flame size={16} className={`${habit.streak > 0 ? 'fill-[#FBFF00]' : ''}`} />
                            <span className="font-bold">{habit.streak}</span>
                        </div>
                        <div className="h-4 w-[1px] bg-white/10" />
                        <div className="flex items-center gap-1.5 text-gray-400">
                            <Trophy size={16} />
                            <span className="text-sm font-medium">{habit.best || 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pixel Hearts (Minecraft-style) */}
            <div className="relative z-10 mb-4 flex items-center gap-1">
                {Array.from({ length: maxHearts }).map((_, i) => (
                    <PixelHeart key={i} filled={i < hearts} size={20} />
                ))}
                <span className="ml-2 text-xs text-zinc-500 font-medium">{hearts}/{maxHearts}</span>
            </div>

            <div className="relative z-10 mb-6 flex justify-between gap-2">
                {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day, index) => {
                    const currentDayIndex = (new Date().getDay() + 6) % 7;
                    return (
                        <DayBlock
                            key={day}
                            day={day}
                            isCompleted={habit.weekStatus[index]}
                            isToday={index === currentDayIndex}
                            onClick={() => onToggle(habit.id, index)}
                        />
                    );
                })}
            </div>

            <div className="relative z-10 mb-4 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                <div
                    className="h-full rounded-full bg-[#FBFF00] shadow-[0_0_10px_rgba(251,255,0,0.5)] transition-all duration-700 ease-out"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            <ConsistencyStrip history={habit.history} />


        </div>
    );
};

