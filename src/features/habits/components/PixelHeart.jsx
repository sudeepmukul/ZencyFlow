import React from 'react';

export const PixelHeart = ({ filled = true, size = 18 }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 16 16"
            className={`transition-all duration-300 ${filled ? 'drop-shadow-[0_0_4px_rgba(239,68,68,0.7)]' : 'opacity-40'}`}
            style={{ imageRendering: 'pixelated' }}
        >
            {/* Pixel heart shape - 8-bit Minecraft style */}
            {filled ? (
                <>
                    {/* Red filled heart */}
                    <rect x="2" y="1" width="2" height="2" fill="#dc2626" />
                    <rect x="4" y="1" width="2" height="2" fill="#ef4444" />
                    <rect x="8" y="1" width="2" height="2" fill="#dc2626" />
                    <rect x="10" y="1" width="2" height="2" fill="#ef4444" />
                    <rect x="1" y="3" width="2" height="2" fill="#dc2626" />
                    <rect x="3" y="3" width="2" height="2" fill="#ef4444" />
                    <rect x="5" y="3" width="2" height="2" fill="#f87171" />
                    <rect x="7" y="3" width="2" height="2" fill="#dc2626" />
                    <rect x="9" y="3" width="2" height="2" fill="#ef4444" />
                    <rect x="11" y="3" width="2" height="2" fill="#f87171" />
                    <rect x="13" y="3" width="2" height="2" fill="#dc2626" />
                    <rect x="1" y="5" width="2" height="2" fill="#dc2626" />
                    <rect x="3" y="5" width="4" height="2" fill="#ef4444" />
                    <rect x="7" y="5" width="4" height="2" fill="#dc2626" />
                    <rect x="11" y="5" width="2" height="2" fill="#ef4444" />
                    <rect x="13" y="5" width="2" height="2" fill="#dc2626" />
                    <rect x="2" y="7" width="12" height="2" fill="#dc2626" />
                    <rect x="3" y="9" width="10" height="2" fill="#b91c1c" />
                    <rect x="4" y="11" width="8" height="2" fill="#991b1b" />
                    <rect x="5" y="13" width="6" height="2" fill="#7f1d1d" />
                    <rect x="6" y="15" width="4" height="1" fill="#7f1d1d" />
                    {/* Shine highlight */}
                    <rect x="3" y="3" width="2" height="1" fill="#fca5a5" opacity="0.6" />
                </>
            ) : (
                <>
                    {/* Gray empty heart */}
                    <rect x="2" y="1" width="2" height="2" fill="#374151" />
                    <rect x="4" y="1" width="2" height="2" fill="#4b5563" />
                    <rect x="8" y="1" width="2" height="2" fill="#374151" />
                    <rect x="10" y="1" width="2" height="2" fill="#4b5563" />
                    <rect x="1" y="3" width="2" height="2" fill="#374151" />
                    <rect x="3" y="3" width="2" height="2" fill="#4b5563" />
                    <rect x="5" y="3" width="2" height="2" fill="#6b7280" />
                    <rect x="7" y="3" width="2" height="2" fill="#374151" />
                    <rect x="9" y="3" width="2" height="2" fill="#4b5563" />
                    <rect x="11" y="3" width="2" height="2" fill="#6b7280" />
                    <rect x="13" y="3" width="2" height="2" fill="#374151" />
                    <rect x="1" y="5" width="14" height="2" fill="#374151" />
                    <rect x="2" y="7" width="12" height="2" fill="#374151" />
                    <rect x="3" y="9" width="10" height="2" fill="#1f2937" />
                    <rect x="4" y="11" width="8" height="2" fill="#1f2937" />
                    <rect x="5" y="13" width="6" height="2" fill="#111827" />
                    <rect x="6" y="15" width="4" height="1" fill="#111827" />
                </>
            )}
        </svg>
    );
};
