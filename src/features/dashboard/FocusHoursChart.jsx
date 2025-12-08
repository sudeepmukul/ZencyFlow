import React, { useState, useEffect } from 'react';
import { Clock, Zap, Calendar } from 'lucide-react';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay } from 'date-fns';

export function FocusHoursChart({ timerLogs }) {
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
    // We only count days up until today to get a realistic average, or just divide by 7
    // Let's divide by the number of days that have passed in the week so far (including today)
    const daysPassed = Math.max(1, (new Date().getDay() + 6) % 7 + 1); // 1 = Mon, 7 = Sun
    const totalWeekHours = weeklyData.reduce((acc, d) => acc + d.efficient, 0); // Using efficient hours for average? User prompt used "Avg Daily Focus". Let's use efficient hours as "Focus" usually implies productive time.
    // Actually, usually "Focus" means the total time spent focusing. The user's mock data had "total" and "efficient". 
    // Let's use 'total' for the average to match the conceptual "Focus Hours".
    // Re-reading mock data: "Avg Daily Focus" was 5.8hrs. Mock data average: (6.5+8+5.5+9+7.5+4+3)/7 = 6.2. 
    // Wait, let's look at the summary footer. "Avg Daily Focus". 
    // Let's calculate average of 'efficient' hours since that is what usually matters, BUT standard is often total time. 
    // Let's use EFFICIENT hours because Zency is about "Deep Focus".
    // Actually, looking at the previous chart, it was showing "Focus Hours" (efficient). 
    // Let's stick to using `efficient` as the primary metric for "Focus", or `total` if we want to show seat time. 
    // The new chart shows both. Let's average the `efficient` hours for the summary as it's more valuable.
    // Correction: straightforward average of the data shown. The mock data had Total and Efficient. 
    // I will use `efficient` hours for the "Avg Daily Focus" because that's the "productive" metric.
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
    // Ensure we have at least a small max to avoid divide by zero or tiny bars
    const maxDataValue = Math.max(...weeklyData.map(d => d.total));
    const maxHours = Math.max(maxDataValue, 1) * 1.1; // Minimum 1 hour scale if all 0

    return (
        <div className="h-full flex items-center justify-center font-sans text-gray-100">

            {/* Main Card Container - Adapted to fill parent height/width or behave as a widget */}
            <div className="w-full h-full bg-gray-900/40 backdrop-blur-xl rounded-xl p-4 shadow-2xl border border-white/10 relative overflow-hidden flex flex-col">

                {/* Background Decorative Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#fbff00]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                {/* Header Section */}
                <div className="flex justify-between items-start mb-4 relative z-10 shrink-0">
                    <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            Focus Metrics
                            <Zap className="w-4 h-4 text-[#fbff00] fill-current" />
                        </h2>
                        <p className="text-gray-400 text-xs mt-0.5">Weekly productivity breakdown</p>
                    </div>
                    <div className="bg-white/5 p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group border border-white/5">
                        <Calendar className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                    </div>
                </div>

                {/* Legend / Info */}
                <div className="flex gap-3 mb-2 text-[10px] font-medium relative z-10 shrink-0">
                    <div className="flex items-center gap-1.5 bg-gray-700/30 px-2 py-1 rounded-md border border-gray-700">
                        <div className="w-2 h-2 rounded-sm bg-white/30 border border-white/20"></div>
                        <span className="text-gray-300">Total</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-[#fbff00]/10 px-2 py-1 rounded-md border border-[#fbff00]/20">
                        <div className="w-2 h-2 rounded-sm bg-[#fbff00]"></div>
                        <span className="text-[#fbff00]">Efficient</span>
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
        </div>
    );
}
