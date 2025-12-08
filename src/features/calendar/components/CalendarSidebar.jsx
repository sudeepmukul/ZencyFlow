import React from 'react';
import { format } from 'date-fns';

// --- COMPONENT: CalendarSidebar ---
// Handles category toggling.
// --- COMPONENT: CalendarSidebar ---
// Handles category toggling.
export const CalendarSidebar = ({
    currentMonth,
    onPrevMonth,
    onNextMonth,
    filters,
    onToggleFilter,
    availableCategories,
    categoryColors
}) => {

    const categories = Array.isArray(availableCategories) ? availableCategories : [];

    return (
        <div className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full flex-shrink-0">
            {/* Mini Calendar Nav */}
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <h2 className="text-lg font-bold text-zinc-100">
                    {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <div className="flex gap-1">
                    <button onClick={onPrevMonth} className="w-8 h-8 flex items-center justify-center hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors">
                        &lt;
                    </button>
                    <button onClick={onNextMonth} className="w-8 h-8 flex items-center justify-center hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors">
                        &gt;
                    </button>
                </div>
            </div>

            {/* Layer Filters */}
            <div className="p-4 flex-1 overflow-y-auto">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Layers</h3>

                <div className="space-y-1">
                    {/* 1. Reminders Toggle */}
                    <div
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/50 cursor-pointer transition-colors group"
                        onClick={() => onToggleFilter('Reminders')}
                    >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${filters['Reminders'] ? 'bg-[#fbff00] border-[#fbff00]' : 'border-zinc-600 group-hover:border-zinc-500'}`}>
                            {filters['Reminders'] && <span className="text-black text-[10px] font-bold">✓</span>}
                        </div>
                        <span className="text-sm text-zinc-300 group-hover:text-white">Reminders</span>
                    </div>

                    {/* 2. Quest Categories */}
                    {categories.map(cat => (
                        <div
                            key={cat}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/50 cursor-pointer transition-colors group"
                            onClick={() => onToggleFilter(cat)}
                        >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${filters[cat] ? 'bg-zinc-700 border-zinc-500' : 'border-zinc-600 group-hover:border-zinc-500'}`}>
                                {filters[cat] && <span className="text-white text-[10px]">✓</span>}
                            </div>
                            <span className="text-sm text-zinc-300 group-hover:text-white">{cat}</span>
                            {/* Color Dot */}
                            <div className={`ml-auto w-2 h-2 rounded-full`} style={{ backgroundColor: categoryColors[cat] || '#71717a' }} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
