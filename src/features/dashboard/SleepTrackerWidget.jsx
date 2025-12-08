import React, { useState, useEffect, useMemo } from 'react';
import { Moon } from 'lucide-react';
import { subDays, format } from 'date-fns';

export function SleepTrackerWidget({ sleepLogs }) { // Accept sleepLogs prop
    // --- Data Processing ---
    const sleepData = useMemo(() => {
        // Generate last 7 days including today
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = subDays(new Date(), i);
            const dateStr = format(date, 'yyyy-MM-dd');
            const dayLabel = format(date, 'EEEEE'); // S, M, T... (Narrow day)

            const log = sleepLogs.find(l => l.date === dateStr);
            const hours = log ? parseFloat(log.hours) : 0;
            // Score calculation: 8 hours = 100, capped at 100
            const score = Math.min(Math.round((hours / 8) * 100), 100);

            days.push({ day: dayLabel, hours, score });
        }
        return days;
    }, [sleepLogs]);

    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Determine which data to display: hovered or latest (default)
    const activeData = hoveredIndex !== null ? sleepData[hoveredIndex] : sleepData[sleepData.length - 1];

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // --- Graph Calculations ---
    // Adjusted for responsiveness
    const width = 100;
    const height = 50; // Reduced height slightly to fit better in compact widgets
    const paddingX = 5;
    const paddingY = 5;

    // Dynamic scale based on data, but min 0 and max at least 10 for context
    const minHours = 0; // Always start from 0 for area charts usually, or adapt
    const maxHours = Math.max(10, ...sleepData.map(d => d.hours));

    // Helper to convert data point to SVG coordinates
    const getCoord = (index, value) => {
        const x = paddingX + (index / (sleepData.length - 1)) * (width - 2 * paddingX);
        // Invert Y because SVG y=0 is top
        const y = height - paddingY - ((value - minHours) / (maxHours - minHours)) * (height - 2 * paddingY);
        return [x, y];
    };

    // Generate Smooth Path
    const generatePath = (data, isArea = false) => {
        if (data.length === 0) return "";

        const points = data.map((d, i) => getCoord(i, d.hours));

        let d = `M ${points[0][0]},${points[0][1]}`;

        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i === 0 ? 0 : i - 1];
            const p1 = points[i];
            const p2 = points[i + 1];
            const p3 = points[i + 2] || p2;

            // Catmull-Rom to Cubic Bezier conversion factor approx
            const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
            const cp1y = p1[1] + (p2[1] - p0[1]) / 6;

            const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
            const cp2y = p2[1] - (p3[1] - p1[1]) / 6;

            d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`;
        }

        if (isArea) {
            d += ` L ${points[points.length - 1][0]},${height} L ${points[0][0]},${height} Z`;
        }

        return d;
    };

    const linePath = useMemo(() => generatePath(sleepData), [sleepData]);
    const areaPath = useMemo(() => generatePath(sleepData, true), [sleepData]);

    return (
        // Adapted container to fill parent
        <div className="h-full w-full bg-gray-900/40 backdrop-blur-xl rounded-xl p-3 shadow-2xl border border-white/10 relative z-10 overflow-hidden flex flex-col justify-between group">

            {/* Decorative Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#fbff00]/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-[#fbff00]/20 transition-all duration-500"></div>

            {/* Header */}
            <div className="flex justify-between items-center z-10 mb-1">
                <div className="flex items-center gap-2">
                    <div className="p-1 bg-white/5 rounded-md backdrop-blur-md border border-white/5">
                        <Moon className="w-3 h-3 text-[#fbff00] fill-current" />
                    </div>
                    <span className="font-bold text-white text-xs tracking-wide">Sleep</span>
                </div>
                {/* Dynamic Header Display */}
                <div className="flex items-baseline gap-0.5">
                    <span className="text-xl font-bold text-white tracking-tight">{activeData.hours}</span>
                    <span className="text-[9px] text-[#fbff00] font-medium">hrs</span>
                </div>
            </div>

            {/* Graph Container */}
            <div className="relative flex-1 w-full -mx-1 min-h-0">
                <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full h-full visible overflow-visible">
                    <defs>
                        <linearGradient id="lineGradientSmall" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#fbff00" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#fbff00" stopOpacity="0.0" />
                        </linearGradient>
                    </defs>

                    {/* Area Fill */}
                    <path
                        d={areaPath}
                        fill="url(#lineGradientSmall)"
                        className="transition-opacity duration-1000 ease-out"
                        style={{ opacity: isLoaded ? 1 : 0 }}
                    />

                    {/* The Line */}
                    <path
                        d={linePath}
                        fill="none"
                        stroke="#fbff00"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="drop-shadow-[0_0_6px_rgba(251,255,0,0.4)]"
                        strokeDasharray="300"
                        strokeDashoffset={isLoaded ? "0" : "300"}
                        style={{ transition: 'stroke-dashoffset 2s cubic-bezier(0.22, 1, 0.36, 1)' }}
                    />

                    {/* Interactive Points */}
                    {sleepData.map((d, i) => {
                        const [cx, cy] = getCoord(i, d.hours);
                        const isHovered = hoveredIndex === i;

                        return (
                            <g key={i}
                                onMouseEnter={() => setHoveredIndex(i)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                style={{ cursor: 'pointer' }}
                            >
                                {/* Hit Area */}
                                <circle cx={cx} cy={cy} r="6" fill="transparent" />

                                {/* Visible Dot */}
                                <circle
                                    cx={cx}
                                    cy={cy}
                                    r={isHovered ? 3 : 0}
                                    fill="#111827"
                                    stroke="#fbff00"
                                    strokeWidth={1.5}
                                    className="transition-all duration-200"
                                />
                            </g>
                        );
                    })}
                </svg>

                {/* Compact Tooltip */}
                {hoveredIndex !== null && (
                    <div
                        className="absolute transform -translate-x-1/2 -translate-y-full pointer-events-none z-20"
                        style={{
                            left: `${(hoveredIndex / (sleepData.length - 1)) * 100}%`,
                            // Approximated top position or fixed above
                            top: '10%'
                        }}
                    >
                        <div className="bg-gray-900/95 backdrop-blur-md border border-white/10 rounded-md px-1.5 py-0.5 shadow-xl flex flex-col items-center whitespace-nowrap">
                            <span className="text-white text-[10px] font-bold">{sleepData[hoveredIndex].hours}h</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Days Row */}
            <div className="flex justify-between items-center px-1 pt-1 border-t border-white/5">
                {sleepData.map((d, i) => (
                    <span
                        key={i}
                        className={`text-[9px] font-medium transition-colors duration-300 ${hoveredIndex === i ? 'text-[#fbff00]' : 'text-gray-500'}`}
                    >
                        {d.day}
                    </span>
                ))}
            </div>

        </div>
    );
};
