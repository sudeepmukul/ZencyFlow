import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, BatteryLow, BatteryMedium, BatteryFull } from 'lucide-react';

const NEON_YELLOW = "#fbff00";

// --- Dragon Component (Zencia) ---
const Zencia = ({ mood, score }) => {
    // Moods: 0:Sleep, 1:Grumpy, 2:Neutral, 3:Happy, 4:Flying, 5:Legendary

    // Animation variants for different body parts based on mood
    const bodyVariants = {
        sleep: { y: 5, scaleY: 0.95, transition: { repeat: Infinity, repeatType: "reverse", duration: 1.5 } },
        grumpy: { x: [0, -1, 1, -1, 0], transition: { repeat: Infinity, duration: 0.5 } },
        neutral: { y: [0, -2, 0], transition: { repeat: Infinity, duration: 2 } },
        happy: { y: [0, -5, 0], rotate: [0, 1, -1, 0], transition: { repeat: Infinity, duration: 1.5 } },
        flying: { y: [0, -15, 0], transition: { repeat: Infinity, duration: 0.8, ease: "easeInOut" } },
        legendary: {
            y: [0, -10, 0, -5, 0],
            scale: [1, 1.1, 1],
            transition: { repeat: Infinity, duration: 1 }
        }
    };

    const wingVariants = {
        sleep: { rotate: 0 },
        grumpy: { rotate: 0 },
        neutral: { rotate: [0, 5, 0], transition: { repeat: Infinity, duration: 3 } },
        happy: { rotate: [0, 15, 0], transition: { repeat: Infinity, duration: 1 } },
        flying: { rotate: [10, -30, 10], transition: { repeat: Infinity, duration: 0.2 } },
        legendary: { rotate: [10, -40, 10], transition: { repeat: Infinity, duration: 0.15 } }
    };

    // Determine colors based on mood - NOW ALL SHADES OF YELLOW
    const getMainColor = () => {
        if (mood === 0) return "#FEF9C3"; // Sleep: Very Pale Yellow
        if (mood === 1) return "#CA8A04"; // Grumpy: Dark Mustard/Brownish Yellow
        if (mood === 2) return "#FDE047"; // Neutral: Soft Yellow
        if (mood === 3) return "#FACC15"; // Happy: Vibrant Yellow
        if (mood === 4) return "#FFFF00"; // Flying: Pure Yellow
        if (mood === 5) return NEON_YELLOW; // Legendary: Your Custom Neon #fbff00
        return NEON_YELLOW;
    };

    const getStrokeColor = () => {
        if (mood === 1) return "#713F12"; // Darker stroke for grumpy
        return "#854D0E"; // Standard dark yellow/brown stroke
    };

    return (
        <div className="relative w-24 h-24 flex items-center justify-center">

            {/* Interaction Particles/Effects */}
            <AnimatePresence>
                {mood === 0 && (
                    <motion.div
                        className="absolute -top-4 right-2 text-yellow-100 font-bold text-xs"
                        initial={{ opacity: 0, y: 0 }}
                        animate={{ opacity: [0, 1, 0], y: -20, x: 10 }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        Zzz...
                    </motion.div>
                )}
                {mood === 1 && (
                    <motion.div className="absolute top-8 -left-2"
                        initial={{ opacity: 0, x: 0 }}
                        animate={{ opacity: [0, 0.6, 0], x: -10, scale: 1.5 }}
                        transition={{ repeat: Infinity, duration: 1 }}
                    >
                        <div className="w-2 h-2 rounded-full bg-yellow-700 blur-sm" />
                    </motion.div>
                )}
                {mood === 5 && (
                    <>
                        <motion.div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
                            {[...Array(5)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-1 h-1 rounded-full"
                                    style={{ backgroundColor: NEON_YELLOW }}
                                    initial={{ x: 50, y: 50, opacity: 1 }}
                                    animate={{
                                        x: 50 + (Math.random() - 0.5) * 100,
                                        y: 50 + (Math.random() - 0.5) * 100,
                                        opacity: 0
                                    }}
                                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                />
                            ))}
                        </motion.div>
                        <div className="absolute inset-0 opacity-20 blur-xl rounded-full animate-pulse" style={{ backgroundColor: NEON_YELLOW }} />
                    </>
                )}
            </AnimatePresence>

            {/* DRAGON SVG */}
            <motion.svg
                viewBox="0 0 100 100"
                className="w-full h-full drop-shadow-lg"
                variants={bodyVariants}
                animate={
                    mood === 0 ? "sleep" :
                        mood === 1 ? "grumpy" :
                            mood === 2 ? "neutral" :
                                mood === 3 ? "happy" :
                                    mood === 4 ? "flying" : "legendary"
                }
            >
                {/* Wings (Behind) */}
                <motion.g variants={wingVariants} animate={mood >= 4 ? "flying" : mood === 5 ? "legendary" : mood === 3 ? "happy" : "neutral"} style={{ originX: '70px', originY: '60px' }}>
                    <path d="M 60 60 Q 90 30 95 10 Q 80 40 65 65" fill={getMainColor()} stroke={getStrokeColor()} strokeWidth="2" opacity="0.8" />
                    <path d="M 40 60 Q 10 30 5 10 Q 20 40 35 65" fill={getMainColor()} stroke={getStrokeColor()} strokeWidth="2" opacity="0.8" />
                </motion.g>

                {/* Tail */}
                <path d="M 50 80 Q 70 95 90 85" fill="none" stroke={getMainColor()} strokeWidth="8" strokeLinecap="round" />
                {mood >= 3 && (
                    <motion.path
                        d="M 90 85 L 95 80 L 85 80 Z"
                        fill={getMainColor()}
                        animate={{ rotate: [0, 20, -20, 0] }}
                        transition={{ repeat: Infinity, duration: 0.5 }}
                    />
                )}

                {/* Body */}
                <ellipse cx="50" cy="70" rx="25" ry="20" fill={getMainColor()} />
                <path d="M 35 70 Q 50 90 65 70" fill="#FEFCE8" opacity="0.3" /> {/* Belly - Light Yellow tint */}

                {/* Head */}
                <circle cx="50" cy="45" r="18" fill={getMainColor()} />

                {/* Horns - Always the Neon Color to pop */}
                <path d="M 40 35 L 35 20 L 45 30" fill={NEON_YELLOW} stroke={getStrokeColor()} strokeWidth="0.5" />
                <path d="M 60 35 L 65 20 L 55 30" fill={NEON_YELLOW} stroke={getStrokeColor()} strokeWidth="0.5" />

                {/* Eyes */}
                {mood === 0 ? (
                    // Sleeping Eyes
                    <g stroke={getStrokeColor()} strokeWidth="2" fill="none">
                        <path d="M 38 45 Q 42 48 46 45" />
                        <path d="M 54 45 Q 58 48 62 45" />
                    </g>
                ) : mood === 1 ? (
                    // Angry Eyes
                    <g fill="white">
                        <circle cx="42" cy="45" r="5" />
                        <circle cx="58" cy="45" r="5" />
                        <path d="M 35 40 L 48 44" stroke="black" strokeWidth="2" />
                        <path d="M 65 40 L 52 44" stroke="black" strokeWidth="2" />
                        <circle cx="42" cy="45" r="1.5" fill="black" />
                        <circle cx="58" cy="45" r="1.5" fill="black" />
                    </g>
                ) : (
                    // Normal/Happy Eyes
                    <g fill="white">
                        <circle cx="42" cy="45" r="5" />
                        <circle cx="58" cy="45" r="5" />
                        <motion.circle cx="42" cy="45" r="2" fill="black" animate={{ scaleY: [1, 0.1, 1] }} transition={{ repeat: Infinity, duration: 3, delay: 1 }} />
                        <motion.circle cx="58" cy="45" r="2" fill="black" animate={{ scaleY: [1, 0.1, 1] }} transition={{ repeat: Infinity, duration: 3, delay: 1 }} />
                    </g>
                )}

                {/* Mouth */}
                {mood === 1 ? (
                    <path d="M 45 55 Q 50 52 55 55" stroke="black" fill="none" strokeWidth="1" />
                ) : mood >= 3 ? (
                    <path d="M 45 53 Q 50 58 55 53" stroke="black" fill="none" strokeWidth="1.5" />
                ) : (
                    <path d="M 48 55 L 52 55" stroke="black" strokeWidth="1" />
                )}

                {/* Fire Breath (Legendary Only) */}
                {mood === 5 && (
                    <motion.path
                        d="M 50 55 Q 50 70 50 80"
                        stroke={NEON_YELLOW}
                        strokeWidth="0"
                        fill="none"
                    >
                    </motion.path>
                )}

            </motion.svg>
        </div>
    );
};

