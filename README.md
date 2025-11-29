# 🌊 ZencyFlow

**ZencyFlow** is a premium, gamified productivity application designed to help you manage your life with style and efficiency. Built with a "local-first" philosophy, it combines powerful task management, habit tracking, and goal setting with a stunning glassmorphic UI and engaging gamification elements.

![ZencyFlow Banner](https://via.placeholder.com/1200x400?text=ZencyFlow+Dashboard+Preview)
*(Replace with actual screenshot)*

---

## 🚀 Features

### 🎮 Gamification
*   **XP System:** Earn Experience Points (XP) for completing tasks, habits, and goals.
*   **Leveling Up:** Progress through levels (Novice, Apprentice, etc.) as you stay productive.
*   **Achievements:** Unlock badges for milestones like "7-Day Streak" or "Task Master".
*   **Visual Progress:** Beautiful progress bars and level indicators on the dashboard.

### ✅ Task Management (To-Do)
*   **Smart Organization:** Categorize tasks, add notes, and set XP values.
*   **Priority System:** Mark tasks as **High**, **Medium**, or **Low** priority with visual color coding.
*   **Due Dates:** Set deadlines and get visual cues for overdue items.
*   **Drag & Drop:** Reorder tasks effortlessly using a smooth drag-and-drop interface.
*   **Sorting:** Sort by Priority (High -> Low) or custom order.

### 🔥 Habit Tracking
*   **Streak System:** Build consistency with streak counters for each habit.
*   **Heatmap:** Visualize your consistency over time with a GitHub-style contribution graph.
*   **Daily Check-ins:** Simple interface to mark habits as done for the day.

### 🎯 Goal Setting
*   **Long-term Tracking:** Define larger goals and break them down into progress percentages.
*   **Visual Feedback:** Watch your goals fill up as you make progress.

### ⏱️ Focus Timer
*   **Productivity Timer:** Track your focused work sessions.
*   **Efficiency Score:** Rate your focus level after each session.
*   **Productive Time:** Dashboard metrics showing total focused hours.

### 📊 Dashboard & Analytics
*   **Productivity Metrics:** Real-time calculation of:
    *   **Today's Productivity:** (Completed / Total Tasks Today)
    *   **Weekly Productivity:** (Completed / Total Tasks This Week)
    *   **Monthly Productivity:** (Completed / Total Tasks This Month)
*   **Sleep Tracking:** Log sleep hours and monitor rest patterns.
*   **Journaling:** Built-in journal to reflect on your day.

### 🔔 Notifications
*   **Smart Reminders:** Browser notifications for:
    *   Daily Summaries (Morning)
    *   Overdue Tasks
    *   Habit Reminders (Evening)
    *   Streak Warnings (Night)

---

## 🛠️ Technology Stack

ZencyFlow is built with a modern, performance-focused stack:

### Frontend Core
*   **[React](https://react.dev/):** UI library for building interactive interfaces.
*   **[Vite](https://vitejs.dev/):** Next-generation frontend tooling for lightning-fast builds.
*   **[React Router](https://reactrouter.com/):** For seamless client-side navigation.

### Styling & UI
*   **[Tailwind CSS](https://tailwindcss.com/):** Utility-first CSS framework for rapid styling.
*   **[Lucide React](https://lucide.dev/):** Beautiful, consistent icon set.
*   **Glassmorphism:** Custom CSS implementation for the premium glass/neon aesthetic.
*   **[Canvas Confetti](https://www.npmjs.com/package/canvas-confetti):** For celebratory effects.

### Data & State
*   **[IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API):** Browser-based NoSQL database for **offline-first** data storage.
*   **[idb](https://www.npmjs.com/package/idb):** Promise-based wrapper for IndexedDB.
*   **React Context API:** For global state management (User data, Tasks, Habits, etc.).

### Utilities
*   **[@dnd-kit](https://dndkit.com/):** Lightweight, performant drag-and-drop toolkit.
*   **[date-fns](https://date-fns.org/):** Modern JavaScript date utility library.
*   **[Recharts](https://recharts.org/):** Composable charting library for React.

---

## 📂 Project Structure

```
zency-flow/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components (Buttons, Cards, Inputs)
│   │   ├── layout/      # Layout components (Sidebar, Main Layout)
│   │   └── ui/          # Generic UI elements
│   ├── contexts/        # Global State (DataContext, UserContext)
│   ├── features/        # Feature-specific code
│   │   ├── dashboard/   # Dashboard logic & UI
│   │   ├── todo/        # Task management
│   │   ├── habits/      # Habit tracking
│   │   ├── goals/       # Goal setting
│   │   ├── timer/       # Focus timer
│   │   ├── journal/     # Journaling
│   │   ├── sleep/       # Sleep tracking
│   │   └── settings/    # App settings
│   ├── lib/             # Utilities (db.js, notifications.js, utils.js)
│   ├── App.jsx          # Main App component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles & Tailwind directives
├── package.json         # Dependencies & Scripts
└── vite.config.js       # Vite configuration
```

---

## 🚀 Getting Started

### Prerequisites
*   **Node.js** (v16 or higher)
*   **npm** or **yarn**

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/zency-flow.git
    cd zency-flow
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Open in Browser:**
    Visit `http://localhost:5173` (or the port shown in your terminal).

---

## 💡 Usage Guide

1.  **First Launch:** You'll start at Level 1. Explore the sidebar to navigate features.
2.  **Add Tasks:** Go to "To-Do", enter a task name, select priority/XP, and hit "Add Task".
3.  **Track Habits:** Go to "Habits", create a new habit, and click the checkbox daily to maintain your streak.
4.  **Start a Timer:** Click the timer widget (bottom right) to start a focus session.
5.  **Check Dashboard:** View your "Today's Productivity" and other stats on the home screen.

---

## 🎨 Customization

*   **Themes:** The app uses a dark-mode centric design with neon accents defined in `tailwind.config.js`.
*   **Data:** All data is stored locally in your browser's IndexedDB. Clearing browser data will reset your progress.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
