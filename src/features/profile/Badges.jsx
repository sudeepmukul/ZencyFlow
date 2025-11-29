import React from 'react';
import { Card } from '../../components/ui/Card';
import { Award, Zap, Star, Target, Shield } from 'lucide-react';

const BADGE_DEFINITIONS = {
    'first_task': { icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-400/10', label: 'First Steps', desc: 'Complete your first task' },
    'level_5': { icon: Zap, color: 'text-neon-400', bg: 'bg-neon-400/10', label: 'Level 5', desc: 'Reach Level 5' },
    'streak_7': { icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'On Fire', desc: '7-day habit streak' },
    'task_master': { icon: Target, color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'Task Master', desc: 'Complete 50 tasks' },
    'survivor': { icon: Shield, color: 'text-green-400', bg: 'bg-green-400/10', label: 'Survivor', desc: 'Use a Streak Freeze' },
};

import { Flame } from 'lucide-react';

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
