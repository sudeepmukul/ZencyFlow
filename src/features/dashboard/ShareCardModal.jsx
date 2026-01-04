import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { createPortal } from 'react-dom';
import { X, Download, Share2, Award, Zap, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../components/ui/Button';

export function ShareCardModal({ isOpen, onClose, user, productivity }) {
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
                                className="w-[320px] h-[480px] rounded-2xl relative overflow-hidden flex flex-col items-center justify-between p-8 shadow-2xl border border-white/10"
                                style={{
                                    background: 'linear-gradient(145deg, #09090b 0%, #18181b 100%)'
                                }}
                            >
                                {/* Background Decorations */}
                                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                                    <div className="absolute -top-20 -left-20 w-60 h-60 bg-neon-400/20 rounded-full blur-3xl opacity-50"></div>
                                    <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl opacity-40"></div>
                                </div>

                                {/* Header / Branding */}
                                <div className="z-10 text-center w-full">
                                    <div className="flex items-center justify-center gap-2 mb-2 opacity-80">
                                        <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-neon-400 to-green-300 transform rotate-12"></div>
                                        <span className="font-bold text-lg tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">ZENCY FLOW</span>
                                    </div>
                                    <div className="h-px w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent mx-auto"></div>
                                </div>

                                {/* User Info */}
                                <div className="z-10 flex flex-col items-center gap-4 py-4">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full p-[2px] bg-gradient-to-br from-neon-400 via-purple-500 to-blue-500">
                                            <div className="w-full h-full rounded-full bg-zinc-900 overflow-hidden flex items-center justify-center">
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
                                        <h3 className="text-2xl font-bold text-white mb-1">{user.name}</h3>
                                        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                                            <Trophy className="w-3 h-3 text-yellow-400" />
                                            <span className="text-xs font-medium text-yellow-400">{user.xp?.toLocaleString()} XP</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="z-10 w-full grid grid-cols-1 gap-3">
                                    <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex items-center justify-between backdrop-blur-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400">
                                                <Zap className="w-4 h-4" />
                                            </div>
                                            <div className="text-left">
                                                <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Productivity</div>
                                                <div className="text-sm font-bold text-white">This Month</div>
                                            </div>
                                        </div>
                                        <span className="text-2xl font-bold text-green-400">{productivity}%</span>
                                    </div>
                                </div>

                                {/* Footer / Date */}
                                <div className="z-10 text-center w-full pt-4">
                                    <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase opacity-70">
                                        {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
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
