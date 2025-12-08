import React, { useEffect, useState } from 'react';
import { X, Trophy, CheckCircle, AlertTriangle, Info } from 'lucide-react';

const ToastItem = ({ id, title, message, type, icon: CustomIcon, onRemove }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger enter animation
        requestAnimationFrame(() => setIsVisible(true));
    }, []);

    const handleRemove = () => {
        setIsVisible(false);
        // Wait for exit animation
        setTimeout(() => {
            onRemove(id);
        }, 300);
    };

    let Icon = Info;
    let colorClass = 'border-neon-400/50 bg-neon-400/10 text-neon-400';

    if (type === 'success') {
        Icon = CheckCircle;
        colorClass = 'border-green-500/50 bg-green-500/10 text-green-500';
    } else if (type === 'achievement') {
        Icon = Trophy;
        colorClass = 'border-yellow-500/50 bg-yellow-500/10 text-yellow-500';
    } else if (type === 'error') {
        Icon = AlertTriangle;
        colorClass = 'border-red-500/50 bg-red-500/10 text-red-500';
    }

    if (CustomIcon) Icon = CustomIcon;

    return (
        <div
            className={`
                relative flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-lg 
                transition-all duration-300 ease-out transform
                ${colorClass}
                ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
            `}
            style={{ width: '320px' }}
        >
            <div className={`p-2 rounded-full bg-black/20 shrink-0`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-white mb-0.5">{title}</h4>
                <p className="text-xs text-zinc-300 leading-snug">{message}</p>
            </div>
            <button
                onClick={handleRemove}
                className="text-zinc-500 hover:text-white transition-colors shrink-0"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
            <div className="pointer-events-auto flex flex-col gap-3">
                {toasts.map(toast => (
                    <ToastItem
                        key={toast.id}
                        {...toast}
                        onRemove={removeToast}
                    />
                ))}
            </div>
        </div>
    );
};
