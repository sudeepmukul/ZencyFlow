// Penalty and Hearts System Configuration

export const TASK_PENALTIES = {
    Low: 20,
    Medium: 40,
    High: 80,
};

export const HEARTS_COSTS = {
    habitStreak: 3,
    weekGoal: 10,
    monthGoal: 50,
    sixMonthGoal: 500,
    yearGoal: 1000,
};

// Hearts earned per action
export const HEARTS_REWARDS = {
    taskCompleted: 1,       // 1 heart per task
    habitCompleted: 1,      // 1 heart per habit check
    levelUp: 10,            // 10 hearts per level up
    dailyLogin: 2,          // 2 hearts for daily check-in
};

// Helper to get goal restoration cost based on deadline
export function getGoalHeartsCost(deadline) {
    if (!deadline) return HEARTS_COSTS.monthGoal;

    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffDays = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));

    if (diffDays <= 7) return HEARTS_COSTS.weekGoal;
    if (diffDays <= 30) return HEARTS_COSTS.monthGoal;
    if (diffDays <= 180) return HEARTS_COSTS.sixMonthGoal;
    return HEARTS_COSTS.yearGoal;
}
