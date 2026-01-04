import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../../contexts/UserContext';
import { Layers, Zap, Calendar, Target, Brain, ArrowRight, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

export const OnboardingModal = () => {
    const { user, completeOnboarding } = useUser();
    const [step, setStep] = useState(1);
    const [isVisible, setIsVisible] = useState(true);

    // Only show if user is loaded and hasOnboarded is explicitly false
    // Existing users will have undefined (falsy but not false)
    if (!user || user.hasOnboarded !== false || !isVisible) return null;

    const handleNext = () => {
        setStep(2);
    };

    const handleFinish = async () => {
        await completeOnboarding();
        setIsVisible(false);
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#a855f7', '#ec4899', '#eab308', '#22c55e']
        });
    };

    const variants = {
        enter: { x: 100, opacity: 0 },
        center: { x: 0, opacity: 1 },
        exit: { x: -100, opacity: 0 }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-2xl overflow-hidden rounded-3xl border border-neon-500/30 bg-zinc-950 p-8 shadow-[0_0_50px_rgba(168,85,247,0.15)] relative"
            >
                {/* Background Decoration */}
                <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

                <div className="relative z-10 min-h-[400px] flex flex-col">
                    {/* Progress Indicator */}
                    <div className="flex justify-center gap-2 mb-8">
                        <div className={`h-1.5 w-8 rounded-full transition-colors duration-300 ${step >= 1 ? 'bg-neon-400' : 'bg-white/10'}`} />
                        <div className={`h-1.5 w-8 rounded-full transition-colors duration-300 ${step >= 2 ? 'bg-neon-400' : 'bg-white/10'}`} />
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                                className="flex-1 flex flex-col items-center text-center space-y-6"
                            >
                                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-4 border border-white/5">
                                    <Brain className="w-10 h-10 text-white" />
                                </div>

                                <h2 className="text-3xl font-bold text-white">Welcome to Zency Flow</h2>
                                <p className="text-gray-400 text-lg max-w-md">
                                    Your ultimate productivity command center. Gamify your life, track your progress, and achieve your goals with a zen-like focus.
                                </p>

                                <div className="grid grid-cols-2 gap-4 w-full mt-4">
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center">
                                        <Target className="w-6 h-6 text-neon-400 mb-2" />
                                        <span className="text-white font-medium">Gamified Goals</span>
                                        <span className="text-xs text-gray-500">Earn XP for tasks</span>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center">
                                        <Layers className="w-6 h-6 text-blue-400 mb-2" />
                                        <span className="text-white font-medium">Life OS</span>
                                        <span className="text-xs text-gray-500">All in one place</span>
                                    </div>
                                </div>

                                <div className="mt-auto w-full pt-8">
                                    <button
                                        onClick={handleNext}
                                        className="w-full py-4 rounded-xl bg-neon-400 text-black font-bold text-lg hover:bg-neon-300 transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                                    >
                                        Get Started <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                                className="flex-1 flex flex-col"
                            >
                                <h2 className="text-2xl font-bold text-white mb-6 text-center">Your Command Center</h2>

                                <div className="space-y-4 flex-1">
                                    <FeatureRow
                                        icon={<Target className="text-purple-400" />}
                                        title="Dashboard"
                                        desc="Your daily overview. Track XP, tasks, and daily score."
                                    />
                                    <FeatureRow
                                        icon={<Calendar className="text-blue-400" />}
                                        title="Calendar"
                                        desc="Plan your week with drag-and-drop quests."
                                    />
                                    <FeatureRow
                                        icon={<Zap className="text-yellow-400" />}
                                        title="Habits"
                                        desc="Build streaks and automate your success."
                                    />
                                    <FeatureRow
                                        icon={<Brain className="text-pink-400" />}
                                        title="Focus Mode"
                                        desc="Deep work sessions with built-in timers."
                                    />
                                </div>

                                <div className="mt-8">
                                    <button
                                        onClick={handleFinish}
                                        className="w-full py-4 rounded-xl bg-white text-black font-bold text-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                                    >
                                        Let's Go! <Check className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

const FeatureRow = ({ icon, title, desc }) => (
    <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
        <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
            {icon}
        </div>
        <div>
            <h3 className="text-white font-medium">{title}</h3>
            <p className="text-sm text-gray-500">{desc}</p>
        </div>
    </div>
);
