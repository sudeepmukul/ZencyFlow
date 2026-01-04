import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#fbff00', '#22c55e', '#3b82f6', '#ec4899', '#a855f7', '#ef4444', '#f97316', '#14b8a6'];

export function XPByCategoryChart({ tasks, categories }) {
    const data = useMemo(() => {
        const categoryMap = {};

        // 1. Initialize custom categories
        categories.forEach(cat => {
            categoryMap[cat.name] = 0;
        });

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // 2. Aggregate XP
        tasks.forEach(task => {
            if (task.status === 'completed' && task.category && task.completedAt) {
                const completedDate = new Date(task.completedAt);
                if (completedDate.getMonth() === currentMonth && completedDate.getFullYear() === currentYear) {
                    const xp = task.xpValue || 20;
                    const catName = task.category;
                    categoryMap[catName] = (categoryMap[catName] || 0) + xp;
                }
            }
        });

        // 3. Convert to array and filter out zero values
        return Object.entries(categoryMap)
            .map(([name, value]) => ({ name, value }))
            .filter(item => item.value > 0)
            .sort((a, b) => b.value - a.value);

    }, [tasks, categories]);

    const totalXP = data.reduce((a, b) => a + b.value, 0);
    const legendData = data.slice(0, 5);

    if (data.length === 0) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center relative">
                <h3 className="absolute top-2 left-0 right-0 text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest text-center">XP by Category</h3>
                <div className="w-16 h-16 rounded-full border-4 border-zinc-800 border-t-zinc-700 animate-spin-slow opacity-20 mt-4" />
                <p className="text-zinc-600 text-[9px] mt-2">No data yet</p>
            </div>
        );
    }

    return (
        <div className="h-full w-full relative">
            {/* Title - Absolute Positioned to save space */}
            <h3 className="absolute top-2 left-0 right-0 text-[9px] font-extrabold text-zinc-400 uppercase tracking-widest text-center z-10 pointer-events-none">
                XP by Category
            </h3>

            <div className="h-full w-full flex items-center pt-4 pl-1">
                {/* Chart Area - 55% Width */}
                <div className="w-[55%] h-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius="55%"
                                outerRadius="80%"
                                paddingAngle={3}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#18181b',
                                    border: '1px solid #27272a',
                                    borderRadius: '8px',
                                    fontSize: '10px',
                                    padding: '4px 8px'
                                }}
                                itemStyle={{ color: '#fff', padding: 0 }}
                                formatter={(value) => [`${value} XP`, '']}
                            />
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Center Value */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-[10px] font-bold text-zinc-400">
                            {totalXP}
                        </span>
                    </div>
                </div>

                {/* Legend Area - 45% Width */}
                <div className="w-[45%] flex flex-col justify-center gap-1.5 pl-1 pr-2">
                    {legendData.map((entry, index) => (
                        <div key={entry.name} className="flex items-center gap-1.5 min-w-0 w-full">
                            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            <div className="flex flex-col min-w-0 flex-1 leading-none">
                                <div className="flex justify-between items-baseline w-full">
                                    <span className="text-[9px] text-zinc-300 font-medium truncate pr-1" title={entry.name}>
                                        {entry.name}
                                    </span>
                                    <span className="text-[8px] text-zinc-500 font-mono shrink-0">
                                        {Math.round((entry.value / totalXP) * 100)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {data.length > 5 && (
                        <div className="text-[8px] text-zinc-600 pl-3 italic">
                            + {data.length - 5} more
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
