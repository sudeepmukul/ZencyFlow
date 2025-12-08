import React, { useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import { useData } from '../../contexts/DataContext';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Button } from '../../components/ui/Button';
import { Trophy, Target, CheckSquare, Moon, Book, Flame, Clock, Plus, Play, Pause, Square } from 'lucide-react';
import { Heatmap } from '../habits/Heatmap';
import { ProductivityGauge } from './ProductivityGauge';
import { RemindersWidget } from './RemindersWidget';
import { PeakPerformanceChart } from './PeakPerformanceChart';
import { FocusHoursChart } from './FocusHoursChart';
import { QuotesWidget } from './QuotesWidget';
import { ZenciaWidget } from './ZenciaWidget';
import { SleepTrackerWidget } from './SleepTrackerWidget';
import { useNavigate } from 'react-router-dom';
import { BADGE_DEFINITIONS } from '../profile/Badges';

export function Dashboard() {
    const { user, levelProgress, nextLevelXP } = useUser();
    const { goals, habits, tasks, sleepLogs, journalEntries, habitLogs, timerLogs, startTimer, reminders, toggleTask } = useData();
    const navigate = useNavigate();
    const [isAddingReminder, setIsAddingReminder] = useState(false);

    const today = new Date().toISOString().split('T')[0];

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
                return new Date(t.completedAt).toISOString().split('T')[0] === today;
            } catch (e) { return false; }
        }).length;

        const totalToday = tasks.filter(t => {
            try {
                const created = t.createdAt ? new Date(t.createdAt).toISOString().split('T')[0] === today : false;
                const completed = t.completedAt ? new Date(t.completedAt).toISOString().split('T')[0] === today : false;
                return created || completed;
            } catch (e) { return false; }
        }).length;

        const taskScore = totalToday > 0 ? (completedToday / totalToday) * 30 : 0;
        const activeHabits = habits.length;
        const habitsDoneToday = habitLogs.filter(l => l.date === today).length;
        const habitScore = activeHabits > 0 ? (habitsDoneToday / activeHabits) * 30 : 0;

        const todayLogs = timerLogs.filter(l => l.startTime.startsWith(today));
        const focusSeconds = todayLogs.reduce((acc, log) => acc + (log.productiveDuration || 0), 0);
        const focusScore = Math.min((focusSeconds / (4 * 3600)) * 20, 20);

        const sleepLastNight = sleepLogs.find(l => l.date === today)?.hours || 0;
        const sleepScore = Math.min((sleepLastNight / 8) * 20, 20);

        return Math.round(taskScore + habitScore + focusScore + sleepScore);
    };

    const todayScore = calculateTodayScore();

    const calculateProductivity = (period) => {
        const now = new Date();
        let startDate;

        if (period === 'Daily') {
            startDate = new Date(today);
        } else if (period === 'Weekly') {
            startDate = new Date(now.setDate(now.getDate() - now.getDay()));
            startDate.setHours(0, 0, 0, 0);
        } else {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        const completedInPeriod = tasks.filter(t => t.status === 'completed' && new Date(t.completedAt) >= startDate).length;
        const activeTasksCount = tasks.filter(t => t.status !== 'completed').length;
        const totalWorkload = completedInPeriod + activeTasksCount;

        if (totalWorkload === 0) return 0;

        return Math.min(Math.round((completedInPeriod / totalWorkload) * 100), 100);
    };

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high': return 'text-red-400 border-red-400/50 bg-red-400/10';
            case 'medium': return 'text-orange-400 border-orange-400/50 bg-orange-400/10';
            case 'low': return 'text-green-400 border-green-400/50 bg-green-400/10';
            default: return 'text-zinc-400 border-zinc-700/50 bg-zinc-800/50';
        }
    };

    const activeTasks = tasks.filter(t => t.status !== 'completed');

    return (
        <div className="space-y-4"> {/* Increased spacing slightly for better separation */}

            {/* Top Quote Section - Dynamic Quotes Widget */}
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
                    <Card className="h-[440px] flex flex-col bg-zinc-900/80 border-zinc-800 p-4">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Quests ({activeTasks.length})</h3>
                            <Button size="xs" className="bg-zinc-800 hover:bg-zinc-700 text-neon-400 border border-neon-400/20 h-6 text-[10px] px-2" onClick={() => navigate('/todo')}>
                                NEW
                            </Button>
                        </div>
                        <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-1">
                            {activeTasks.length === 0 ? (
                                <div className="text-zinc-500 text-center py-10 text-xs">No active quests.</div>
                            ) : (
                                activeTasks.map(task => (
                                    <div key={task.id} className={`p-2.5 rounded-lg border flex items-center justify-between group hover:bg-zinc-800/50 transition-all ${getPriorityColor(task.priority)}`}>
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <button onClick={() => toggleTask(task.id)} className="text-zinc-400 hover:text-neon-400 shrink-0">
                                                <Square className="w-4 h-4" />
                                            </button>
                                            <div className="flex flex-col overflow-hidden min-w-0">
                                                <span className="text-zinc-200 truncate font-medium text-sm leading-tight mb-1">{task.title}</span>
                                                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-semibold opacity-70">
                                                    <span>{task.priority?.slice(0, 1)}</span>
                                                    <span className="text-zinc-600">•</span>
                                                    <span className="text-neon-400">{getTaskXP(task)}XP</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 text-neon-400 hover:bg-neon-400/10 shrink-0"
                                            onClick={() => startTimer(task.id)}
                                        >
                                            <Play className="w-3 h-3" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>

                {/* Middle Col: Stats & Charts */}
                <div className="md:col-span-4 flex flex-col gap-4">
                    {/* Top Row: Sleep & Peak (Height 140px) */}
                    <div className="grid grid-cols-2 gap-4 h-[140px]">
                        <Card className="col-span-1 p-0 border-0 bg-transparent overflow-visible">
                            <SleepTrackerWidget sleepLogs={sleepLogs} />
                        </Card>
                        <Card className="col-span-1 p-2 bg-zinc-900/80 border-zinc-800 relative overflow-hidden flex items-center justify-center">
                            <PeakPerformanceChart tasks={tasks} />
                        </Card>
                    </div>

                    {/* Bottom Row: Focus Hours (Height 284px) - Increased for breathing room */}
                    <Card className="h-[284px] p-3 bg-zinc-900/80 border-zinc-800">
                        <FocusHoursChart timerLogs={timerLogs} />
                    </Card>
                </div>

                {/* Right Col: Productivity & Reminders */}
                <div className="md:col-span-4 flex flex-col gap-4">
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

            {/* Overall Consistency Heatmap - RESTORED */}
            {habits.length > 0 && (
                <Card className="p-4">
                    <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                        <Flame className="w-5 h-5 text-orange-500" />
                        Overall Consistency
                    </h3>
                    <Heatmap logs={habitLogs} />
                </Card>
            )}

            {/* Bottom Section: Habits & Goals */}
            <div className="grid grid-cols-2 gap-4 h-[200px]">
                <Card className="p-4 overflow-y-auto custom-scrollbar">
                    <h3 className="text-sm font-bold text-white mb-3 sticky top-0 bg-zinc-900/90 py-1 z-10 flex justify-between">
                        <span>Goals</span>
                        <span className="text-zinc-500 font-normal">{goals.length} active</span>
                    </h3>
                    <div className="space-y-3">
                        {goals.slice(0, 5).map(goal => (
                            <div key={goal.id}>
                                <div className="flex justify-between mb-1">
                                    <span className="text-xs text-zinc-300 truncate w-3/4">{goal.title}</span>
                                    <span className="text-xs text-zinc-500">{goal.progress}%</span>
                                </div>
                                <ProgressBar value={goal.progress} className="h-1.5" />
                            </div>
                        ))}
                    </div>
                </Card>
                <Card className="p-4 overflow-y-auto custom-scrollbar">
                    <h3 className="text-sm font-bold text-white mb-3 sticky top-0 bg-zinc-900/90 py-1 z-10 flex justify-between">
                        <span>Habits</span>
                        <span className="text-zinc-500 font-normal">{habits.length} active</span>
                    </h3>
                    <div className="space-y-2">
                        {habits.slice(0, 5).map(habit => (
                            <div key={habit.id} className="flex items-center justify-between p-2 bg-zinc-900/50 rounded-lg border border-zinc-800">
                                <span className="text-zinc-300 text-xs truncate">{habit.title}</span>
                                <div className="flex items-center gap-1">
                                    <span className="text-neon-400 font-bold text-xs">🔥{habit.streak}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}
