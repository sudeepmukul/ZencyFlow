import React, { useState, useMemo } from 'react';
import { useUser } from '../../contexts/UserContext';
import { useData } from '../../contexts/DataContext';
import { format, addDays, isSameDay } from 'date-fns';
import { BADGE_DEFINITIONS } from '../profile/Badges';

export function useDashboardLogic() {
    const { user, levelProgress, nextLevelXP } = useUser();
    const { goals, habits, tasks, sleepLogs, journalEntries, habitLogs, timerLogs, startTimer, reminders, toggleTask, toggleSubtask, categories, addTask, updateTask, deleteTask, rewardHistory, activityLogs, skipTask } = useData();

    // UI State
    const [isAddingReminder, setIsAddingReminder] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isQuestModalOpen, setIsQuestModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [viewDate, setViewDate] = useState(new Date());

    const todayStr = new Date().toISOString().split('T')[0];

    const combinedLogs = useMemo(() => {
        const tLogs = (tasks || [])
            .filter(t => t.status === 'completed' && t.completedAt)
            .map(t => ({ date: t.completedAt.split('T')[0], type: 'task' }));
        return [...(habitLogs || []), ...tLogs];
    }, [tasks, habitLogs]);

    const stats = useMemo(() => {
        if (!habits || !habits.length) return { avg: 0, best: null, current: null };

        // Avg Habits Consistency (Last 30 days)
        const window = 30;
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - window);
        const cutoffStr = cutoff.toISOString().split('T')[0];

        const relevantLogs = (habitLogs || []).filter(l => l.date >= cutoffStr);
        let avg = Math.round((relevantLogs.length / (habits.length * window)) * 100);
        if (avg > 100) avg = 100;

        const best = [...habits].sort((a, b) => (b.best || 0) - (a.best || 0))[0];
        const current = [...habits].sort((a, b) => (b.streak || 0) - (a.streak || 0))[0];

        return { avg, best, current };
    }, [habits, habitLogs]);

    // Calculations
    const getTaskXP = (task) => {
        if (task.xpValue) return task.xpValue;
        if (task.xp) return task.xp;
        switch (task.priority?.toLowerCase()) {
            case 'high': return 50;
            case 'medium': return 30;
            case 'low': return 15;
            default: return 10;
        }
    };

    const calculateTodayScore = () => {
        const completedToday = tasks.filter(t => {
            if (t.status !== 'completed' || !t.completedAt) return false;
            try { return new Date(t.completedAt).toISOString().split('T')[0] === todayStr; } catch (e) { return false; }
        }).length;

        const totalToday = tasks.filter(t => {
            try {
                const created = t.createdAt ? new Date(t.createdAt).toISOString().split('T')[0] === todayStr : false;
                const completed = t.completedAt ? new Date(t.completedAt).toISOString().split('T')[0] === todayStr : false;
                return created || completed;
            } catch (e) { return false; }
        }).length;

        const taskScore = totalToday > 0 ? Math.min((completedToday / totalToday) * 40, 40) : 0;

        const activeHabits = habits.length;
        const activeHabitIds = new Set(habits.map(h => h.id));
        const habitsDoneToday = habitLogs.filter(l => l.date === todayStr && activeHabitIds.has(l.habitId)).length;

        // Cap habit score at 40
        const rawHabitScore = activeHabits > 0 ? (habitsDoneToday / activeHabits) * 40 : 0;
        const habitScore = Math.min(rawHabitScore, 40);

        const sleepLastNight = sleepLogs.find(l => l.date === todayStr)?.hours || 0;
        const sleepScore = Math.min((sleepLastNight / 8) * 20, 20);

        // Cap total score at 100
        return Math.min(Math.round(taskScore + habitScore + sleepScore), 100);
    };

    const todayScore = calculateTodayScore();

    const calculateProductivity = (period) => {
        const now = new Date();
        let startDate;
        let endDate;

        if (period === 'Daily') {
            startDate = new Date(todayStr);
            endDate = new Date(todayStr);
            endDate.setHours(23, 59, 59, 999);
        } else if (period === 'Weekly') {
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            weekStart.setHours(0, 0, 0, 0);
            startDate = weekStart;
            endDate = new Date(weekStart);
            endDate.setDate(weekStart.getDate() + 6);
            endDate.setHours(23, 59, 59, 999);
        } else {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        }

        // Helper to check if a date string falls within the range
        const isDateInRange = (dateStr) => {
            if (!dateStr) return false;
            try {
                const d = new Date(dateStr);
                return d >= startDate && d <= endDate;
            } catch (e) { return false; }
        };

        // Tasks relevant to this period:
        // 1. Due in this period
        // 2. Completed in this period (even if due date is diff/missing)
        const tasksInPeriod = tasks.filter(t => {
            const isDueInRange = isDateInRange(t.dueDate);
            const isCompletedInRange = t.status === 'completed' && isDateInRange(t.completedAt);
            return isDueInRange || isCompletedInRange;
        });

        // Completed count: strictly those completed IN this period
        const completedInPeriod = tasksInPeriod.filter(t =>
            t.status === 'completed' && isDateInRange(t.completedAt)
        ).length;

        const totalInPeriod = tasksInPeriod.length;

        if (totalInPeriod === 0) return 0;
        return Math.min(Math.round((completedInPeriod / totalInPeriod) * 100), 100);
    };

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high': return 'text-red-400 border-red-400/50 bg-red-400/10';
            case 'medium': return 'text-orange-400 border-orange-400/50 bg-orange-400/10';
            case 'low': return 'text-green-400 border-green-400/50 bg-green-400/10';
            default: return 'text-zinc-400 border-zinc-700/50 bg-zinc-800/50';
        }
    };

    const activeTasks = tasks.filter(t => {
        if (t.status === 'completed') return false;
        if (!t.dueDate) return isSameDay(viewDate, new Date());
        const taskDate = new Date(t.dueDate);
        if (isSameDay(taskDate, viewDate)) return true;
        if (isSameDay(viewDate, new Date()) && taskDate < new Date().setHours(0, 0, 0, 0)) return true;
        return false;
    });

    const handleDateNav = (direction) => {
        const newDate = new Date(viewDate);
        newDate.setDate(viewDate.getDate() + direction);
        setViewDate(newDate);
    };

    const getNavLabel = () => {
        if (isSameDay(viewDate, new Date())) return 'Today';
        if (isSameDay(viewDate, addDays(new Date(), 1))) return 'Tomorrow';
        if (isSameDay(viewDate, addDays(new Date(), -1))) return 'Yesterday';
        return format(viewDate, 'MMM d');
    };

    return {
        user, levelProgress, nextLevelXP,
        goals, habits, tasks, sleepLogs, journalEntries, habitLogs, timerLogs,
        reminders, categories, rewardHistory, activityLogs,
        startTimer, toggleTask, toggleSubtask, addTask, updateTask, deleteTask, skipTask,

        isAddingReminder, setIsAddingReminder,
        isShareModalOpen, setIsShareModalOpen,
        isQuestModalOpen, setIsQuestModalOpen,
        isBulkModalOpen, setIsBulkModalOpen,
        isCategoryModalOpen, setIsCategoryModalOpen,
        viewDate, setViewDate,

        combinedLogs, stats, todayScore, activeTasks,

        getTaskXP, calculateProductivity, getPriorityColor, handleDateNav, getNavLabel,

        BADGE_DEFINITIONS // exporting constant too if needed by components
    };
}
