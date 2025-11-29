import React from 'react';
import { useUser } from '../../contexts/UserContext';
import { useData } from '../../contexts/DataContext';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Trophy, Target, CheckSquare, Moon, Book, Flame, Clock } from 'lucide-react';
import { Heatmap } from '../habits/Heatmap';

export function Dashboard() {
    const { user, levelProgress, nextLevelXP } = useUser();
    const { goals, habits, tasks, sleepLogs, journalEntries, habitLogs, timerLogs, activeTimer, timerSettings } = useData();
    const [, forceUpdate] = React.useState(0);

    // Force re-render every second to update timer display
    React.useEffect(() => {
        if (activeTimer && !activeTimer.isPaused) {
            const interval = setInterval(() => forceUpdate(n => n + 1), 1000);
            return () => clearInterval(interval);
        }
    }, [activeTimer]);

    const completedGoals = goals.filter(g => g.completed).length;
    const activeHabits = habits.length;
    const today = new Date().toISOString().split('T')[0];
    const sleepLastNight = sleepLogs.find(l => l.date === today)?.hours || 0;
    const journalCount = journalEntries.length;

    return (
        <div className="space-y-8">
            {/* Header & XP Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Welcome back, <span className="text-neon-400">{user.name.split(' ')[0]}</span></h1>
                    <p className="text-zinc-400 mt-1">Ivala Chimpedam lesgooo.</p>
                </div>

                <Card className="w-96 border-neon-400/20 bg-neon-400/5">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-neon-400" />
                            <span className="font-bold text-neon-400">Level {user.level}</span>
                        </div>
                        <span className="text-xs text-zinc-400">{Math.floor(user.xp)} / {Math.floor(nextLevelXP)} XP</span>
                    </div>
                    <ProgressBar value={levelProgress} className="h-3 bg-zinc-900/50" />
                    <div className="mt-2 text-xs text-zinc-500 text-right">
                        {Math.floor(nextLevelXP - user.xp)} XP to next level
                    </div>
                </Card>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                        <CheckSquare className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">
                            {tasks.filter(t => {
                                if (t.status !== 'completed' || !t.completedAt) return false;
                                const completedDate = new Date(t.completedAt).toISOString().split('T')[0];
                                return completedDate === today;
                            }).length}
                        </div>
                        <div className="text-sm text-zinc-400">Tasks Done Today</div>
                    </div>
                </Card>

                <Card className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
                        <Target className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{Math.round((tasks.filter(t => t.status === 'completed').length / (tasks.length || 1)) * 100)}%</div>
                        <div className="text-sm text-zinc-400">Productivity</div>
                    </div>
                </Card>

                <Card className="flex items-center gap-4">
                    <div className="p-3 bg-green-500/10 rounded-xl text-green-400">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">
                            {(() => {
                                const todayLogs = timerLogs.filter(l => l.startTime.startsWith(today));
                                let totalSeconds = todayLogs.reduce((acc, log) => acc + (log.productiveDuration || 0), 0);

                                // Add active session if started today (using local date check for safety)
                                if (activeTimer) {
                                    const activeDate = new Date(activeTimer.startTime).toLocaleDateString();
                                    const currentDate = new Date().toLocaleDateString();

                                    if (activeDate === currentDate) {
                                        const efficiency = timerSettings?.efficiency || 0.6;
                                        totalSeconds += Math.round(activeTimer.duration * efficiency);
                                    }
                                }

                                const hours = Math.floor(totalSeconds / 3600);
                                const minutes = Math.floor((totalSeconds % 3600) / 60);
                                return `${hours}h ${minutes}m`;
                            })()}
                        </div>
                        <div className="text-sm text-zinc-400">Productive Time</div>
                    </div>
                </Card>

                <Card className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                        <Moon className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{sleepLastNight}h</div>
                        <div className="text-sm text-zinc-400">Sleep Last Night</div>
                    </div>
                </Card>

                <Card className="flex items-center gap-4">
                    <div className="p-3 bg-pink-500/10 rounded-xl text-pink-400">
                        <Flame className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{habits.filter(h => h.streak > 0).length}</div>
                        <div className="text-sm text-zinc-400">Active Streaks</div>
                    </div>
                </Card>
            </div>

            {/* Quote Section */}
            <div className="text-center py-8">
                <blockquote className="text-xl font-bold italic" style={{ color: '#fbff00' }}>
                    "Everything around you that you call life was made up by people that were no smarter than you."
                </blockquote>
                <cite className="block mt-2 text-sm font-bold text-zinc-500">- Steve Jobs</cite>
            </div>

            {/* Overall Consistency Heatmap */}
            {habits.length > 0 && (
                <Card>
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Flame className="w-5 h-5 text-orange-500" />
                        Overall Consistency
                    </h3>
                    <Heatmap logs={habitLogs} />
                </Card>
            )}

            {/* Goals & Habits */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="min-h-[300px]">
                    <h3 className="text-xl font-bold text-white mb-4">Goals Progress</h3>
                    {goals.length === 0 ? (
                        <div className="text-zinc-500 text-center py-10">No goals set yet.</div>
                    ) : (
                        <div className="space-y-4">
                            {goals.slice(0, 5).map(goal => (
                                <div key={goal.id}>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm text-zinc-300">{goal.title}</span>
                                        <span className="text-sm text-zinc-500">{goal.progress}%</span>
                                    </div>
                                    <ProgressBar value={goal.progress} className="h-2" />
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                <Card className="min-h-[300px]">
                    <h3 className="text-xl font-bold text-white mb-4">Top Habits</h3>
                    {habits.length === 0 ? (
                        <div className="text-zinc-500 text-center py-10">No habits tracked yet.</div>
                    ) : (
                        <div className="space-y-4">
                            {habits.slice(0, 5).map(habit => (
                                <div key={habit.id} className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
                                    <span className="text-zinc-300">{habit.title}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-neon-400 font-bold">🔥 {habit.streak}</span>
                                        <span className="text-xs text-zinc-500">streak</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
