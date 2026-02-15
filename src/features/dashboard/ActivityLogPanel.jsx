import React from 'react';
import { ScrollText } from 'lucide-react';

function timeAgo(dateStr) {
    const now = new Date();
    const then = new Date(dateStr);
    const diffMs = now - then;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function ActivityLogPanel({ logs = [], compact = false }) {
    const displayLogs = logs.slice(0, compact ? 10 : 20);

    if (displayLogs.length === 0) {
        return (
            <div className="rounded-2xl border border-white/5 bg-[#141414] p-6">
                <div className="flex items-center gap-2 mb-4">
                    <ScrollText size={18} className="text-[#FBFF00]" />
                    <h3 className="text-sm font-bold text-white tracking-wide uppercase">Activity Log</h3>
                </div>
                <div className="flex flex-col items-center justify-center py-8 text-zinc-600">
                    <ScrollText size={32} className="mb-2 opacity-40" />
                    <p className="text-sm">No activity yet</p>
                    <p className="text-xs text-zinc-700 mt-1">Complete tasks & habits to see your log</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-white/5 bg-[#141414] p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <ScrollText size={18} className="text-[#FBFF00]" />
                    <h3 className="text-sm font-bold text-white tracking-wide uppercase">Activity Log</h3>
                </div>
                <span className="text-xs text-zinc-600">{logs.length} total</span>
            </div>

            <div className={`space-y-1 ${compact ? 'max-h-64' : 'max-h-96'} overflow-y-auto custom-scrollbar pr-1`}>
                {displayLogs.map((log, i) => (
                    <div
                        key={log.id || i}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/[0.03] group"
                    >
                        {/* Emoji icon */}
                        <span className="text-lg shrink-0 w-7 text-center">{log.icon || '📌'}</span>

                        {/* Message */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-zinc-300 truncate group-hover:text-white transition-colors">
                                {log.message}
                            </p>
                        </div>

                        {/* XP Change */}
                        {log.xpChange !== 0 && log.xpChange != null && (
                            <span className={`text-xs font-bold shrink-0 px-2 py-0.5 rounded-full ${log.xpChange > 0
                                    ? 'text-emerald-400 bg-emerald-500/10'
                                    : 'text-red-400 bg-red-500/10'
                                }`}>
                                {log.xpChange > 0 ? '+' : ''}{log.xpChange} XP
                            </span>
                        )}

                        {/* Timestamp */}
                        <span className="text-[10px] text-zinc-600 shrink-0 w-14 text-right">
                            {timeAgo(log.timestamp)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
