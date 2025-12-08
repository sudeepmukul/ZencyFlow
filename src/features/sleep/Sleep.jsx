import React, { useState, useMemo } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import {
    Moon,
    Clock,
    Plus,
    X,
    Calendar,
    Activity,
    Star
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';

// --- Constants ---
const NEON_YELLOW = "#fbff00";

// --- Helper Components ---

const GlassCard = ({ children, className = "" }) => (
    <div className={`relative overflow-hidden bg-zinc-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl ${className}`}>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        {children}
    </div>
);

const StatCard = ({ icon: Icon, label, value, subtext, trend }) => (
    <GlassCard className="group transition-all duration-300 hover:bg-zinc-800/60 hover:border-[#fbff00]/30 hover:shadow-[#fbff00]/10 hover:-translate-y-1">
        <div className="flex items-center gap-4">
            {/* Icon Section - Side by Side */}
            <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800 group-hover:border-[#fbff00]/50 group-hover:text-[#fbff00] transition-colors text-zinc-400 shadow-inner shrink-0">
                <Icon size={20} />
            </div>

            {/* Text Section */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-zinc-400 font-medium truncate">{label}</p>
                    {trend && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-2 ${trend >= 0 ? 'bg-[#fbff00]/10 text-[#fbff00]' : 'bg-red-500/10 text-red-400'}`}>
                            {trend > 0 ? '+' : ''}{trend}%
                        </span>
                    )}
                </div>
                <div className="flex items-baseline gap-2 mt-0.5">
                    <h3 className="text-2xl font-bold text-white tracking-tight leading-none">{value}</h3>
                </div>
                <p className="text-xs text-zinc-500 mt-1 truncate">{subtext}</p>
            </div>
        </div>
    </GlassCard>
);

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />
            <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5 bg-zinc-900/50">
                    <h2 className="text-xl font-bold text-white">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                {/* Content */}
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---

export function Sleep() {
    const { sleepLogs, addSleepLog, deleteSleepLog } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [hoursSlept, setHoursSlept] = useState('');

    // --- Logic & Calculations ---

    const handleSave = async (e) => {
        e.preventDefault();
        if (!selectedDate || !hoursSlept) return;

        try {
            const logData = {
                date: selectedDate,
                hours: parseFloat(hoursSlept),
                timestamp: new Date().toISOString()
            };

            await addSleepLog(logData);

            // Reset & Close
            setHoursSlept('');
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error saving log:", error);
        }
    };

    const logs = useMemo(() => {
        // Sort logic handled in render, but let's be safe
        return [...sleepLogs].sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [sleepLogs]);

    const stats = useMemo(() => {
        if (logs.length === 0) return { avg: 0, total: 0, goalMet: 0 };

        const totalHours = logs.reduce((acc, log) => acc + (parseFloat(log.hours) || 0), 0);
        const avg = (totalHours / logs.length).toFixed(1);

        // Assume goal is 8 hours
        const goalMetCount = logs.filter(log => log.hours >= 8).length;
        const goalMetPercent = Math.round((goalMetCount / logs.length) * 100);

        return { avg, total: logs.length, goalMet: goalMetPercent };
    }, [logs]);

    // Prepare chart data (last 30 entries max for cleaner UI)
    const chartData = useMemo(() => {
        return logs.slice(-30).map(log => ({
            date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            hours: log.hours,
            originalDate: log.date
        }));
    }, [logs]);

    // Custom Tooltip for Chart
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-zinc-900/90 border border-white/10 p-3 rounded-xl shadow-xl backdrop-blur-md">
                    <p className="text-zinc-400 text-xs mb-1">{label}</p>
                    <p className="font-bold text-lg" style={{ color: NEON_YELLOW }}>
                        {payload[0].value} <span className="text-xs font-normal text-white">hrs</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen text-white font-sans selection:bg-[#fbff00]/30 -m-8 p-8 relative overflow-hidden">
            {/* Background Decor - ensuring it stays within this container */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 mix-blend-screen"
                    style={{ backgroundColor: NEON_YELLOW }} />
                <div className="absolute bottom-[10%] left-[10%] w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[120px] opacity-30 mix-blend-screen" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-white to-zinc-500 bg-clip-text text-transparent">
                            Sleep Tracker
                        </h1>
                        <p className="text-zinc-400 flex items-center gap-2 text-sm md:text-base">
                            <Star size={14} fill={NEON_YELLOW} color={NEON_YELLOW} />
                            paduko bhai soja
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="group relative px-6 py-3 rounded-full text-black font-bold shadow-[0_0_20px_-5px_rgba(251,255,0,0.4)] transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 hover:bg-[#e6eb00]"
                        style={{ backgroundColor: NEON_YELLOW }}
                    >
                        <Plus size={20} className="transition-transform group-hover:rotate-90" />
                        <span>Log Sleep</span>
                    </button>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        icon={Moon}
                        value={`${stats.avg}h`}
                        label="Average Sleep"
                        subtext="Last 30 entries"
                        trend={stats.avg >= 7 ? 12 : -5}
                    />
                    <StatCard
                        icon={Activity}
                        value={`${stats.goalMet}%`}
                        label="Goal Met"
                        subtext="Target: 8h / night"
                    />
                    <StatCard
                        icon={Calendar}
                        value={stats.total}
                        label="Total Entries"
                        subtext="All time logs"
                    />
                </div>

                {/* Main Chart Section */}
                <GlassCard className="min-h-[400px]">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1">Sleep Trends</h3>
                            <p className="text-sm text-zinc-400">Duration over time</p>
                        </div>
                        {/* Legend */}
                        <div className="flex gap-4 text-xs font-medium text-zinc-500">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full box-shadow-lg" style={{ backgroundColor: NEON_YELLOW, boxShadow: `0 0 10px ${NEON_YELLOW}50` }} />
                                Duration
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full border border-dashed border-zinc-600" />
                                8h Goal
                            </div>
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={NEON_YELLOW} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={NEON_YELLOW} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#71717a', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#71717a', fontSize: 12 }}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff20', strokeWidth: 1 }} />
                                <ReferenceLine y={8} stroke="#ffffff30" strokeDasharray="3 3" />
                                <Area
                                    type="monotone"
                                    dataKey="hours"
                                    stroke={NEON_YELLOW}
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorSleep)"
                                    animationDuration={1500}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                {/* Recent History List (Mini) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <GlassCard className="col-span-1 md:col-span-2">
                        <h3 className="text-lg font-bold text-white mb-4">Recent History</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-zinc-500 text-xs uppercase tracking-wider border-b border-white/5">
                                        <th className="pb-3 pl-2 font-medium">Date</th>
                                        <th className="pb-3 font-medium">Status</th>
                                        <th className="pb-3 font-medium">Duration</th>
                                        <th className="pb-3 pr-2 text-right font-medium">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {logs.slice().reverse().slice(0, 5).map((log) => (
                                        <tr key={log.id || log.date} className="group hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                                            <td className="py-4 pl-2 text-zinc-300">
                                                {new Date(log.date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}
                                            </td>
                                            <td className="py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${log.hours >= 8
                                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                                                    }`}>
                                                    {log.hours >= 8 ? 'Good Rest' : 'Sleep Debt'}
                                                </span>
                                            </td>
                                            <td className="py-4 font-semibold text-white">
                                                {log.hours} hours
                                            </td>
                                            <td className="py-4 pr-2 text-right">
                                                <button
                                                    onClick={() => deleteSleepLog(log.date)}
                                                    className="text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-2"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {logs.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="py-8 text-center text-zinc-500 italic">
                                                No sleep logs yet. Start by tracking tonight's sleep!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>
                </div>
            </div>

            {/* Log Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Log Sleep Session"
            >
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-zinc-500 tracking-wider ml-1">Date</label>
                        <div className="relative">
                            <input
                                type="date"
                                required
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 transition-all [color-scheme:dark]"
                                style={{ '--tw-ring-color': NEON_YELLOW, '--tw-border-opacity': 1 }}
                                onFocus={(e) => e.target.style.borderColor = NEON_YELLOW}
                                onBlur={(e) => e.target.style.borderColor = ''}
                            />
                            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={18} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-zinc-500 tracking-wider ml-1">Hours Slept</label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="24"
                                required
                                placeholder="e.g. 7.5"
                                value={hoursSlept}
                                onChange={(e) => setHoursSlept(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 transition-all"
                                style={{ '--tw-ring-color': NEON_YELLOW }}
                                onFocus={(e) => e.target.style.borderColor = NEON_YELLOW}
                                onBlur={(e) => e.target.style.borderColor = ''}
                            />
                            <Clock className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={18} />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 px-4 py-3 rounded-xl border border-zinc-800 text-zinc-400 font-medium hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 rounded-xl text-black font-bold hover:opacity-90 transition-opacity shadow-lg"
                            style={{ backgroundColor: NEON_YELLOW, boxShadow: `0 4px 20px ${NEON_YELLOW}40` }}
                        >
                            Save Log
                        </button>
                    </div>
                </form>
            </Modal>

        </div>
    );
}
