import React, { useState, useEffect } from 'react';
import { X, Trophy, Coins, Image as ImageIcon, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function CreateRewardModal({ isOpen, onClose, onAdd }) {
    const [name, setName] = useState('');
    const [cost, setCost] = useState(50);
    const [icon, setIcon] = useState('🎁');
    const [category, setCategory] = useState('Fun');
    const [image, setImage] = useState('');

    // Reset form when opening
    useEffect(() => {
        if (isOpen) {
            setName('');
            setCost(50);
            setIcon('🎁');
            setCategory('Fun');
            setImage('');
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd({
            name,
            cost: parseInt(cost),
            icon,
            category,
            image
        });
        onClose();
    };

    const categories = ['Fun', 'Food', 'Social', 'Purchase', 'Other'];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="w-full max-w-md overflow-hidden rounded-3xl bg-zinc-900 border border-white/10 shadow-2xl relative">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-white/5">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Trophy className="text-[#FBFF00]" size={20} />
                                    Create Reward
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400">Reward Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Weekend Trip"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#FBFF00]/50 focus:ring-1 focus:ring-[#FBFF00]/50 transition-all"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                                            <Coins size={14} /> Cost (XP)
                                        </label>
                                        <input
                                            type="number"
                                            value={cost}
                                            onChange={(e) => setCost(e.target.value)}
                                            min="1"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FBFF00]/50 transition-all"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                                            Icon (Emoji)
                                        </label>
                                        <input
                                            type="text"
                                            value={icon}
                                            onChange={(e) => setIcon(e.target.value)}
                                            placeholder="🎁"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-xl focus:outline-none focus:border-[#FBFF00]/50 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                                        <Tag size={14} /> Category
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map(cat => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setCategory(cat)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${category === cat
                                                        ? 'bg-[#FBFF00] text-black shadow-[0_0_10px_rgba(251,255,0,0.3)]'
                                                        : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
                                                    }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                                        <ImageIcon size={14} /> Image URL (Optional)
                                    </label>
                                    <input
                                        type="url"
                                        value={image}
                                        onChange={(e) => setImage(e.target.value)}
                                        placeholder="https://..."
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#FBFF00]/50 transition-all text-xs"
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="w-full mt-2 bg-[#FBFF00] hover:bg-[#e1e600] text-black font-bold py-3.5 rounded-xl shadow-[0_0_20px_rgba(251,255,0,0.2)] hover:shadow-[0_0_30px_rgba(251,255,0,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                    <PlusIcon className="w-5 h-5" />
                                    Add Reward
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// Simple Plus Icon component if not imported
const PlusIcon = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);
