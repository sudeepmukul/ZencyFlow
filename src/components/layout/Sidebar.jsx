import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Target, CheckSquare, ListTodo, Moon, Book, Calendar, Settings, PanelLeftClose, Gift } from 'lucide-react';
import { cn } from '../../lib/utils';
import AnimatedLogo from '../common/AnimatedLogo';
import { useUser } from '../../contexts/UserContext';

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/goals', icon: Target, label: 'Goals' },
    { to: '/habits', icon: CheckSquare, label: 'Habits' },
    { to: '/todo', icon: ListTodo, label: 'Quests' },
    { to: '/sleep', icon: Moon, label: 'Sleep' },
    { to: '/journal', icon: Book, label: 'Journal' },
    { to: '/calendar', icon: Calendar, label: 'Calendar' },
    { to: '/rewards', icon: Gift, label: 'Rewards' },
    { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar({ isOpen, onToggle }) {
    const { user } = useUser(); // Access dynamic user data

    return (
        <aside className={cn(
            "h-screen flex flex-col overflow-y-auto flex-shrink-0 bg-transparent relative z-20 transition-all duration-300 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
            isOpen ? "w-64" : "w-20 items-center"
        )}>
            <div className={cn("relative flex-shrink-0 group", isOpen ? "p-6 pb-2 w-full" : "p-4 w-full flex justify-center")}>
                <button
                    onClick={onToggle}
                    className={cn(
                        "absolute z-50 p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 transition-colors",
                        isOpen ? "top-4 right-4 opacity-0 group-hover:opacity-100" : "top-2 opacity-0 group-hover:opacity-100"
                    )}
                    title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
                >
                    {isOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5 rotate-180" />}
                </button>

                {/* Logo Area */}
                <div className={cn(
                    "relative flex items-center justify-center transition-all duration-300",
                    isOpen ? "w-full h-24" : "w-10 h-10 mt-4"
                )}>
                    {isOpen ? (
                        <AnimatedLogo />
                    ) : (
                        /* Mini Logo */
                        <div
                            className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-400 to-neon-600 flex items-center justify-center shadow-[0_0_15px_rgba(251,255,0,0.3)] cursor-pointer hover:scale-105 transition-transform"
                            onClick={onToggle}
                        >
                            <span className="font-bold text-black text-xl">Z</span>
                        </div>
                    )}
                </div>
            </div>

            <nav className={cn("flex-1 space-y-2 mt-4", isOpen ? "px-4" : "px-2 w-full flex flex-col items-center")}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        title={!isOpen ? item.label : undefined}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center rounded-xl transition-all duration-300 group border border-transparent hover:bg-white/5 hover:border-white/5",
                                isOpen ? "gap-3 px-4 py-3" : "justify-center w-12 h-12 p-0",
                                isActive
                                    ? "bg-white/10 text-white shadow-[0_0_15px_rgba(251,255,0,0.1)] border-white/10 backdrop-blur-md"
                                    : "text-zinc-400 hover:text-white"
                            )
                        }
                    >
                        <item.icon className={({ isActive }) => cn(
                            "transition-colors",
                            isActive ? "text-neon-400" : "group-hover:text-neon-400",
                            isOpen ? "w-5 h-5" : "w-6 h-6"
                        )} />

                        {isOpen && <span className="font-medium whitespace-nowrap">{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            <div className={cn("p-6", !isOpen && "p-4 flex justify-center")}>
                <div className={cn(
                    "glass-card rounded-xl flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-colors",
                    isOpen ? "p-4" : "p-2 justify-center w-12 h-12"
                )}>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-neon-400 to-purple-500 p-[1px] flex-shrink-0">
                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                            {user.photoURL ? (
                                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-neon-400">
                                    {(user.name || 'U').charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                    </div>
                    {isOpen && (
                        <div className="overflow-hidden">
                            <p className="text-sm font-semibold text-white truncate">{user.name || 'Zency User'}</p>
                            <p className="text-xs text-zinc-400 truncate">Level {user.level || 0} • {user.level < 5 ? 'Novice' : user.level < 10 ? 'Adept' : 'Master'}</p>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
