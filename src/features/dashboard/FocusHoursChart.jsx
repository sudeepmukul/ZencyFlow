import React, { useState, useEffect } from 'react';
import { Clock, Zap, Calendar } from 'lucide-react';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export function FocusHoursChart({ timerLogs }) {
    const navigate = useNavigate();
    // --- Data Processing for Real Data ---
    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 1 }); // Monday start
    const end = endOfWeek(today, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });

    const weeklyData = days.map(day => {
        // Determine if day is in future to potentially hide or zero-out data
        // For now, we just show 0 for future days

        const dayLogs = timerLogs.filter(log => isSameDay(new Date(log.startTime), day));

        // Calculate total duration (in seconds)
        const totalSeconds = dayLogs.reduce((acc, log) => acc + (log.duration || 0), 0);
        // Calculate productive duration (in seconds)
        const efficientSeconds = dayLogs.reduce((acc, log) => acc + (log.productiveDuration || 0), 0);

        // Convert to hours (1 decimal place)
        const total = Math.round((totalSeconds / 3600) * 10) / 10;
        const efficient = Math.round((efficientSeconds / 3600) * 10) / 10;

        return {
            day: format(day, 'EEE'),
            total,
            efficient
        };
    });

    // Calculate Average Daily Focus
    const daysPassed = Math.max(1, (new Date().getDay() + 6) % 7 + 1); // 1 = Mon, 7 = Sun
    const totalWeekHours = weeklyData.reduce((acc, d) => acc + d.efficient, 0);
    const avgDailyFocus = (totalWeekHours / daysPassed).toFixed(1);


    // --- Animation State ---
    const [isLoaded, setIsLoaded] = useState(false);
    const [hoveredDay, setHoveredDay] = useState(null);

    useEffect(() => {
        // Small delay to ensure the transition triggers after mount
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Find the maximum total hours to scale the bars properly (adding a buffer)
    const maxDataValue = Math.max(...weeklyData.map(d => d.total));
    const maxHours = Math.max(maxDataValue, 1) * 1.1; // Minimum 1 hour scale if all 0

    return (
        <div className="h-full flex flex-col justify-between font-sans text-gray-100 p-2">

            {/* Header Section */}
            <div className="flex justify-between items-start mb-2 relative z-10 shrink-0">
                <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        Focus Metrics
                        <Zap className="w-4 h-4 text-[#fbff00] fill-current" />
                    </h2>
                </div>
                <div
                    className="bg-white/5 p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group border border-white/5"
                    onClick={() => navigate('/calendar')}
                >
                    <Calendar className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                </div>
            </div>

            {/* Chart Container - Flex 1 to take remaining height */}
            <div className="flex-1 flex items-end justify-between gap-1 sm:gap-2 relative z-10 min-h-0">
                {weeklyData.map((data, index) => {
                    // Calculate heights as percentages
                    const totalHeightPercent = (data.total / maxHours) * 100;
                    const efficientPercentOfTotal = data.total > 0 ? (data.efficient / data.total) * 100 : 0;

                    return (
                        <div
                            key={data.day}
                            className="flex flex-col items-center gap-2 group flex-1 h-full justify-end relative"
                            onMouseEnter={() => setHoveredDay(index)}
                            onMouseLeave={() => setHoveredDay(null)}
                        >
                            {/* Tooltip - Updated for Glass UI */}
                            <div
                                className={`absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900/90 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold py-1 px-2 rounded-lg shadow-xl whitespace-nowrap transition-all duration-300 z-20 pointer-events-none
                    ${hoveredDay === index ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'}
                  `}
                            >
                                <div className="flex flex-col items-center leading-none gap-0.5">
                                    <span>{data.efficient}h / {data.total}h</span>
                                    <span className="text-[9px] text-[#fbff00] font-normal">
                                        {data.total > 0 ? Math.round((data.efficient / data.total) * 100) : 0}% Efficient
                                    </span>
                                </div>
                                {/* Tooltip Triangle */}
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-4 border-transparent border-t-gray-900/90"></div>
                            </div>

                            {/* The Bar Track (Total Hours) */}
                            <div
                                className="w-full max-w-[30px] bg-white/30 backdrop-blur-md rounded-t-sm rounded-b-md relative overflow-hidden transition-all duration-1000 ease-out shadow-lg hover:shadow-[#fbff00]/20 border border-white/20"
                                style={{
                                    height: isLoaded ? `${Math.max(totalHeightPercent, 1)}%` : '0%', // Ensure at least 1% visible if data exists but is small
                                    transitionDelay: `${index * 100}ms` // Staggered animation
                                }}
                            >
                                {/* The Fill (Efficient Hours) */}
                                <div
                                    className="absolute bottom-0 left-0 w-full bg-[#fbff00] rounded-b-md rounded-t-sm transition-all duration-1000 ease-out"
                                    style={{
                                        height: isLoaded ? `${efficientPercentOfTotal}%` : '0%',
                                        transitionDelay: `${(index * 100) + 300}ms` // Start filling slightly after the bar grows
                                    }}
                                >
                                    {/* Subtle Shine Effect */}
                                    <div className="absolute top-0 left-0 w-full h-[1px] bg-white/50"></div>
                                </div>
                            </div>

                            {/* Day Label */}
                            <span className={`text-[10px] font-medium transition-colors duration-300 ${hoveredDay === index ? 'text-[#fbff00]' : 'text-gray-500'}`}>
                                {data.day}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Summary Footer */}
            <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-xs shrink-0">
                <div className="flex items-center gap-1.5 text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>Avg Daily Focus</span>
                </div>
                <span className="text-lg font-bold text-white">{avgDailyFocus}<span className="text-xs text-gray-500 font-normal ml-0.5">hrs</span></span>
            </div>

        </div>
    );
}
