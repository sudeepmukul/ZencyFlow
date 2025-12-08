import React from 'react';
import { Award, Zap, Star, Target, Shield, Sun, Moon, Calendar, CheckCircle, Crown, Swords, Sunrise, Flame } from 'lucide-react';

export const BADGE_DEFINITIONS = {
    'first_task': { icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-400/10', label: 'First Steps', desc: 'Complete your first task' },
    'veteran': { icon: Award, color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'Veteran', desc: 'Complete 25 tasks' },
    'elite': { icon: Target, color: 'text-purple-400', bg: 'bg-purple-400/10', label: 'Elite', desc: 'Complete 50 tasks' },
    'grandmaster': { icon: Crown, color: 'text-orange-400', bg: 'bg-orange-400/10', label: 'Grandmaster', desc: 'Complete 100 tasks' },
    'legend': { icon: Crown, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Legend', desc: 'Complete 150 tasks' },

    'clean_slate': { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10', label: 'Clean Slate', desc: 'Clear daily to-do list' },
    'planner': { icon: Calendar, color: 'text-cyan-400', bg: 'bg-cyan-400/10', label: 'Planner', desc: 'Schedule a future task' },
    'prioritizer': { icon: Star, color: 'text-pink-400', bg: 'bg-pink-400/10', label: 'Prioritizer', desc: 'Use High Priority' },

    'weekend_warrior': { icon: Swords, color: 'text-indigo-400', bg: 'bg-indigo-400/10', label: 'Weekend Warrior', desc: '10 weekend tasks' },
    'early_bird': { icon: Sunrise, color: 'text-yellow-300', bg: 'bg-yellow-300/10', label: 'Early Bird', desc: 'Task before 7 AM' },
    'night_owl': { icon: Moon, color: 'text-slate-400', bg: 'bg-slate-400/10', label: 'Night Owl', desc: 'Task after 10 PM' },
    'eat_the_frog': { icon: Zap, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Eat the Frog', desc: 'High priority first' },

    'level_5': { icon: Zap, color: 'text-neon-400', bg: 'bg-neon-400/10', label: 'Level 5', desc: 'Reach Level 5' },
    'streak_7': { icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'On Fire', desc: '7-day habit streak' },
    'survivor': { icon: Shield, color: 'text-green-400', bg: 'bg-green-400/10', label: 'Survivor', desc: 'Use a Streak Freeze' },
};

export function Badges({ userBadges = [] }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(BADGE_DEFINITIONS).map(([id, def]) => {
                const isUnlocked = userBadges.includes(id);
                const Icon = def.icon;

                return (
                    <div
                        key={id}
                        className={`p-4 rounded-xl border flex flex-col items-center text-center gap-2 transition-all ${isUnlocked
                            ? `${def.bg} border-${def.color.split('-')[1]}-500/30`
                            : 'bg-zinc-900/50 border-zinc-800 opacity-50 grayscale'
                            }`}
                    >
                        <div className={`p-2 rounded-full ${isUnlocked ? 'bg-black/20' : 'bg-zinc-800'}`}>
                            <Icon className={`w-6 h-6 ${isUnlocked ? def.color : 'text-zinc-500'}`} />
                        </div>
                        <div>
                            <div className={`font-bold text-sm ${isUnlocked ? 'text-white' : 'text-zinc-500'}`}>{def.label}</div>
                            <div className="text-[10px] text-zinc-500">{def.desc}</div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
