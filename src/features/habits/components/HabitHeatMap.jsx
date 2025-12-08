import React, { useMemo } from 'react';

export const HabitHeatMap = ({ habits }) => {
    // Calculate yearly activity dynamically based on all habits
    const weeksData = useMemo(() => {
        // 52 weeks * 7 days = 364 days
        const totalDays = 52 * 7;
        const dailyCounts = new Array(totalDays).fill(0);

        habits.forEach(habit => {
            // Ensure we look at the history from the end backwards
            const historyLen = habit.history?.length || 0;
            // Map habit history to our 364 day grid
            if (habit.history) {
                habit.history.forEach((done, idx) => {
                    // Align the end of habit history with the end of our grid
                    const gridIndex = totalDays - (historyLen - idx);
                    if (gridIndex >= 0 && gridIndex < totalDays && done) {
                        dailyCounts[gridIndex]++;
                    }
                });
            }
        });

        // Chunk into weeks for rendering
        const weeks = [];
        for (let i = 0; i < totalDays; i += 7) {
            weeks.push(dailyCounts.slice(i, i + 7));
        }
        return weeks;
    }, [habits]);

    const getColor = (count) => {
        if (count === 0) return 'bg-white/5';
        // Logic: Color intensity depends on how many tasks were done that day
        // Scale: 1 task = dim yellow, 3+ tasks = bright neon
        if (count === 1) return 'bg-[#FBFF00]/20';
        if (count === 2) return 'bg-[#FBFF00]/40';
        if (count === 3) return 'bg-[#FBFF00]/70';
        return 'bg-[#FBFF00] shadow-[0_0_10px_#FBFF00]';
    };

    return (
        <div className="w-full overflow-hidden rounded-3xl border border-white/5 bg-[#1A1A1A] p-6 transition-all duration-300 hover:border-[#FBFF00]/20 hover:bg-[#202020] hover:shadow-[0_0_40px_-10px_rgba(251,255,0,0.1)]">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-300">Yearly Activity</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Less</span>
                    <div className="flex gap-1">
                        <div className="h-3 w-3 rounded-sm bg-white/5"></div>
                        <div className="h-3 w-3 rounded-sm bg-[#FBFF00]/20"></div>
                        <div className="h-3 w-3 rounded-sm bg-[#FBFF00]/40"></div>
                        <div className="h-3 w-3 rounded-sm bg-[#FBFF00]/70"></div>
                        <div className="h-3 w-3 rounded-sm bg-[#FBFF00]"></div>
                    </div>
                    <span>More</span>
                </div>
            </div>

            <div className="overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="flex gap-1 min-w-max">
                    {weeksData.map((week, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-1">
                            {week.map((count, dayIndex) => (
                                <div
                                    key={`${weekIndex}-${dayIndex}`}
                                    className={`h-3 w-3 rounded-sm transition-all duration-300 hover:scale-125 hover:z-10 ${getColor(count)}`}
                                    title={`${count} tasks completed`}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
