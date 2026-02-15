import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Trophy, Flame, Play, Square, Calendar, Plus, ChevronRight, SkipForward } from 'lucide-react';
import { ZenciaWidget } from './ZenciaWidget';
import { QuotesWidget } from './QuotesWidget';
import { useNavigate } from 'react-router-dom';
import { useDashboardLogic } from './useDashboardLogic';
import { format } from 'date-fns';
import { BADGE_DEFINITIONS } from '../profile/Badges';
import { QuestModal } from '../calendar/components/QuestModal';
import { ActivityLogPanel } from '../dashboard/ActivityLogPanel';

export function MobileDashboard() {
    const navigate = useNavigate();

    // Deconstruct from hook
    const {
        user, levelProgress, nextLevelXP,
        goals, habits, tasks,
        reminders, categories, activityLogs,
        startTimer, toggleTask, addTask, updateTask, skipTask,

        isAddingReminder, setIsAddingReminder,
        isQuestModalOpen, setIsQuestModalOpen,
        viewDate,

        todayScore, activeTasks,

        getTaskXP, getPriorityColor, getNavLabel
    } = useDashboardLogic();

    return (
        <div className="space-y-6 pb-20">
            {/* Header / Greeting */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Hello, {user?.displayName?.split(' ')[0] || 'Flow'}</h1>
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-neon-400 to-purple-500 p-[1px]">
                    <div className="w-full h-full rounded-full bg-black overflow-hidden">
                        {user?.photoURL ? <img src={user.photoURL} alt="profile" /> : <div className="w-full h-full bg-zinc-800" />}
                    </div>
                </div>
            </div>

            {/* Quote Widget - Compact */}
            <div className="text-xs">
                <QuotesWidget />
            </div>

            {/* Level / XP Progress */}
            <ZenciaWidget user={user} todayScore={todayScore} nextLevelXP={nextLevelXP} />

            {/* Quick Actions - Scrollable */}
            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar snap-x">
                <Button variant="outline" size="sm" className="snap-start shrink-0 border-neon-400/30 text-neon-400 hover:bg-neon-400/10 rounded-full text-xs" onClick={() => navigate('/habits')}>+ Habit</Button>
                <Button variant="outline" size="sm" className="snap-start shrink-0 border-neon-400/30 text-neon-400 hover:bg-neon-400/10 rounded-full text-xs" onClick={() => navigate('/todo')}>Start Timer</Button>
                <Button variant="outline" size="sm" className="snap-start shrink-0 border-neon-400/30 text-neon-400 hover:bg-neon-400/10 rounded-full text-xs" onClick={() => navigate('/journal')}>+ Journal</Button>
                <Button variant="outline" size="sm" className="snap-start shrink-0 border-neon-400/30 text-neon-400 hover:bg-neon-400/10 rounded-full text-xs" onClick={() => navigate('/sleep')}>+ Sleep</Button>
                <Button variant="outline" size="sm" className="snap-start shrink-0 border-neon-400/30 text-neon-400 hover:bg-neon-400/10 rounded-full text-xs" onClick={() => setIsAddingReminder(true)}>+ Reminder</Button>
            </div>

            {/* Badges - Scrollable */}
            {user.badges && user.badges.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {user.badges.map(badgeId => {
                        const def = BADGE_DEFINITIONS[badgeId];
                        if (!def) return null;
                        const Icon = def.icon;
                        return (
                            <div key={badgeId} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/5 ${def.bg} shrink-0`}>
                                <Icon className={`w-3.5 h-3.5 ${def.color}`} />
                                <span className="text-xs font-bold text-zinc-300">{def.label}</span>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Today's Focus (Quests) */}
            <section className="space-y-3">
                <div className="flex justify-between items-center px-1">
                    <h2 className="text-lg font-bold text-white">Today's Focus</h2>
                    <Button
                        size="xs"
                        className="bg-[#FBFF00] hover:bg-[#e1e600] text-black border-none h-7 px-3 text-[10px] font-bold flex items-center gap-1 rounded-full"
                        onClick={() => setIsQuestModalOpen(true)}
                    >
                        <Plus className="w-3 h-3" /> ADD
                    </Button>
                </div>

                <div className="space-y-3">
                    {activeTasks.length === 0 ? (
                        <Card className="p-6 bg-zinc-900/40 border-zinc-800/50 flex flex-col items-center justify-center text-zinc-500 gap-2">
                            <Trophy className="w-8 h-8 mb-1 opacity-50" />
                            <p className="text-sm">All caught up for today!</p>
                            <Button variant="ghost" size="sm" className="text-neon-400" onClick={() => setIsQuestModalOpen(true)}>Add a Quest</Button>
                        </Card>
                    ) : (
                        activeTasks.map(task => (
                            <Card key={task.id} className={`p-4 bg-zinc-900/80 border-l-4 ${getPriorityColor(task.priority).replace('bg-', 'border-l-')} border-zinc-800`}>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex gap-3 flex-1 min-w-0">
                                        <button onClick={() => toggleTask(task.id)} className="mt-0.5 text-zinc-400 hover:text-neon-400 shrink-0">
                                            <Square className="w-5 h-5" />
                                        </button>
                                        <div className="min-w-0">
                                            <h3 className="text-sm font-medium text-zinc-100 truncate pr-2">{task.title}</h3>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                                                <span className="text-neon-400 font-bold">{getTaskXP(task)} XP</span>
                                                {task.dueDate && (
                                                    <span className="flex items-center gap-1">
                                                        <span className="w-1 h-1 bg-zinc-600 rounded-full" />
                                                        {format(new Date(task.dueDate), 'HH:mm')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-1 shrink-0">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-red-400 bg-red-400/5 rounded-full"
                                            onClick={() => skipTask(task.id)}
                                        >
                                            <SkipForward className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-neon-400 bg-neon-400/5 rounded-full"
                                            onClick={() => startTimer(task.id)}
                                        >
                                            <Play className="w-4 h-4 fill-current" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </section>

            {/* Habits Snapshot */}
            <section className="space-y-3">
                <div className="flex justify-between items-center px-1">
                    <h2 className="text-lg font-bold text-white">Habits</h2>
                    <Button variant="ghost" size="sm" className="text-zinc-500 text-xs" onClick={() => navigate('/habits')}>View All <ChevronRight className="w-3 h-3 ml-1" /></Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {/* Show top 4 habits max */}
                    {habits.slice(0, 4).map(habit => (
                        <Card key={habit.id} className="p-3 bg-zinc-900/50 border-zinc-800 flex flex-col justify-between h-24 relative overflow-hidden group">
                            <div className="flex justify-between items-start z-10">
                                <span className="text-sm font-medium text-zinc-300 line-clamp-2">{habit.title}</span>
                            </div>
                            <div className="flex items-center gap-1.5 z-10 mt-auto">
                                <Flame className={`w-4 h-4 ${habit.streak > 0 ? 'text-[#FBFF00] fill-[#FBFF00]' : 'text-zinc-600'}`} />
                                <span className="font-bold text-sm text-white">{habit.streak}</span>
                            </div>
                            {/* Background progress or visual flair */}
                            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-br from-neon-500/10 to-transparent rounded-full blur-xl group-hover:bg-neon-500/20 transition-all"></div>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Activity Log */}
            <section>
                <ActivityLogPanel logs={activityLogs} compact />
            </section>

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
        </div>
    );
}
