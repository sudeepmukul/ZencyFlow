# ZencyFlow - Auto-Archive & Monthly Archive Features

## ✅ Feature 1: Auto-Archive Completed Tasks (4 Days)

### How It Works
- **Automatic Cleanup**: Every time data is refreshed, the system automatically deletes completed tasks that are older than 4 days
- **Runs On**: App startup, data refresh, and any CRUD operation
- **What Gets Deleted**: Only tasks with `status === 'completed'` and `completedAt` date older than 4 days
- **What's Preserved**: Active/pending tasks are never deleted

### Example Timeline
```
Day 1: Complete "Buy groceries" → Task shows in "Completed Today"
Day 2-4: Task still visible in completed section
Day 5: Task is automatically deleted from database
```

### Benefits
- Keeps your database clean
- Prevents performance issues from accumulating thousands of old tasks
- Recent completed tasks (last 4 days) remain visible for reference

---

## ✅ Feature 2: Monthly Archive

### Location
**Settings Tab** → **Data Management** → **📦 Monthly Archive**

### What It Does
When you click "Archive & Reset", the system:

1. **Exports Everything** 📦
   - Creates a JSON backup file: `zency-archive-YYYY-MM.json`
   - Contains ALL your data from the current month:
     - Goals
     - Habits & Habit Logs
     - Tasks
     - Sleep Logs
     - Journal Entries
     - Categories
     - User Profile (XP, Level, Name)

2. **Resets for New Month** 🔄
   - Deletes all goals, habits, tasks, sleep logs, journal entries, and habit logs
   - **PRESERVES**: Your XP, Level, and Profile settings
   - Gives you a clean slate for the new month

3. **Confirmation** ⚠️
   - Shows a clear confirmation dialog explaining what will happen
   - Requires explicit user approval

### File Naming Convention
```
zency-archive-2025-11.json  (November 2025)
zency-archive-2025-12.json  (December 2025)
zency-archive-2026-01.json  (January 2026)
```

### Recommended Monthly Workflow

#### End of Month (e.g., November 30th)
1. Go to **Settings** → **Data Management**
2. Click **"Archive & Reset"**
3. Confirm the action
4. File `zency-archive-2025-11.json` is downloaded
5. All data is cleared, XP/Level preserved
6. Start fresh for December!

#### Reviewing Past Months
1. **Save Current Month First**: Export or Archive current data
2. **Import Old Month**: Settings → Import → Select `zency-archive-2025-11.json`
3. **Review**: Browse your old goals, habits, journal entries
4. **Restore Current**: Import your current month backup to return to present

### What's Preserved vs. Reset

| Data Type | After Monthly Archive |
|-----------|----------------------|
| **XP** | ✅ Preserved |
| **Level** | ✅ Preserved |
| **Profile Name** | ✅ Preserved |
| **Goals** | ❌ Reset |
| **Habits** | ❌ Reset |
| **Habit Logs** | ❌ Reset |
| **Tasks** | ❌ Reset |
| **Sleep Logs** | ❌ Reset |
| **Journal Entries** | ❌ Reset |
| **Categories** | ✅ Preserved |

---

## 💡 Pro Tips

### Organizing Archives
Create a folder structure:
```
Documents/
  ZencyFlow Archives/
    2025/
      zency-archive-2025-11.json
      zency-archive-2025-12.json
    2026/
      zency-archive-2026-01.json
```

### Backup Strategy
- **Monthly**: Use Monthly Archive feature
- **Weekly**: Use regular Export for safety
- **Before Major Changes**: Always export first

### Reviewing Progress
To compare multiple months:
1. Keep a spreadsheet tracking key metrics from each archive
2. Or use a JSON viewer to compare archive files side-by-side

---

## 🔧 Technical Details

### Auto-Archive Implementation
- Location: `src/contexts/DataContext.jsx` → `refreshData()` function
- Runs automatically on every data refresh
- Uses date comparison: `new Date(task.completedAt) < fourDaysAgo`

### Monthly Archive Implementation
- Location: `src/features/settings/Settings.jsx` → `handleMonthlyArchive()` function
- Creates blob download for backup
- Iterates through all data stores and deletes entries
- Preserves user profile in database

### Data Storage
- **Database**: IndexedDB (browser local storage)
- **Stores**: `goals`, `habits`, `tasks`, `sleep_logs`, `journal_entries`, `habit_logs`, `categories`, `user`
- **Persistence**: Survives browser restarts, not cleared by cache clearing (unless explicitly deleted)
