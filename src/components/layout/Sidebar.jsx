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
        <aside className="w-64 h-screen bg-zinc-950 border-r border-zinc-800 flex flex-col overflow-y-auto flex-shrink-0">
            <div className="p-6">
                <h1 className="text-2xl font-bold text-neon-400 tracking-tighter drop-shadow-[0_0_10px_rgba(251,255,0,0.3)]">
                    ZencyFlow
                </h1>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                                isActive
                                    ? "bg-neon-400/10 text-neon-400 shadow-[0_0_15px_rgba(251,255,0,0.1)] border border-neon-400/20"
                                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                            )
                        }
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-6 border-t border-zinc-800">
                <div className="text-xs text-zinc-500 text-center">
                    v1.0.0 • Zency Leveling System
                </div>
            </div>
        </aside>
    );
}
