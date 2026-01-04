# 🌊 ZencyFlow

**ZencyFlow** is a premium, gamified productivity ecosystem designed to help you master your flow. It combines advanced task management, habit tracking, and calendar scheduling with a stunning "Neon Glass" aesthetic.

> **Now with Cloud Sync!** seamlessly switch between your laptop and phone while keeping your data in sync using Google Authentication.

![ZencyFlow Dashboard](public/screenshot.png) 
*(Note: Add a screenshot here locally if you have one)*

---

## 🚀 Key Features

### ☁️ Cloud Sync & Offline-First
*   **Cross-Device Sync:** Log in with Google to sync your Tasks, Habits, XP, and more across all your devices.
*   **Offline Support:** Works seamlessly without internet detailed. Data syncs automatically when you go back online.
*   **Data Control:** Manual "Force Sync" option in Settings for peace of mind.

### 🎮 Gamification (The Zencia System)
*   **Zencia Dragon:** Your personal productivity companion that grows and evolves as you earn XP.
*   **Rewards Shop:** Redeeming your hard-earned XP for custom rewards (e.g., "1 Hour Gaming", "Cheat Meal").
*   **Leveling System:** Climb from "Novice" to "Grandmaster".
*   **Badges:** Unlock achievements for streaks and milestones.

### 📅 Advanced Calendar
*   **Unified View:** See your **Quests** (Tasks) and **Reminders** in a unified weekly/monthly grid.
*   **Drag & Drop:** Reschedule tasks effortlessly by dragging them to new dates.
*   **Layers:** Toggle visibility for different categories (Work, Personal, Habits).
*   **Smart Creation:** Click any date to instantly add a new Quest or Reminder.

### ✅ Task Management
*   **Focus Metrics:** Track "Total vs Efficient" hours with a visual breakdown.
*   **Subtasks:** Break complex tasks into smaller, manageable chunks.
*   **Priority Matrix:** High/Medium/Low priority styling with visual indicators.
*   **Recurring Tasks:** Set tasks to repeat Daily, Weekly, or Monthly.

### 🔥 Habit Mastery
*   **Consistency Heatmap:** GitHub-style contribution graph showing your daily momentum.
*   **Streak Protection:** Use "Streak Freezes" (purchased with XP) to save your streaks on busy days.
*   **Detailed Analytics:** View completion rates and longest streaks per habit.

---

## 🛠️ Tech Stack

ZencyFlow is built with a modern, performance-obsessed stack:

### Core Framework
*   **[React 18](https://react.dev/)**: The library for web and native user interfaces.
*   **[Vite](https://vitejs.dev/)**: Next-generation frontend tooling.
*   **[React Router 6](https://reactrouter.com/)**: Client-side routing.

### Backend & Data
*   **[Firebase](https://firebase.google.com/)**:
    *   **Authentication**: Secure Google Sign-In.
    *   **Firestore**: Real-time NoSQL cloud database.
    *   **Hosting**: Fast, secure global hosting.
*   **[IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)** + **[idb](https://www.npmjs.com/package/idb)**: Robust local-first data storage.

### UI & Animation
*   **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first styling.
*   **[Framer Motion](https://www.framer.com/motion/)**: Production-ready animation library (used for Zencia widget, page transitions).
*   **[Lucide React](https://lucide.dev/)**: Beautiful, consistent icons.
*   **[Recharts](https://recharts.org/)**: Data visualization for dashboard metrics.
*   **[dnd-kit](https://dndkit.com/)**: Modern drag-and-drop toolkit.

---

## 📂 Project Structure

```bash
src/
├── components/      # Reusable UI (Buttons, Cards, Modals)
├── contexts/        # Global State (Auth, Data, User)
├── features/        # Feature Modules
│   ├── dashboard/   # Productivity Dashboard & Widgets
│   ├── calendar/    # Full Calendar Implementation
│   ├── rewards/     # Gamification & Shop
│   ├── habits/      # Habit Tracking & Heatmap
│   └── ...
├── lib/             # Utilities & Firebase Config
└── assets/          # Images & Static Files
```

---

## 🚀 Getting Started

1.  **Clone the repo:**
    ```bash
    git clone https://github.com/sudeepmukul/ZencyFlow.git
    cd ZencyFlow
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run locally:**
    ```bash
    npm run dev
    ```

4.  **Build for production:**
    ```bash
    npm run build
    ```

### Firebase Setup (Optional for Forking)
If you want to host your own version:
1.  Create a project in [Firebase Console](https://console.firebase.google.com/).
2.  Enable **Authentication** (Google Provider) and **Firestore**.
3.  Copy your config keys to `src/lib/firebase.js` (or use environment variables).
4.  Deploy: `firebase deploy`.

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request for any features or bug fixes.

---

## 📜 License

MIT License. Built with ❤️ for productivity enthusiasts.
