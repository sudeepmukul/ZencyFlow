import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const PREDEFINED_ICONS = ['💪', '📚', '💧', '🧘‍♂️', '🏃‍♂️', '🎨', '🎸', '💰', '🥦', '🛌', '💻', '🧠', '💼', '🤝', '🎮', '🍎', '🧩', '📝'];
const CATEGORIES = [
    { name: 'Health', color: 'text-green-400 border-green-400/20 bg-green-400/10' },
    { name: 'Learning', color: 'text-blue-400 border-blue-400/20 bg-blue-400/10' },
    { name: 'Productivity', color: 'text-purple-400 border-purple-400/20 bg-purple-400/10' },
    { name: 'Mindfulness', color: 'text-pink-400 border-pink-400/20 bg-pink-400/10' },
    { name: 'Social', color: 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10' },
];

export const AddHabitModal = ({ isOpen, onClose, onAdd, initialData }) => {
    const [title, setTitle] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].name);
    const [selectedIcon, setSelectedIcon] = useState(PREDEFINED_ICONS[0]);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setTitle(initialData.title || '');
                setSelectedCategory(initialData.category || CATEGORIES[0].name);
                setSelectedIcon(initialData.icon || PREDEFINED_ICONS[0]);
            } else {
                // Reset defaults for new
                setTitle('');
                setSelectedCategory(CATEGORIES[0].name);
                setSelectedIcon(PREDEFINED_ICONS[0]);
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        onAdd({
            id: initialData?.id,
            title,
            category: selectedCategory,
            icon: selectedIcon
        });

        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-all duration-300">
            <div
                className="w-full max-w-md transition-all duration-300 ease-out transform scale-100 opacity-100"
                style={{ animation: 'pulse-ring 0.3s ease-out backwards' }}
            >
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#1A1A1A] p-8 shadow-2xl">
                    <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 hover:text-white">
                        <X size={24} />
                    </button>
                    <h2 className="mb-6 text-2xl font-bold text-white">
                        {initialData ? 'Edit Habit' : 'New Habit'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Read 10 pages"
                                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder-gray-600 focus:border-[#FBFF00] focus:outline-none focus:ring-1 focus:ring-[#FBFF00]"
                                autoFocus
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Icon</label>
                            <div className="grid grid-cols-6 gap-2">
                                {PREDEFINED_ICONS.map((icon) => (
                                    <button
                                        key={icon}
                                        type="button"
                                        onClick={() => setSelectedIcon(icon)}
                                        className={`flex h-10 w-10 items-center justify-center rounded-lg text-lg transition-all ${selectedIcon === icon
                                            ? 'bg-[#FBFF00] text-black scale-110'
                                            : 'bg-white/5 text-white hover:bg-white/10'
                                            }`}
                                    >
                                        {icon}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Category</label>
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.name}
                                        type="button"
                                        onClick={() => setSelectedCategory(cat.name)}
                                        className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all border ${selectedCategory === cat.name
                                            ? 'border-[#FBFF00] bg-[#FBFF00] text-black'
                                            : `border-white/10 bg-white/5 text-gray-400 hover:bg-white/10`
                                            }`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="mt-4 w-full rounded-xl bg-[#FBFF00] py-4 text-center font-bold text-black shadow-[0_0_20px_rgba(251,255,0,0.3)] transition-all hover:bg-[#e1e600] hover:scale-[1.02] active:scale-95"
                        >
                            {initialData ? 'Save Changes' : 'Create Habit'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