// --- Main Widget Component ---
export function ZenciaWidget({ user, todayScore, nextLevelXP }) {
    const [mood, setMood] = useState(2);
    const [isHovered, setIsHovered] = useState(false);

    // Calculate mood based on score
    useEffect(() => {
        let newMood = 2;
        if (todayScore < 16) newMood = 0; // Sleeping
        else if (todayScore < 31) newMood = 1; // Angry
        else if (todayScore < 51) newMood = 2; // Neutral
        else if (todayScore < 71) newMood = 3; // Happy
        else if (todayScore < 91) newMood = 4; // Flying
        else newMood = 5; // Legendary
        setMood(newMood);
    }, [todayScore]);

    // Updated Messages as requested
    const moodLabels = [
        "Wake Zencia by doing some tasks",
        "Zencia is Angry, Do more Tasks and Complete Habits",
        "Keep going Zencia is Watching",
        "Zencia is Happy, complete the remaining tasks",
        "You are so close to being 100% Productive",
        "Zencia has evolved to LEGENDARY level"
    ];

    // Text colors to match the yellow theme roughly, or just readable light colors
    const textColors = [
        "text-yellow-100", // Sleep
        "text-yellow-500", // Angry
        "text-yellow-200", // Watching
        "text-yellow-300", // Happy
        "text-[#fbff00]",  // Close
        "text-[#fbff00] font-bold shadow-yellow-500/50 drop-shadow-md" // Legendary
    ];

    return (
        <div className="w-full mb-4" style={{ '--neon-yellow': NEON_YELLOW }}>

            {/* --- Main Interactive Block --- */}
            <motion.div
                className="relative w-full bg-[#1E1E24] rounded-xl p-4 md:p-6 shadow-2xl border border-white/5 overflow-hidden"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
            >
                {/* Background Glow Effect - Adjusted to NEON YELLOW */}
                <div className={`absolute -right-20 -top-20 w-64 h-64 bg-[color:var(--neon-yellow)] rounded-full blur-3xl transition-opacity duration-700 ${mood === 5 ? 'opacity-30' : 'opacity-5'}`} />
                <div className={`absolute -left-10 -bottom-10 w-48 h-48 bg-[color:var(--neon-yellow)] rounded-full blur-3xl transition-opacity duration-700 ${mood === 1 ? 'opacity-10' : 'opacity-5'}`} />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">

                    {/* LEFT SIDE: Level & XP */}
                    <div className="flex-1 flex gap-4 items-center w-full">
                        {/* Level Icon - Updated to #fbff00 */}
                        <div className="relative group shrink-0">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-900/40 to-yellow-900/10 border border-[color:var(--neon-yellow)]/30 flex items-center justify-center shadow-[0_0_15px_rgba(251,255,0,0.1)] transition-all duration-300 group-hover:border-[color:var(--neon-yellow)] group-hover:shadow-[0_0_20px_rgba(251,255,0,0.3)]">
                                <Trophy className="w-8 h-8 text-[color:var(--neon-yellow)]" />
                            </div>
                            <div className="absolute -top-1 -right-1 bg-[color:var(--neon-yellow)] text-[10px] font-bold text-black px-1.5 rounded-full shadow-md">{user.level}</div>
                        </div>

                        {/* Stats */}
                        <div className="flex flex-col w-full">
                            <div className="flex items-baseline gap-2 mb-1">
                                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Level {user.level}</h2>
                                <span className="text-xs font-mono text-gray-500">{user.xp} / {nextLevelXP} XP</span>
                                <span className="text-xs font-mono text-red-400 flex items-center gap-0.5">
                                    <span className="text-red-500">❤️</span> {user.hearts || 0}
                                </span>
                            </div>

                            {/* XP Bar - Updated Gradient to NEON YELLOW */}
                            <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden relative">
                                <motion.div
                                    className="h-full"
                                    style={{
                                        background: `linear-gradient(90deg, #b98e0a 0%, #eab308 50%, ${NEON_YELLOW} 100%)`
                                    }}
                                    animate={{ width: `${(user.xp / nextLevelXP) * 100}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                />
                                {/* Shimmer effect */}
                                <motion.div
                                    className="absolute top-0 bottom-0 w-10 bg-white/30 skew-x-12 blur-sm"
                                    initial={{ left: "-20%" }}
                                    animate={{ left: "120%" }}
                                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2, ease: "linear" }}
                                />
                            </div>
                            <p className="text-[10px] text-gray-500 mt-1.5 flex items-center gap-1">
                                Next Level at {nextLevelXP} XP
                            </p>
                        </div>
                    </div>

                    {/* DIVIDER */}
                    <div className="w-px h-16 bg-gradient-to-b from-transparent via-gray-700 to-transparent mx-2 hidden md:block" />
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent my-2 md:hidden" />

                    {/* RIGHT SIDE: Daily Score & Zencia */}
                    <div className="flex-1 flex items-center justify-between gap-4 w-full">

                        {/* Controls */}
                        <div className="flex flex-col gap-2 flex-grow">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-sm font-medium">Daily Score</span>
                                <span className={`text-xs font-bold`} style={{ color: NEON_YELLOW }}>{todayScore}%</span>
                            </div>

                            {/* Visual Bar (Read-Only) */}
                            <div className="relative h-4 bg-gray-900 rounded-full border border-gray-700 overflow-hidden">
                                <motion.div
                                    className="h-full rounded-full shadow-sm"
                                    style={{
                                        backgroundColor: mood === 1 ? '#CA8A04' : // Dark mustard for grumpy
                                            mood === 0 ? '#FEF9C3' : // Pale for sleep
                                                NEON_YELLOW // Neon for everything else basically
                                    }}
                                    animate={{ width: `${todayScore}%` }}
                                    transition={{ type: "spring", bounce: 0, duration: 0.8 }}
                                />
                            </div>

                            {/* Dynamic Text Message */}
                            <div className="min-h-[2rem] flex items-start justify-start pt-1">
                                <span className={`text-[10px] leading-tight transition-colors duration-300 ${textColors[mood]}`}>
                                    {moodLabels[mood]}
                                </span>
                            </div>
                        </div>

                        {/* Zencia Container */}
                        <div className="relative group/dragon shrink-0">
                            <div className={`absolute inset-0 bg-gradient-to-tr from-yellow-500/20 to-[color:var(--neon-yellow)]/20 rounded-full blur-xl transition-all duration-500 ${mood === 5 ? 'opacity-100 scale-125' : 'opacity-0 scale-75'}`} />
                            <Zencia mood={mood} score={todayScore} />
                        </div>

                    </div>
                </div>

            </motion.div>
        </div>
    );
}
