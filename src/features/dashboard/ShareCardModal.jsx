import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { createPortal } from 'react-dom';
import { X, Download, Share2, Award, Zap, Trophy, CheckCircle2, Flame, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../components/ui/Button';

export function ShareCardModal({ isOpen, onClose, user, productivity, taskCount, habitCount, streak }) {
    const cardRef = useRef(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownload = async () => {
        if (!cardRef.current) return;
        setIsGenerating(true);

        try {
            // Wait for slight delay to ensure render
            await new Promise(resolve => setTimeout(resolve, 100));

            const canvas = await html2canvas(cardRef.current, {
                backgroundColor: null, // Transparent base
                scale: 2, // Retina quality
                logging: false,
                useCORS: true // Allow loading external images (avatars)
            });

            const image = canvas.toDataURL("image/png");

            // Trigger download
            const link = document.createElement('a');
            link.href = image;
            link.download = `ZencyFlow-Stats-${user.name.replace(/\s+/g, '-')}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Optional: Close modal after download
            // onClose(); 
        } catch (error) {
            console.error("Failed to generate image:", error);
            alert("Failed to create image. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-zinc-400 hover:text-white z-10 p-1 bg-black/40 rounded-full"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="p-6 space-y-6">
                        <div className="text-center">
                            <h2 className="text-xl font-bold text-white mb-1">Share Your Progress</h2>
                            <p className="text-sm text-zinc-400">Inspire others with your consistency.</p>
                        </div>

                        {/* THE CARD TO CAPTURE */}
                        <div className="flex justify-center">
                            <div
                                ref={cardRef}
                                className="w-[320px] h-[480px] rounded-2xl relative overflow-hidden flex flex-col items-center justify-between p-6 shadow-2xl border border-white/10"
                                style={{
                                    background: 'linear-gradient(145deg, #09090b 0%, #18181b 100%)'
                                }}
                            >
                                {/* Background Decorations */}
                                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                                    <div className="absolute -top-20 -left-20 w-60 h-60 bg-neon-400/20 rounded-full blur-3xl opacity-50"></div>
                                    <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl opacity-40"></div>
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl opacity-30"></div>
                                </div>

                                {/* Header / Branding */}
                                <div className="z-10 text-center w-full mt-2">
                                    <div className="flex items-center justify-center mb-3 opacity-90">
                                        <span className="font-bold text-xl tracking-wide text-white">ZENCY FLOW</span>
                                    </div>
                                    <div className="h-px w-2/3 bg-gradient-to-r from-transparent via-white/20 to-transparent mx-auto"></div>
                                </div>

                                {/* User Info */}
                                <div className="z-10 flex flex-col items-center gap-3 py-2">
                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-full p-[3px] bg-gradient-to-br from-neon-400 via-purple-500 to-blue-500 shadow-xl shadow-purple-500/20">
                                            <div className="w-full h-full rounded-full bg-zinc-900 overflow-hidden flex items-center justify-center border-2 border-zinc-900">
                                                {user.photoURL ? (
                                                    <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" crossOrigin="anonymous" />
                                                ) : (
                                                    <span className="text-2xl font-bold text-white">{user.name?.[0]?.toUpperCase()}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 bg-zinc-900 rounded-full p-1 border border-zinc-800">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                                                <span className="text-xs font-bold text-black">{user.level}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <h3 className="text-xl font-bold text-white mb-0.5">{user.name}</h3>
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                                            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                                            <span className="text-xs font-bold text-yellow-400">{user.xp?.toLocaleString()} XP</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="z-10 w-full grid grid-cols-2 gap-3 mb-2">
                                    <div className="bg-zinc-800/40 rounded-2xl p-3 border border-white/5 flex flex-col items-center justify-center backdrop-blur-sm hover:bg-zinc-800/60 transition-colors">
                                        <div className="mb-1 text-neon-400">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                        <span className="text-2xl font-bold text-white leading-none mb-1">{taskCount}</span>
                                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Tasks Done</span>
                                    </div>
                                    <div className="bg-zinc-800/40 rounded-2xl p-3 border border-white/5 flex flex-col items-center justify-center backdrop-blur-sm hover:bg-zinc-800/60 transition-colors">
                                        <div className="mb-1 text-purple-400">
                                            <Flame className="w-5 h-5" />
                                        </div>
                                        <span className="text-2xl font-bold text-white leading-none mb-1">{habitCount}</span>
                                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Habits Done</span>
                                    </div>
                                    <div className="bg-zinc-800/40 rounded-2xl p-3 border border-white/5 flex flex-col items-center justify-center backdrop-blur-sm hover:bg-zinc-800/60 transition-colors">
                                        <div className="mb-1 text-blue-400">
                                            <Target className="w-5 h-5" />
                                        </div>
                                        <span className="text-2xl font-bold text-white leading-none mb-1">{streak}</span>
                                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Day Streak</span>
                                    </div>
                                    <div className="bg-zinc-800/40 rounded-2xl p-3 border border-white/5 flex flex-col items-center justify-center backdrop-blur-sm hover:bg-zinc-800/60 transition-colors">
                                        <div className="mb-1 text-green-400">
                                            <Zap className="w-5 h-5" />
                                        </div>
                                        <span className="text-2xl font-bold text-white leading-none mb-1">{productivity}%</span>
                                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Productivity</span>
                                    </div>
                                </div>

                                {/* Footer / Date */}
                                <div className="z-10 text-center w-full pt-2 border-t border-white/5">
                                    <p className="text-[10px] text-zinc-500 font-mono tracking-[0.2em] uppercase opacity-70">
                                        {new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <Button variant="secondary" onClick={onClose} className="flex-1">
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleDownload}
                                disabled={isGenerating}
                                className="flex-[2] shadow-lg shadow-neon-400/20"
                            >
                                {isGenerating ? (
                                    <span className="flex items-center gap-2">Generating...</span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Download className="w-4 h-4" /> Download Image
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
}

// Add these imports if they are missing or if you need to use them in the new implementation
// import { CheckCircle2, Flame, Target } from 'lucide-react';
// The original file already had Zap, Trophy, but not Target or CheckCircle2/Flame in the imports line possibly.
// I updated the imports in the replacement content above.
