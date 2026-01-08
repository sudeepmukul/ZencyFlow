import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../../contexts/UserContext';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useXP } from '../../hooks/useXP';
import { Layers, Zap, Calendar, Target, Brain, ArrowRight, Check, LogIn, SkipForward } from 'lucide-react';
import confetti from 'canvas-confetti';
import { initializeDefaultData } from '../../utils/onboardingUtils';

export const OnboardingModal = () => {
    const { user, updateProfile } = useUser();
    const { login: signInWithGoogle } = useAuth();
    const { calculateLevel } = useXP();
    const dataContext = useData();
    const [step, setStep] = useState(1);
    const [isVisible, setIsVisible] = useState(true);
    const [isInitializing, setIsInitializing] = useState(false);

    // Only show if user is loaded and hasOnboarded is explicitly false
    if (!user || user.hasOnboarded !== false || !isVisible) return null;

    const handleNext = () => {
        setStep(2);
    };

    const handleSkip = () => {
        setStep(3);
    };

    const handleSignIn = async () => {
        try {
            await signInWithGoogle();
            // After sign in, we stay on this modal but move to next step.
            setStep(3);
        } catch (error) {
            console.error("Sign in failed", error);
        }
    };

    const handleFinish = async () => {
        setIsInitializing(true);
        // Inject Default Data
        await initializeDefaultData(dataContext);

        // Atomic Update: XP Boost + Onboarding Status
        // Consolidate updates to prevent state overwrites
        const currentXP = user.xp || 0;
        const newXP = currentXP + 20;
        const newLevel = calculateLevel(newXP);

        await updateProfile({
            hasOnboarded: true,
            xp: newXP,
            level: newLevel
        });

        setIsVisible(false);
        setIsInitializing(false);

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

                <div className="relative z-10 min-h-[450px] flex flex-col">
                    {/* Progress Indicator */}
                    <div className="flex justify-center gap-2 mb-8">
                        <div className={`h-1.5 w-8 rounded-full transition-colors duration-300 ${step >= 1 ? 'bg-neon-400' : 'bg-white/10'}`} />
                        <div className={`h-1.5 w-8 rounded-full transition-colors duration-300 ${step >= 2 ? 'bg-neon-400' : 'bg-white/10'}`} />
                        <div className={`h-1.5 w-8 rounded-full transition-colors duration-300 ${step >= 3 ? 'bg-neon-400' : 'bg-white/10'}`} />
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
                                className="flex-1 flex flex-col items-center text-center space-y-6"
                            >
                                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-4 border border-white/5">
                                    <LogIn className="w-10 h-10 text-white" />
                                </div>

                                <h2 className="text-3xl font-bold text-white">Save Your Progress</h2>
                                <p className="text-gray-400 text-lg max-w-md">
                                    Sign in to sync your data across devices and never lose your streak. Or skip for now and try it out as a guest.
                                </p>

                                <div className="space-y-4 w-full max-w-sm mt-8">
                                    <button
                                        onClick={handleSignIn}
                                        className="w-full py-4 rounded-xl bg-white text-black font-bold text-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path
                                                fill="currentColor"
                                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            />
                                            <path
                                                fill="currentColor"
                                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            />
                                            <path
                                                fill="currentColor"
                                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
                                            />
                                            <path
                                                fill="currentColor"
                                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            />
                                        </svg>
                                        Sign in with Google
                                    </button>

                                    <button
                                        onClick={handleSkip}
                                        className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                                    >
                                        Skip for now <SkipForward className="w-5 h-5 text-gray-400" />
                                    </button>
                                </div>
                            </motion.div>
                        )}


                        {step === 3 && (
                            <motion.div
                                key="step3"
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
                                        disabled={isInitializing}
                                        className="w-full py-4 rounded-xl bg-white text-black font-bold text-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isInitializing ? 'Setting things up...' : "Let's Go!"}
                                        {!isInitializing && <Check className="w-5 h-5" />}
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
