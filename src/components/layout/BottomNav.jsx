import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, CheckSquare, Zap, Menu } from 'lucide-react';

export function BottomNav() {
    const navItems = [
        { path: '/', icon: LayoutDashboard, label: 'Home' },
        { path: '/calendar', icon: Calendar, label: 'Calendar' },
        { path: '/todo', icon: CheckSquare, label: 'Tasks' },
        { path: '/habits', icon: Zap, label: 'Habits' },
        // Menu item for less frequent actions usually in sidebar
        { path: '/settings', icon: Menu, label: 'Menu' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-t border-white/10 pb-safe-area-inset-bottom">
            <div className="flex justify-around items-center h-16 px-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                            flex flex-col items-center justify-center w-full h-full space-y-1
                            transition-colors duration-200
                            ${isActive ? 'text-neon-400' : 'text-gray-400 hover:text-white'}
                        `}
                    >
                        <item.icon size={24} strokeWidth={2} />
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}
