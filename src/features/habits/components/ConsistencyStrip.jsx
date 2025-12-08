import React from 'react';

export const ConsistencyStrip = ({ history }) => {
    // Take only the last 90 days for this view
    const last90Days = history.slice(-90);

    return (
        <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
                <span>90 Day Consistency</span>
                <span>{last90Days.filter(h => h).length} / 90 Days</span>
            </div>
            <div className="flex h-3 w-full gap-[2px] overflow-hidden rounded-full bg-white/5 opacity-80 mask-image-linear-gradient">
                {last90Days.map((done, i) => (
                    <div
                        key={i}
                        className={`h-full flex-1 transition-all duration-500 ${done
                                ? 'bg-[#FBFF00] shadow-[0_0_4px_rgba(251,255,0,0.5)]'
                                : 'bg-white/5'
                            }`}
                        style={{ transitionDelay: `${i * 2}ms` }}
                    />
                ))}
            </div>
        </div>
    );
};
