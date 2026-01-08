import React, { useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import { useData } from '../../contexts/DataContext';
import { ShareCardModal } from './ShareCardModal';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Button } from '../../components/ui/Button';
import { Trophy, Target, CheckSquare, Moon, Book, Flame, Clock, Plus, Play, Pause, Square, Share2, ChevronLeft, ChevronRight, Calendar, CheckCircle2, Circle } from 'lucide-react';
import { Heatmap } from '../habits/Heatmap';
import { ProductivityGauge } from './ProductivityGauge';
import { RemindersWidget } from './RemindersWidget';
import { XPByCategoryChart } from './XPByCategoryChart';
import { FocusHoursChart } from './FocusHoursChart';
import { QuotesWidget } from './QuotesWidget';
import { ZenciaWidget } from './ZenciaWidget';
import { SleepTrackerWidget } from './SleepTrackerWidget';
import { useNavigate } from 'react-router-dom';
import { BADGE_DEFINITIONS } from '../profile/Badges';
import { QuestModal } from '../calendar/components/QuestModal';
import { CategoryManagerModal } from './CategoryManagerModal';
import { format, addDays, isSameDay, parseISO } from 'date-fns';
import { SEOHead } from '../../components/seo/SEOHead';

export function Dashboard() {
    const { user, levelProgress, nextLevelXP } = useUser();
    const { goals, habits, tasks, sleepLogs, journalEntries, habitLogs, timerLogs, startTimer, reminders, toggleTask, toggleSubtask, categories, addTask, updateTask, deleteTask } = useData();
    const navigate = useNavigate();
    const [isAddingReminder, setIsAddingReminder] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    // Task UI State
    const [isQuestModalOpen, setIsQuestModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [viewDate, setViewDate] = useState(new Date());

    const todayStr = new Date().toISOString().split('T')[0];

    const combinedLogs = React.useMemo(() => {
        const tLogs = (tasks || [])
            .filter(t => t.status === 'completed' && t.completedAt)
            .map(t => ({ date: t.completedAt.split('T')[0], type: 'task' }));
        return [...(habitLogs || []), ...tLogs];
    }, [tasks, habitLogs]);

    const stats = React.useMemo(() => {
        if (!habits || !habits.length) return { avg: 0, best: null, current: null };

        // Avg Habits Consistency (Last 30 days)
        const window = 30;
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - window);
        const cutoffStr = cutoff.toISOString().split('T')[0];

        const relevantLogs = (habitLogs || []).filter(l => l.date >= cutoffStr);
        // Calculate average consistency percentage
        let avg = Math.round((relevantLogs.length / (habits.length * window)) * 100);
        if (avg > 100) avg = 100;

        // Best Habit Streak
        const best = [...habits].sort((a, b) => (b.best || 0) - (a.best || 0))[0];

        // Current Habit Streak
        const current = [...habits].sort((a, b) => (b.streak || 0) - (a.streak || 0))[0];

        return { avg, best, current };
    }, [habits, habitLogs]);

    // --- Calculations ---

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
            try {
                return new Date(t.completedAt).toISOString().split('T')[0] === todayStr;
            } catch (e) { return false; }
        }).length;

        const totalToday = tasks.filter(t => {
            try {
                const created = t.createdAt ? new Date(t.createdAt).toISOString().split('T')[0] === todayStr : false;
                const completed = t.completedAt ? new Date(t.completedAt).toISOString().split('T')[0] === todayStr : false;
                return created || completed;
            } catch (e) { return false; }
        }).length;

        const taskScore = totalToday > 0 ? (completedToday / totalToday) * 40 : 0;
        const activeHabits = habits.length;
        const habitsDoneToday = habitLogs.filter(l => l.date === todayStr).length;
        const habitScore = activeHabits > 0 ? (habitsDoneToday / activeHabits) * 40 : 0;

        // Focus Score Removed as per request

        const sleepLastNight = sleepLogs.find(l => l.date === todayStr)?.hours || 0;
        const sleepScore = Math.min((sleepLastNight / 8) * 20, 20);

        return Math.round(taskScore + habitScore + sleepScore);
    };

    const todayScore = calculateTodayScore();

    const calculateProductivity = (period) => {
        const now = new Date();
        let startDate;

        if (period === 'Daily') {
            startDate = new Date(todayStr);
        } else if (period === 'Weekly') {
            // Start of current week (Sunday)
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            weekStart.setHours(0, 0, 0, 0);
            startDate = weekStart;
        } else {
            // Start of current month
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        // Only consider tasks that were CREATED in this period
        const tasksInPeriod = tasks.filter(t => {
            if (!t.createdAt) return false;
            try {
                return new Date(t.createdAt) >= startDate;
            } catch (e) { return false; }
        });

        // Of those, count completed ones
        const completedInPeriod = tasksInPeriod.filter(t => t.status === 'completed').length;
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

    // Filter Tasks by View Date
    const activeTasks = tasks.filter(t => {
        if (t.status === 'completed') return false;

        // If no due date, show on Today (or maybe backlog? Assuming Today for now unless we add Backlog view)
        // Better: No due date -> Show on Today
        if (!t.dueDate) return isSameDay(viewDate, new Date());

        const taskDate = new Date(t.dueDate);
        // Show if same day
        if (isSameDay(taskDate, viewDate)) return true;

        // If viewing Today, also show Overdue tasks
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

    return (
        <>
            <SEOHead
                title="Dashboard"
                description="Your personal productivity dashboard. Track goals, habits, sleep, and XP progress at a glance."
                path="/"
            />
            <h1 className="absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0">Dashboard</h1>
            <div className="space-y-4"> {/* Increased spacing slightly for better separation */}

                {/* Top Quote Section - Dynamic Quotes Widget */}
                <div className="flex justify-end mb-[-40px] relative z-20 pointer-events-none">
                    <div className="pointer-events-auto">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full h-8 w-8"
                            onClick={() => setIsShareModalOpen(true)}
                            title="Share Progress"
                        >
                            <Share2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
                <QuotesWidget />

                {/* XP & Level Section - NEW Zencia Widget */}
                <ZenciaWidget user={user} todayScore={todayScore} nextLevelXP={nextLevelXP} />

                {/* Quick Actions Bar */}
                <div className="flex flex-wrap gap-2 justify-center md:justify-start bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-800/50">
                    <Button variant="outline" size="sm" className="border-neon-400/50 text-neon-400 hover:bg-neon-400/10 rounded-full px-4 h-8 text-xs" onClick={() => navigate('/habits')}>+ Habit</Button>
                    <Button variant="outline" size="sm" className="border-neon-400/50 text-neon-400 hover:bg-neon-400/10 rounded-full px-4 h-8 text-xs" onClick={() => navigate('/todo')}>Start Timer</Button>
                    <Button variant="outline" size="sm" className="border-neon-400/50 text-neon-400 hover:bg-neon-400/10 rounded-full px-4 h-8 text-xs" onClick={() => navigate('/journal')}>+ Journal</Button>
                    <Button variant="outline" size="sm" className="border-neon-400/50 text-neon-400 hover:bg-neon-400/10 rounded-full px-4 h-8 text-xs" onClick={() => navigate('/sleep')}>+ Sleep</Button>
                    <Button variant="outline" size="sm" className="border-neon-400/50 text-neon-400 hover:bg-neon-400/10 rounded-full px-4 h-8 text-xs" onClick={() => setIsAddingReminder(true)}>+ Reminder</Button>
                </div>

                {/* Mini Badges Display (Unlocked Only) */}
                {user.badges && user.badges.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                        {user.badges.map(badgeId => {
                            const def = BADGE_DEFINITIONS[badgeId];
                            if (!def) return null;
                            const Icon = def.icon;
                            return (
                                <div key={badgeId} className={`flex items-center gap-1.5 px-2 py-1 rounded-full border border-white/5 ${def.bg} shrink-0`} title={def.label + ": " + def.desc}>
                                    <Icon className={`w-3 h-3 ${def.color}`} />
                                    <span className="text-[10px] font-bold text-zinc-300">{def.label}</span>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Main Grid - Revised for Spacing (Target Height ~440px) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

                    {/* Left Col: Quests - Fixed Height 440px */}
                    <div className="md:col-span-4">
                        <Card className="h-[440px] flex flex-col bg-zinc-900/80 border-zinc-800 p-0 overflow-hidden relative">
                            {/* Header with Navigation */}
                            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                                <div className="flex items-center gap-2">
                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-zinc-400 hover:text-white" onClick={() => handleDateNav(-1)}>
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    <span className="text-sm font-bold text-white uppercase tracking-wider w-20 text-center">{getNavLabel()}</span>
                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-zinc-400 hover:text-white" onClick={() => handleDateNav(1)}>
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>

                                <Button
                                    size="xs"
                                    className="bg-[#FBFF00] hover:bg-[#e1e600] text-black border-none h-7 px-3 text-[10px] font-bold flex items-center gap-1"
                                    onClick={() => setIsQuestModalOpen(true)}
                                >
                                    <Plus className="w-3 h-3" /> ADD
                                </Button>
                            </div>

                            <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar p-2">
                                {activeTasks.length === 0 ? (
                                    <div className="text-zinc-500 text-center py-20 flex flex-col items-center gap-2 opacity-50">
                                        <Trophy className="w-8 h-8 mb-2" />
                                        <p className="text-xs">No active quests for {getNavLabel()}.</p>
                                    </div>
                                ) : (
                                    // Render active tasks
                                    activeTasks.map(task => (
                                        <div key={task.id} className="space-y-0">
                                            {/* Main Task Card */}
                                            <div className={`p-3 rounded-xl border flex items-center justify-between group hover:bg-zinc-800/50 transition-all ${getPriorityColor(task.priority)} ${task.subtasks?.length > 0 ? 'rounded-b-none border-b-0' : ''}`}>
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <button onClick={() => toggleTask(task.id)} className="text-zinc-400 hover:text-neon-400 shrink-0 transition-colors">
                                                        <Square className="w-4 h-4" />
                                                    </button>
                                                    <div className="flex flex-col overflow-hidden min-w-0">
                                                        <span className="text-zinc-200 truncate font-medium text-sm leading-tight mb-1">{task.title}</span>
                                                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-semibold opacity-70">
                                                            <span>{task.priority?.slice(0, 1)}</span>
                                                            <span className="text-zinc-600">•</span>
                                                            <span className="text-neon-400">{getTaskXP(task)}XP</span>
                                                            {task.dueDate && task.dueDate.includes('T') && !task.dueDate.endsWith('00:00:00') && (
                                                                <>
                                                                    <span className="text-zinc-600">•</span>
                                                                    <span className="text-blue-400">{format(new Date(task.dueDate), 'HH:mm')}</span>
                                                                </>
                                                            )}
                                                            {task.subtasks && task.subtasks.length > 0 && (
                                                                <>
                                                                    <span className="text-zinc-600">•</span>
                                                                    <span className="text-purple-400">
                                                                        {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-7 w-7 text-zinc-400 hover:text-blue-400 hover:bg-blue-400/10"
                                                        onClick={() => {
                                                            const currentDue = task.dueDate ? new Date(task.dueDate) : new Date();
                                                            const newDue = addDays(currentDue, 1);
                                                            updateTask({ ...task, dueDate: newDue.toISOString() });
                                                        }}
                                                        title="Move to Next Day"
                                                    >
                                                        <Calendar className="w-3.5 h-3.5" />
                                                    </Button>

                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-7 w-7 text-neon-400 hover:bg-neon-400/10"
                                                        onClick={() => startTimer(task.id)}
                                                    >
                                                        <Play className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Subtasks List */}
                                            {task.subtasks && task.subtasks.length > 0 && (
                                                <div className="border border-t-0 border-zinc-800/50 rounded-b-xl bg-zinc-900/30 overflow-hidden">
                                                    {task.subtasks.map((subtask, idx) => (
                                                        <div
                                                            key={subtask.id}
                                                            className={`flex items-center gap-3 px-4 py-2 hover:bg-zinc-800/30 transition-colors ${idx !== task.subtasks.length - 1 ? 'border-b border-zinc-800/30' : ''}`}
                                                        >
                                                            {/* Connecting Line */}
                                                            <div className="w-4 h-full flex items-center justify-center">
                                                                <div className="w-px h-2 bg-zinc-700 -mt-2"></div>
                                                                <div className="w-2 h-px bg-zinc-700"></div>
                                                            </div>

                                                            {/* Subtask Toggle */}
                                                            <button
                                                                onClick={() => toggleSubtask(task.id, subtask.id)}
                                                                className="shrink-0 text-zinc-500 hover:text-[#FBFF00] transition-colors"
                                                            >
                                                                {subtask.completed ? (
                                                                    <CheckCircle2 size={16} className="text-[#FBFF00]" />
                                                                ) : (
                                                                    <Circle size={16} />
                                                                )}
                                                            </button>

                                                            {/* Subtask Title */}
                                                            <span className={`text-xs ${subtask.completed ? 'text-zinc-500 line-through' : 'text-zinc-400'}`}>
                                                                {subtask.title}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Middle Col: Stats & Charts */}
                    <div className="md:col-span-5 flex flex-col gap-4">
                        {/* Top Row: Sleep & XP Breakdown (Height 140px) */}
                        <div className="grid grid-cols-5 gap-4 h-[140px]">
                            <Card className="col-span-2 p-0 border-0 bg-transparent overflow-visible">
                                <SleepTrackerWidget sleepLogs={sleepLogs} />
                            </Card>
                            <Card
                                className="col-span-3 p-2 bg-zinc-900/80 border-zinc-800 relative overflow-hidden flex items-center justify-center cursor-pointer hover:border-[#fbff00]/30 transition-colors group"
                                onClick={() => setIsCategoryModalOpen(true)}
                            >
                                <XPByCategoryChart tasks={tasks} categories={categories} />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <span className="text-xs font-bold text-white bg-black/60 px-3 py-1 rounded-full">Click to Manage</span>
                                </div>
                            </Card>
                        </div>

                        {/* Bottom Row: Focus Hours (Height 284px) - Increased for breathing room */}
                        <Card className="h-[284px] p-3 bg-zinc-900/80 border-zinc-800">
                            <FocusHoursChart timerLogs={timerLogs} />
                        </Card>
                    </div>

                    {/* Right Col: Productivity & Reminders */}
                    <div className="md:col-span-3 flex flex-col gap-4">
                        {/* Top Row: Productivity (Height 140px) */}
                        <Card className="h-[140px] p-3 bg-zinc-900/80 border-zinc-800 flex flex-col justify-center">
                            <h3 className="text-center text-zinc-400 font-bold mb-2 text-[10px] uppercase tracking-wider">Productivity</h3>
                            <div className="flex justify-evenly px-2 items-center">
                                <ProductivityGauge value={calculateProductivity('Weekly')} label="Week" size="sm" />
                                <div className="w-px h-10 bg-zinc-800/50 mx-2"></div>
                                <ProductivityGauge value={calculateProductivity('Monthly')} label="Month" size="sm" />
                            </div>
                        </Card>

                        {/* Bottom Row: Reminders (Height 284px) */}
                        <div className="h-[284px]">
                            <RemindersWidget isAdding={isAddingReminder} setIsAdding={setIsAddingReminder} />
                        </div>
                    </div>
                </div>

                {/* Overall Consistency Heatmap - COMPACT */}
                {habits.length > 0 && (
                    <Card className="p-3 bg-zinc-900/50 border-zinc-800">
                        <div className="flex gap-4">
                            <div className="flex-1 overflow-hidden">
                                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                                    <Flame className="w-4 h-4 text-[#FBFF00]" />
                                    Overall Consistency
                                </h3>
                                <Heatmap logs={combinedLogs} blockSize="w-[13px] h-[13px]" gap="gap-[3px]" showCustomTooltip />
                            </div>

                            {/* Stats Sidebar */}
                            <div className="w-[200px] shrink-0 flex flex-col justify-center gap-3 border-l border-zinc-800 pl-4 py-1">
                                <div>
                                    <div className="text-zinc-500 text-[9px] font-bold uppercase tracking-wider">Avg Habits Consistency</div>
                                    <div className="text-lg font-bold text-white leading-tight">{stats.avg}%</div>
                                </div>

                                <div>
                                    <div className="text-zinc-500 text-[9px] font-bold uppercase tracking-wider">Best Habit Streak</div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-white leading-tight">{stats.best?.best || 0} days</span>
                                        <span className="text-zinc-500 text-[10px] truncate" title={stats.best?.title}>{stats.best?.title || '-'}</span>
                                    </div>
                                </div>

                                <div>
                                    <div className="text-zinc-500 text-[9px] font-bold uppercase tracking-wider">Current Habit Streak</div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-[#FBFF00] leading-tight">{stats.current?.streak || 0} days</span>
                                        <span className="text-zinc-400 text-[10px] truncate" title={stats.current?.title}>{stats.current?.title || '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Bottom Section: Habits & Goals */}
                <div className="grid grid-cols-2 gap-4 h-[200px]">
                    {/* Goals Widget */}
                    <Card className="p-4 overflow-y-auto custom-scrollbar bg-zinc-900/50 border-zinc-800">
                        <div className="flex justify-between items-center mb-4 sticky top-0 bg-transparent z-10">
                            <h3 className="text-sm font-bold text-white">Goals</h3>
                            <span className="text-zinc-500 text-xs font-medium">{goals.length} active</span>
                        </div>
                        <div className="space-y-4">
                            {goals.slice(0, 5).map(goal => (
                                <div key={goal.id} className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-medium text-zinc-300 truncate w-3/4">{goal.title}</span>
                                        <span className="text-xs font-bold text-zinc-500">{goal.progress}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-zinc-800/50 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#FBFF00] rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(251,255,0,0.3)]"
                                            style={{ width: `${goal.progress}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                            {goals.length === 0 && (
                                <div className="text-center py-8 text-zinc-600 text-xs">No active goals</div>
                            )}
                        </div>
                    </Card>

                    {/* Habits Widget */}
                    <Card className="p-4 overflow-y-auto custom-scrollbar bg-zinc-900/50 border-zinc-800">
                        <div className="flex justify-between items-center mb-4 sticky top-0 bg-transparent z-10">
                            <h3 className="text-sm font-bold text-white">Habits</h3>
                            <span className="text-zinc-500 text-xs font-medium">{habits.length} active</span>
                        </div>
                        <div className="space-y-2">
                            {habits.slice(0, 5).map(habit => (
                                <div key={habit.id} className="flex items-center justify-between p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors">
                                    <span className="text-zinc-300 text-xs font-medium truncate">{habit.title}</span>
                                    <div className="flex items-center gap-1.5">
                                        <Flame className={`w-3.5 h-3.5 ${habit.streak > 0 ? 'text-[#FBFF00] fill-[#FBFF00]' : 'text-zinc-600'}`} />
                                        <span className={`font-bold text-xs ${habit.streak > 0 ? 'text-white' : 'text-zinc-600'}`}>{habit.streak}</span>
                                    </div>
                                </div>
                            ))}
                            {habits.length === 0 && (
                                <div className="text-center py-8 text-zinc-600 text-xs">No active habits</div>
                            )}
                        </div>
                    </Card>
                </div>
                {/* Share Card Modal */}
                <ShareCardModal
                    isOpen={isShareModalOpen}
                    onClose={() => setIsShareModalOpen(false)}
                    user={user}
                    productivity={calculateProductivity('Monthly')}
                />
                {/* Add Quest Modal */}
                <QuestModal
                    isOpen={isQuestModalOpen}
                    onClose={() => setIsQuestModalOpen(false)}
                    onSave={async (taskData) => {
                        await addTask(taskData);
                        setIsQuestModalOpen(false);
                    }}
                    selectedDate={viewDate.toISOString()}
                    availableCategories={categories?.map(c => c.name) || []}
                />
                {/* Category Manager Modal */}
                <CategoryManagerModal
                    isOpen={isCategoryModalOpen}
                    onClose={() => setIsCategoryModalOpen(false)}
                    tasks={tasks}
                />
            </div>
        </>
    );
}
