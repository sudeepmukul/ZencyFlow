import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useUser } from '../../contexts/UserContext';
import { Plus, Gift, History, Lock, Unlock, TrendingUp, Sparkles, Trash2, Smartphone, Gamepad2, Coffee, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreateRewardModal } from './CreateRewardModal';
import confetti from 'canvas-confetti';

export function Rewards() {
    const { rewards, addReward, deleteReward, redeemReward, rewardHistory } = useData();
    const { user } = useUser();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('shop'); // shop, unlocks, history

    const handleRedeem = async (reward) => {
        if (user.xp < reward.cost) {
            // Shake effect or error toast could go here
            alert("Not enough XP!");
            return;
        }

        const success = await redeemReward(reward);
        if (success) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#FBFF00', '#ffffff', '#a855f7']
            });
        }
    };

    // Predefined restricted activities
    const restrictedActivities = [
        { id: 'insta', name: 'Instagram / Social', cost: 50, icon: <Smartphone size={24} />, color: 'from-pink-500 to-purple-500' },
        { id: 'game', name: 'Gaming Session', cost: 80, icon: <Gamepad2 size={24} />, color: 'from-green-400 to-emerald-600' },
        { id: 'coffee', name: 'Cold Coffee', cost: 60, icon: <Coffee size={24} />, color: 'from-orange-400 to-amber-600' },
        { id: 'misc', name: 'Quick Dopamine', cost: 40, icon: <Sparkles size={24} />, color: 'from-blue-400 to-cyan-500' },
    ];

    const handleRestrictedRedeem = async (activity) => {
        const rewardObj = {
            id: `quick_${activity.id}`, // pseudo id
            name: activity.name,
            cost: activity.cost,
            icon: '⚡',
            category: 'Quick'
        };
        handleRedeem(rewardObj);
    };

    return (
        <div className="min-h-screen bg-transparent p-6 font-sans text-gray-100 selection:bg-[#FBFF00] selection:text-black md:p-12 pb-24">
            <CreateRewardModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={addReward}
            />

            <div className="mx-auto max-w-6xl space-y-8">
                {/* Header */}
                <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-white to-zinc-500 bg-clip-text text-transparent tracking-tight">
                            Rewards Shop
                            <span className="ml-2 inline-block h-2 w-2 rounded-full bg-[#FBFF00] align-baseline shadow-[0_0_10px_#FBFF00]"></span>
                        </h1>
                        <p className="mt-2 text-gray-400">
                            Spend your hard-earned XP on real-world rewards.
                        </p>
                    </div>

                    <div className="flex items-center gap-4 bg-zinc-900/50 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
                        <div className="flex flex-col items-end">
                            <span className="text-xs text-zinc-400 uppercase font-bold tracking-wider">Available Balance</span>
                            <span className="text-3xl font-bold text-[#FBFF00] drop-shadow-[0_0_10px_rgba(251,255,0,0.5)]">
                                {user.xp} XP
                            </span>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-[#FBFF00] flex items-center justify-center text-black">
                            <Gift size={20} />
                        </div>
                    </div>
                </header>

                {/* Tabs */}
                <div className="flex gap-4 border-b border-white/10 pb-1">
                    <button
                        onClick={() => setActiveTab('shop')}
                        className={`pb-3 px-2 text-sm font-bold uppercase tracking-wider transition-all relative ${activeTab === 'shop' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Custom Rewards
                        {activeTab === 'shop' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FBFF00]" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('unlocks')}
                        className={`pb-3 px-2 text-sm font-bold uppercase tracking-wider transition-all relative ${activeTab === 'unlocks' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Quick Unlocks
                        {activeTab === 'unlocks' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FBFF00]" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`pb-3 px-2 text-sm font-bold uppercase tracking-wider transition-all relative ${activeTab === 'history' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        History
                        {activeTab === 'history' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FBFF00]" />}
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {/* CUSTOM REWARDS TAB */}
                    {activeTab === 'shop' && (
                        <motion.div
                            key="shop"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Add New Card */}
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="group flex flex-col items-center justify-center min-h-[220px] rounded-3xl border-2 border-dashed border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900/50 hover:border-zinc-700 transition-all text-zinc-500 hover:text-white"
                                >
                                    <div className="h-14 w-14 rounded-full bg-zinc-800 group-hover:bg-[#FBFF00] flex items-center justify-center transition-colors mb-4 text-zinc-400 group-hover:text-black">
                                        <Plus size={24} />
                                    </div>
                                    <span className="font-semibold">Create Reward</span>
                                </button>

                                {/* Reward Cards */}
                                {rewards.map(reward => (
                                    <div key={reward.id} className="relative group overflow-hidden rounded-3xl bg-zinc-900 border border-white/5 hover:border-white/10 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                                        {/* Image BG (if exists) */}
                                        {reward.image && (
                                            <div className="absolute inset-0 z-0">
                                                <img src={reward.image} alt={reward.name} className="w-full h-full object-cover opacity-30 group-hover:scale-110 transition-transform duration-700" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/80 to-transparent" />
                                            </div>
                                        )}

                                        <div className="relative z-10 p-6 flex flex-col h-full min-h-[220px]">
                                            <div className="flex justify-between items-start">
                                                <div className="bg-black/40 backdrop-blur-md rounded-xl p-3 text-3xl border border-white/5">
                                                    {reward.icon || '🎁'}
                                                </div>
                                                <div className="px-3 py-1 rounded-full bg-white/5 text-xs text-zinc-400 border border-white/5">
                                                    {reward.category}
                                                </div>
                                            </div>

                                            <div className="mt-auto pt-6">
                                                <h3 className="font-bold text-lg leading-tight mb-1">{reward.name}</h3>
                                                <div className="flex items-center justify-between mt-4">
                                                    <div className="text-[#FBFF00] font-bold flex items-center gap-1.5">
                                                        <span className="text-xl">{reward.cost}</span> <span className="text-xs uppercase opacity-70">XP</span>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); deleteReward(reward.id); }}
                                                            className="p-2 rounded-full hover:bg-red-500/20 hover:text-red-500 transition-colors text-zinc-600"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleRedeem(reward)}
                                                            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${user.xp >= reward.cost
                                                                    ? 'bg-[#FBFF00] text-black hover:bg-[#e1e600] shadow-[0_0_15px_rgba(251,255,0,0.2)]'
                                                                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                                                }`}
                                                        >
                                                            {user.xp >= reward.cost ? 'Unlock' : 'Locked'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* UNLOCKS TAB */}
                    {activeTab === 'unlocks' && (
                        <motion.div
                            key="unlocks"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                        >
                            <div className="col-span-full mb-4">
                                <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-white/5 flex items-center gap-6">
                                    <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center text-purple-400">
                                        <Lock size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Instant Access Control</h3>
                                        <p className="text-zinc-400 max-w-2xl">
                                            Self-imposed restrictions. Want to check Instagram or play a game? Pay the price in XP.
                                            This adds "friction" to cheap dopamine hits.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {restrictedActivities.map(activity => (
                                <button
                                    key={activity.id}
                                    onClick={() => handleRestrictedRedeem(activity)}
                                    className="relative overflow-hidden group p-6 rounded-3xl bg-zinc-900 border border-white/5 hover:border-white/10 transition-all text-left flex flex-col gap-4"
                                >
                                    <div className={`absolute top-0 right-0 p-32 bg-gradient-to-br ${activity.color} opacity-10 blur-3xl rounded-full translate-x-10 -translate-y-10`} />

                                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${activity.color} flex items-center justify-center text-white shadow-lg`}>
                                        {activity.icon}
                                    </div>

                                    <div>
                                        <h4 className="font-bold text-lg">{activity.name}</h4>
                                        <p className="text-zinc-500 text-sm">One Session</p>
                                    </div>

                                    <div className="mt-auto flex items-center justify-between">
                                        <span className="text-[#FBFF00] font-bold text-xl">{activity.cost} XP</span>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${user.xp >= activity.cost ? 'bg-[#FBFF00] text-black' : 'bg-zinc-800 text-zinc-600'
                                            }`}>
                                            <Unlock size={14} />
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </motion.div>
                    )}

                    {/* HISTORY TAB */}
                    {activeTab === 'history' && (
                        <motion.div
                            key="history"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            {rewardHistory && rewardHistory.length > 0 ? (
                                [...rewardHistory].reverse().map(item => (
                                    <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/50 border border-white/5">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center text-xl">
                                                {item.icon || '🎁'}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white">{item.rewardName}</h4>
                                                <p className="text-xs text-zinc-500">
                                                    Redeemed on {new Date(item.redeemedAt).toLocaleDateString()} at {new Date(item.redeemedAt).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="font-bold text-red-400">
                                            -{item.cost} XP
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-zinc-500">
                                    No rewards redeemed yet.
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
