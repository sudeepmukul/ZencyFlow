import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card } from '../../components/ui/Card';

export function PeakPerformanceChart({ tasks }) {
    // Calculate peak hours based on task completion time
    const hoursData = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        count: 0,
        label: i === 0 ? '12AM' : i === 12 ? '12PM' : i > 12 ? `${i - 12}PM` : `${i}AM`
    }));

    tasks.forEach(task => {
        if (task.status === 'completed' && task.completedAt) {
            const hour = new Date(task.completedAt).getHours();
            hoursData[hour].count += 1;
        }
    });

    // Filter to show only relevant range if needed, or just show all 24h simplified
    // For UI cleanliness, let's show 6AM to 11PM or dynamic range
    // For now, showing full 24h but with simplified XAxis

    const activeHours = hoursData.filter(h => h.count > 0);
    const maxCount = Math.max(...hoursData.map(h => h.count), 5); // Minimum scale of 5

    return (
        <div className="h-full w-full">
            <h3 className="text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">Peak Performance Hours</h3>
            <div className="h-[120px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hoursData}>
                        <XAxis
                            dataKey="label"
                            tick={{ fontSize: 10, fill: '#71717a' }}
                            interval={3}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                            itemStyle={{ color: '#fbff00' }}
                            cursor={{ fill: '#27272a', opacity: 0.4 }}
                        />
                        <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                            {hoursData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.count > 0 ? '#fbff00' : '#27272a'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
