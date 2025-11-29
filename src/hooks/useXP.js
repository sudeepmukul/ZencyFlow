import { useState, useCallback } from 'react';

export const useXP = () => {
    const calculateLevel = useCallback((xp) => {
        // Level = floor(0.1 * sqrt(Total XP))
        // Example: 100 XP = Level 1, 400 XP = Level 2, 900 XP = Level 3
        return Math.floor(0.1 * Math.sqrt(xp));
    }, []);

    const calculateNextLevelXP = useCallback((level) => {
        // Inverse: XP = (Level / 0.1)^2
        // Next Level XP = ((Level + 1) / 0.1)^2
        return Math.pow((level + 1) / 0.1, 2);
    }, []);

    const calculateProgress = useCallback((xp, level) => {
        const currentLevelXP = Math.pow(level / 0.1, 2);
        const nextLevelXP = Math.pow((level + 1) / 0.1, 2);
        const xpInLevel = xp - currentLevelXP;
        const xpNeededForLevel = nextLevelXP - currentLevelXP;

        if (xpNeededForLevel === 0) return 100; // Should not happen
        return Math.min(100, Math.max(0, (xpInLevel / xpNeededForLevel) * 100));
    }, []);

    return {
        calculateLevel,
        calculateNextLevelXP,
        calculateProgress
    };
};
