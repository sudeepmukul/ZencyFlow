import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Target, CheckSquare, ListTodo, Moon, Book, Calendar, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/goals', icon: Target, label: 'Goals' },
    { to: '/habits', icon: CheckSquare, label: 'Habits' },
    { to: '/todo', icon: ListTodo, label: 'To-Do' },
    { to: '/sleep', icon: Moon, label: 'Sleep' },
    { to: '/journal', icon: Book, label: 'Journal' },
    { to: '/calendar', icon: Calendar, label: 'Calendar' },
    { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
    return (
        <aside className="w-64 h-screen flex flex-col overflow-y-auto flex-shrink-0 bg-transparent relative z-20">
            <div className="p-8">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-400 to-neon-600 flex items-center justify-center shadow-[0_0_15px_rgba(251,255,0,0.3)]">
                        <LayoutDashboard className="w-5 h-5 text-black" />
                    </div>
                    <h1 className="text-xl font-bold text-white tracking-tight drop-shadow-md">
                        ZencyFlow
                    </h1>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group border border-transparent",
                                isActive
                                    ? "bg-white/10 text-white shadow-[0_0_15px_rgba(251,255,0,0.1)] border-white/10 backdrop-blur-md"
                                    : "text-zinc-400 hover:text-white hover:bg-white/5 hover:border-white/5"
                            )
                        }
                    >
                        <item.icon className={({ isActive }) => cn("w-5 h-5 transition-colors", isActive ? "text-neon-400" : "group-hover:text-neon-400")} />
                        <span className="font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-6">
                <div className="glass-card p-4 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-neon-400 to-purple-500 p-[1px]">
                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                            <span className="font-bold text-xs text-neon-400">ZF</span>
                        </div>
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-semibold text-white truncate">Zency User</p>
                        <p className="text-xs text-zinc-400 truncate">Level 1 • Novice</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
