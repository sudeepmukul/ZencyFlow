import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

// Helper to get YYYY-MM-DD in local time
const getLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const MonthViewModal = ({ isOpen, onClose, habit, habitLogs, onToggle }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Get all logged dates for this habit
    const loggedDates = useMemo(() => {
        if (!habit) return new Set();
        const thisHabitLogs = habitLogs.filter(l => l.habitId === habit.id);
        return new Set(thisHabitLogs.map(l => l.date));
    }, [habit, habitLogs]);

    // Calculate days in the current month view
    const calendarData = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        // First day of the month
        const firstDay = new Date(year, month, 1);
        // Last day of the month
        const lastDay = new Date(year, month + 1, 0);

        // Day of week for first day (0 = Sunday, adjust to Monday start)
        const startDayOfWeek = (firstDay.getDay() + 6) % 7;

        const days = [];

        // Add empty cells for days before the first of the month
        for (let i = 0; i < startDayOfWeek; i++) {
            days.push({ date: null, dayNum: null });
        }

        // Add all days of the month
        for (let d = 1; d <= lastDay.getDate(); d++) {
            const date = new Date(year, month, d);
            const dateStr = getLocalDateString(date);
            const isToday = getLocalDateString(new Date()) === dateStr;
            const isFuture = date > new Date();
            days.push({
                date: dateStr,
                dayNum: d,
                isCompleted: loggedDates.has(dateStr),
                isToday,
                isFuture
            });
        }

        return days;
    }, [currentMonth, loggedDates]);

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const handlePrevMonth = () => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const handleDayClick = (dateStr, isFuture) => {
        if (!dateStr || isFuture) return;
        onToggle(habit.id, dateStr);
    };

    if (!isOpen || !habit) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-all duration-300">
            <div
                className="w-full max-w-lg transition-all duration-300 ease-out transform scale-100 opacity-100"
                style={{ animation: 'pulse-ring 0.3s ease-out backwards' }}
            >
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#1A1A1A] p-6 shadow-2xl">
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 text-gray-500 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>

                    {/* Header with habit info */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FBFF00]/10 text-[#FBFF00] text-2xl border border-[#FBFF00]/20">
                            {habit.icon}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{habit.title}</h2>
                            <p className="text-sm text-gray-400">Edit days for this habit</p>
                        </div>
                    </div>

                    {/* Month Navigation */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={handlePrevMonth}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <h3 className="text-lg font-bold text-white">
                            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </h3>
                        <button
                            onClick={handleNextMonth}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Day headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {calendarData.map((day, index) => (
                            <button
                                key={index}
                                onClick={() => handleDayClick(day.date, day.isFuture)}
                                disabled={!day.date || day.isFuture}
                                className={`
                                    aspect-square rounded-xl flex flex-col items-center justify-center 
                                    text-sm font-medium transition-all duration-200
                                    ${!day.date ? 'invisible' : ''}
                                    ${day.isFuture ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                                    ${day.isCompleted
                                        ? 'bg-[#FBFF00] text-black shadow-[0_0_15px_rgba(251,255,0,0.4)] hover:bg-[#e1e600]'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}
                                    ${day.isToday && !day.isCompleted ? 'ring-2 ring-[#FBFF00]/50' : ''}
                                    ${day.isToday ? 'ring-2 ring-[#FBFF00]' : ''}
                                `}
                            >
                                <span className="text-sm">{day.dayNum}</span>
                                {day.isCompleted && (
                                    <span className="text-[10px]">✓</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-[#FBFF00]"></div>
                            <span className="text-xs text-gray-400">Completed</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-white/5 border border-white/10"></div>
                            <span className="text-xs text-gray-400">Not Done</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-white/5 ring-2 ring-[#FBFF00]"></div>
                            <span className="text-xs text-gray-400">Today</span>
                        </div>
                    </div>

                    {/* Tip */}
                    <p className="text-center text-xs text-gray-500 mt-4">
                        Click on any day to toggle completion
                    </p>
                </div>
            </div>
        </div>,
        document.body
    );
};
