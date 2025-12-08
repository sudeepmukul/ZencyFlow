import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useUser } from '../../contexts/UserContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Trash2, Download, Upload, AlertTriangle, Plus, Clock, Bell, Award } from 'lucide-react';
import { NotificationManager } from '../../lib/notifications';
import { Badges } from '../profile/Badges';
import { db } from '../../lib/db';

export function Settings() {
    const { user, updateProfile } = useUser();
    const {
        goals, habits, tasks, sleepLogs, journalEntries, categories,
        addCategory, deleteCategory, refreshData,
        timerSettings, updateTimerSettings
    } = useData();

    const [importFile, setImportFile] = useState(null);
    const [newName, setNewName] = useState(user.name);
    const [newCategory, setNewCategory] = useState('');

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        await updateProfile({ name: newName });
        alert('Profile updated!');
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (newCategory.trim()) {
            await addCategory(newCategory.trim());
            setNewCategory('');
        }
    };

    const handleExport = async () => {
        const data = {
            user,
            goals,
            habits,
            tasks,
            sleepLogs,
            journalEntries,
            categories,
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `zency-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImport = async () => {
        if (!importFile) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);

                if (window.confirm('This will overwrite your current data. Are you sure?')) {
                    if (data.user) await db.put('user', data.user);
                    if (data.goals) for (const g of data.goals) await db.put('goals', g);
                    if (data.habits) for (const h of data.habits) await db.put('habits', h);
                    if (data.tasks) for (const t of data.tasks) await db.put('tasks', t);
                    if (data.sleepLogs) for (const s of data.sleepLogs) await db.put('sleep_logs', s);
                    if (data.journalEntries) for (const j of data.journalEntries) await db.put('journal_entries', j);
                    if (data.categories) for (const c of data.categories) await db.put('categories', c);

                    await refreshData();
                    alert('Data imported successfully! Please refresh the page.');
                    window.location.reload();
                }
            } catch (err) {
                console.error(err);
                alert('Failed to import data. Invalid JSON.');
            }
        };
        reader.readAsText(importFile);
    };

    const handleClearAll = async () => {
        if (window.confirm('DANGER: This will permanently delete ALL your data. This cannot be undone. Are you sure?')) {
            const req = indexedDB.deleteDatabase('ZencyDB');
            req.onsuccess = () => {
                alert('All data cleared. The app will reload.');
                window.location.reload();
            };
            req.onerror = () => {
                alert('Failed to delete database.');
            };
        }
    };

    const handleMonthlyArchive = async () => {
        if (!window.confirm('This will:\n1. Export all your current data as a backup\n2. Reset: Tasks, Journal, Sleep logs, Habit logs, XP, and Level\n3. Keep: Goals, Habits, Profile, and Categories\n\nContinue?')) {
            return;
        }

        try {
            // Step 1: Export current data
            const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
            const archiveData = {
                user,
                goals,
                habits,
                tasks,
                sleepLogs,
                journalEntries,
                categories,
                habitLogs: await db.getAll('habit_logs'),
                archivedAt: new Date().toISOString(),
                month: currentMonth
            };

            const blob = new Blob([JSON.stringify(archiveData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `zency-archive-${currentMonth}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Step 2: Clear ONLY tasks, journal, sleep, and habit logs
            // PRESERVE: Goals, Habits, User Profile, Categories
            const allTasks = await db.getAll('tasks');
            const allSleep = await db.getAll('sleep_logs');
            const allJournal = await db.getAll('journal_entries');
            const allHabitLogs = await db.getAll('habit_logs');

            for (const t of allTasks) await db.delete('tasks', t.id);
            for (const s of allSleep) await db.delete('sleep_logs', s.date);
            for (const j of allJournal) await db.delete('journal_entries', j.id);
            for (const hl of allHabitLogs) await db.delete('habit_logs', hl.id);

            // Reset habit streaks to 0 since we're clearing logs
            const allHabits = await db.getAll('habits');
            for (const habit of allHabits) {
                await db.put('habits', { ...habit, streak: 0 });
            }

            // Reset XP and Level to 0 for fresh monthly start
            const resetUser = {
                ...user,
                xp: 0,
                level: 0
            };
            await db.put('user', resetUser);

            await refreshData();
            alert(`✅ Monthly archive created: zency-archive-${currentMonth}.json\n\nReset complete!\n✅ Kept: Goals, Habits, Profile\n🔄 Reset: Tasks, Journal, Sleep, Habit streaks, XP, Level`);
            window.location.reload();
        } catch (error) {
            console.error('Archive failed:', error);
            alert('Failed to create monthly archive. Please try again.');
        }
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-white to-zinc-500 bg-clip-text text-transparent">Settings</h1>

            {/* Profile Settings */}
            <Card>
                <h2 className="text-xl font-bold text-white mb-6">Profile</h2>
                <form onSubmit={handleUpdateProfile} className="flex gap-4 items-end mb-8">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Display Name</label>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-400"
                        />
                    </div>
                    <Button type="submit">Save Changes</Button>
                </form>

                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-500" /> Achievements
                </h3>
                <Badges userBadges={user.badges || []} />
            </Card>

            {/* Category Management */}
            <Card>
                <h2 className="text-xl font-bold text-white mb-6">Categories</h2>
                <div className="space-y-4">
                    <form onSubmit={handleAddCategory} className="flex gap-4">
                        <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="New category name..."
                            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-400"
                        />
                        <Button type="submit"><Plus className="w-4 h-4" /> Add</Button>
                    </form>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {categories.map(cat => (
                            <div key={cat.id} className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                                <span className="text-zinc-300">{cat.name}</span>
                                <button onClick={() => deleteCategory(cat.id)} className="text-zinc-500 hover:text-red-500">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        {categories.length === 0 && <div className="text-zinc-500 text-sm col-span-full">No custom categories added.</div>}
                    </div>
                </div>
            </Card>

            {/* Data Summary */}
            <Card>
                <h2 className="text-xl font-bold text-white mb-4">Data Overview</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800 text-center">
                        <div className="text-2xl font-bold text-neon-400">{goals.length}</div>
                        <div className="text-xs text-zinc-500 uppercase">Goals</div>
                    </div>
                    <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800 text-center">
                        <div className="text-2xl font-bold text-neon-400">{habits.length}</div>
                        <div className="text-xs text-zinc-500 uppercase">Habits</div>
                    </div>
                    <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800 text-center">
                        <div className="text-2xl font-bold text-neon-400">{tasks.length}</div>
                        <div className="text-xs text-zinc-500 uppercase">Tasks</div>
                    </div>
                    <div className="p-4 bg-zinc-900 rounded-lg border border-zinc-800 text-center">
                        <div className="text-2xl font-bold text-neon-400">{journalEntries.length}</div>
                        <div className="text-xs text-zinc-500 uppercase">Entries</div>
                    </div>
                </div>
            </Card>

            {/* Timer Settings */}
            <Card>
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-neon-400" /> Timer Settings
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Efficiency Multiplier</label>
                        <p className="text-xs text-zinc-500 mb-2">How much of your tracked time counts as "productive". (0.6 = 60%)</p>
                        <div className="flex gap-2">
                            {[0.5, 0.6, 0.7, 0.8, 0.9, 1.0].map(val => (
                                <Button
                                    key={val}
                                    size="sm"
                                    variant={timerSettings?.efficiency === val ? 'primary' : 'secondary'}
                                    onClick={() => updateTimerSettings({ efficiency: val })}
                                >
                                    {val * 100}%
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Check-in Interval</label>
                        <p className="text-xs text-zinc-500 mb-2">How often to verify you are still working.</p>
                        <div className="flex gap-2">
                            {[15, 30, 45, 60].map(val => (
                                <Button
                                    key={val}
                                    size="sm"
                                    variant={timerSettings?.checkInInterval === val ? 'primary' : 'secondary'}
                                    onClick={() => updateTimerSettings({ checkInInterval: val })}
                                >
                                    {val}m
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Notification Settings */}
            <Card>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-neon-400" />
                    Notifications
                </h2>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-medium text-white">Browser Notifications</h3>
                        <p className="text-sm text-zinc-400">Get reminders for habits and streaks.</p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={async () => {
                            const granted = await NotificationManager.requestPermission();
                            if (granted) {
                                new Notification("Notifications Enabled! 🔔", {
                                    body: "You'll now receive reminders to stay on track.",
                                    icon: '/vite.svg'
                                });
                            } else {
                                alert("Please enable notifications in your browser settings.");
                            }
                        }}
                    >
                        Enable Notifications
                    </Button>
                </div>
            </Card>

            {/* Data Management */}
            <Card>
                <h2 className="text-xl font-bold text-white mb-6">Data Management</h2>

                <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
                        <div>
                            <h3 className="font-bold text-white">Export Data</h3>
                            <p className="text-sm text-zinc-400">Download a backup of all your data as JSON.</p>
                        </div>
                        <Button onClick={handleExport}>
                            <Download className="w-4 h-4" /> Export
                        </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                        <div>
                            <h3 className="font-bold text-white flex items-center gap-2">
                                📦 Monthly Archive
                            </h3>
                            <p className="text-sm text-zinc-400">Export & reset for new month (keeps Goals & Habits only)</p>
                        </div>
                        <Button onClick={handleMonthlyArchive} variant="primary">
                            Archive & Reset
                        </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
                        <div>
                            <h3 className="font-bold text-white">Import Data</h3>
                            <p className="text-sm text-zinc-400">Restore your data from a backup file.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="file"
                                accept=".json"
                                onChange={(e) => setImportFile(e.target.files[0])}
                                className="text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700"
                            />
                            <Button onClick={handleImport} disabled={!importFile}>
                                <Upload className="w-4 h-4" /> Import
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-red-500/5 rounded-lg border border-red-500/20">
                        <div>
                            <h3 className="font-bold text-red-500 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" /> Danger Zone
                            </h3>
                            <p className="text-sm text-red-400/70">Permanently delete all your data and reset the app.</p>
                        </div>
                        <Button variant="danger" onClick={handleClearAll}>
                            <Trash2 className="w-4 h-4" /> Clear All Data
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
