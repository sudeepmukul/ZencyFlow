import React, { useState, useEffect } from 'react';
import { Quote, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

const quotes = [
    { text: "It’s not always that we need to do more but rather that we need to focus on less.", author: "Nathan W. Morris" },
    { text: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
    { text: "The key is not to prioritize what’s on your schedule, but to schedule your priorities.", author: "Stephen R. Covey" },
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "Productivity is being able to do things that you were never able to do before.", author: "Franz Kafka" },
    { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
    { text: "The shorter way to do many things is to do only one thing at a time.", author: "Mozart" },
    { text: "Your most important work is always ahead of you, never behind you.", author: "Stephen Covey" },
    { text: "Amateurs sit and wait for inspiration, the rest of us just get up and go to work.", author: "Stephen King" },
    { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
    { text: "I’ve missed more than 9,000 shots… I’ve failed over and over again in my life. And that is why I succeed.", author: "Michael Jordan" },
    { text: "The biggest risk is not taking any risk.", author: "Mark Zuckerberg" },
    { text: "The most difficult thing is the decision to act, the rest is merely tenacity.", author: "Amelia Earhart" },
    { text: "It’s fine to celebrate success, but it is more important to heed the lessons of failure.", author: "Bill Gates" },
    { text: "Don’t be afraid to give up the good to go for the great.", author: "John D. Rockefeller" },
    { text: "I am building a fire, and every day I train, I add more fuel.", author: "Mia Hamm" },
    { text: "If you are not embarrassed by the first version of your product, you’ve launched too late.", author: "Reid Hoffman" },
    { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
    { text: "Just play. Have fun. Enjoy the game.", author: "Michael Jordan" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Everything around you that you call life was made up by people that were no smarter than you.", author: "Steve Jobs" }
];

export const QuotesWidget = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [progressKey, setProgressKey] = useState(0); // Forces progress bar reset
    const DURATION = 10000; // 10 seconds

    // Handle auto-rotation
    useEffect(() => {
        let interval;
        if (!isPaused) {
            interval = setInterval(() => {
                handleNext();
            }, DURATION);
        }
        return () => clearInterval(interval);
    }, [currentIndex, isPaused]);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % quotes.length);
        setProgressKey((prev) => prev + 1);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + quotes.length) % quotes.length);
        setProgressKey((prev) => prev + 1);
    };

    const togglePause = () => {
        setIsPaused(!isPaused);
    };

    // Calculate current quote
    const currentQuote = quotes[currentIndex];

    return (
        <div className="w-full relative overflow-hidden font-sans selection:bg-[#fbff00] selection:text-black rounded-2xl bg-neutral-900 border border-zinc-800 shadow-lg mb-4">

            {/* Background Decorative Elements - Scaled down */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[25vw] h-[25vw] bg-[#fbff00] rounded-full blur-[40px] opacity-20 animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[20vw] h-[20vw] bg-[#fbff00] rounded-full blur-[30px] opacity-10"></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 w-full p-3 md:p-4">

                {/* Quote Container */}
                <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 min-h-[80px]">

                    {/* Large Quote Icon (Decorative) */}
                    <div className="hidden md:block shrink-0">
                        <Quote
                            size={32}
                            className="text-[#fbff00] opacity-80"
                            fill="#fbff00"
                        />
                    </div>

                    {/* Text Content */}
                    <div className="flex-1 text-center md:text-left space-y-1.5 animate-fadeIn w-full">

                        {/* Mobile Quote Icon */}
                        <div className="md:hidden flex justify-center mb-1">
                            <Quote size={20} className="text-[#fbff00]" fill="#fbff00" />
                        </div>

                        {/* The Quote */}
                        <h1
                            key={currentIndex} // Key change triggers animation
                            className="text-base md:text-lg font-bold leading-tight tracking-tight transition-all duration-700 ease-out transform translate-y-0 opacity-100 animate-slideUp text-white"
                        >
                            "{currentQuote.text}"
                        </h1>

                        {/* The Author */}
                        <div className="flex items-center justify-center md:justify-start gap-2">
                            <div className="h-[2px] w-6 bg-[#fbff00]"></div>
                            <p
                                key={`author-${currentIndex}`}
                                className="text-[10px] text-neutral-400 font-medium tracking-wide uppercase animate-fadeIn delay-100"
                            >
                                {currentQuote.author}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Controls & Progress */}
                <div className="mt-3 w-full flex flex-col gap-2">

                    {/* Progress Bar */}
                    <div className="w-full h-0.5 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                            key={progressKey} // Reset animation on slide change
                            className={`h-full bg-[#fbff00] origin-left ${isPaused ? 'w-full opacity-30' : 'animate-progress'}`}
                            style={{
                                animationDuration: `${DURATION}ms`,
                                animationPlayState: isPaused ? 'paused' : 'running'
                            }}
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center justify-between gap-3 text-neutral-500">

                        <div className="text-[10px] font-mono text-[#fbff00]">
                            {(currentIndex + 1).toString().padStart(2, '0')} / {quotes.length}
                        </div>

                        <div className="flex gap-1">
                            <button
                                onClick={handlePrev}
                                className="p-1 rounded-full hover:bg-neutral-800 hover:text-white transition-colors duration-200 border border-transparent hover:border-neutral-700 group"
                                aria-label="Previous quote"
                            >
                                <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                            </button>

                            <button
                                onClick={togglePause}
                                className="p-1 rounded-full hover:bg-neutral-800 hover:text-white transition-colors duration-200 border border-transparent hover:border-neutral-700"
                                aria-label={isPaused ? "Play" : "Pause"}
                            >
                                {isPaused ? <Play size={14} fill="currentColor" /> : <Pause size={14} fill="currentColor" />}
                            </button>

                            <button
                                onClick={handleNext}
                                className="p-1 rounded-full hover:bg-neutral-800 hover:text-white transition-colors duration-200 border border-transparent hover:border-neutral-700 group"
                                aria-label="Next quote"
                            >
                                <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-progress {
          animation-name: progress;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(10px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }
      `}</style>
        </div>
    );
};
