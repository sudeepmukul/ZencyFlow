import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid } from 'recharts';
import { format, subDays, eachDayOfInterval } from 'date-fns';

export function SleepChart({ logs }) {
    // Generate last 30 days data
    const today = new Date();
    const days = eachDayOfInterval({
        start: subDays(today, 29),
        end: today
    });

    const data = days.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const log = logs.find(l => l.date === dateStr);
        return {
            date: format(day, 'MMM d'),
            hours: log ? log.hours : 0
        };
    });

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke="#71717a"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        minTickGap={30}
                    />
                    <YAxis
                        stroke="#71717a"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        domain={[0, 12]}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px' }}
                        itemStyle={{ color: '#fbff00' }}
                    />
                    <ReferenceLine y={8} stroke="#fbff00" strokeDasharray="3 3" label={{ value: 'Goal (8h)', fill: '#fbff00', fontSize: 10, position: 'right' }} />
                    <ReferenceLine y={6} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Poor (6h)', fill: '#ef4444', fontSize: 10, position: 'right' }} />
                    <Line
                        type="monotone"
                        dataKey="hours"
                        stroke="#fbff00"
                        strokeWidth={2}
                        dot={{ r: 3, fill: '#fbff00' }}
                        activeDot={{ r: 6, fill: '#fff' }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
