import React, { useState, useRef } from 'react';
import { useData } from '../../contexts/DataContext';
import { useUser } from '../../contexts/UserContext';
import { db } from '../../lib/db';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Download, Upload, CheckCircle, Database, X, Loader2 } from 'lucide-react';

export function DataMigrationModal({ isOpen, onClose }) {
    const {
        tasks, habits, goals, habitLogs, sleepLogs, journalEntries,
        timerLogs, rewards, rewardHistory, reminders, categories,
        refreshData
    } = useData();
    const { user, addXP } = useUser();

    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importStats, setImportStats] = useState(null);
    const [mergeXP, setMergeXP] = useState(false); // Default to false to prevent accidental XP duplication
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const exportData = {
                version: 1,
                timestamp: new Date().toISOString(),
                userProfile: {
                    xp: user.xp,
                    level: user.level,
                    name: user.name || 'User'
                },
                collections: {
                    tasks,
                    habits,
                    goals,
                    habit_logs: habitLogs,
                    sleep_logs: sleepLogs,
                    journal_entries: journalEntries,
                    timer_logs: timerLogs,
                    reminders,
                    categories,
                    rewards,
                    reward_history: rewardHistory
                }
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `zency-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Export failed:", error);
            alert("Failed to export data. See console for details.");
        } finally {
            setIsExporting(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = JSON.parse(event.target.result);
                await processImport(data);
            } catch (err) {
                console.error("Invalid JSON:", err);
                alert("Invalid file format.");
            }
        };
        reader.readAsText(file);
    };

    const processImport = async (data) => {
        setIsImporting(true);
        setImportStats(null);

        try {
            // Support both nested 'collections' and flat structure (legacy exports)
            const source = data.collections || data;

            const stats = {
                tasks: 0,
                habits: 0,
                logs: 0,
                other: 0,
                xpAdded: 0
            };

            const safeAddOrUpdate = async (storeName, item) => {
                try {
                    // Ensure item has an ID or date
                    if (!item.id && !item.date) return false;
                    const id = item.id || item.date;

                    // First check: exact ID match
                    let existing = await db.get(storeName, id);

                    // Second check: for specific stores, check by unique content to prevent duplicates
                    if (!existing) {
                        const allItems = await db.getAll(storeName);

                        if (storeName === 'sleep_logs') {
                            // Check by date - only one sleep log per day
                            existing = allItems.find(i => i.date === item.date);
                        } else if (storeName === 'habit_logs') {
                            // Check by habitId + date combo - one log per habit per day
                            existing = allItems.find(i => i.habitId === item.habitId && i.date === item.date);
                        } else if (storeName === 'journal_entries') {
                            // Check by date - one entry per day
                            existing = allItems.find(i => i.date === item.date);
                        } else if (storeName === 'tasks') {
                            // Check by title + createdAt (same task created at same time = duplicate)
                            existing = allItems.find(i => i.title === item.title && i.createdAt === item.createdAt);
                        } else if (storeName === 'habits') {
                            // Check by title - same habit name = same habit
                            existing = allItems.find(i => i.title === item.title);
                        }
                    }

                    if (!existing) {
                        // New record - add it
                        await db.add(storeName, item);
                        return 'added';
                    } else {
                        // Existing record - only update if imported has better/newer data
                        const existingDate = existing.updatedAt ? new Date(existing.updatedAt) : new Date(0);
                        const importedDate = item.updatedAt ? new Date(item.updatedAt) : new Date(0);

                        // For habits: update if longestStreak is higher
                        // For others: update only if imported is strictly newer
                        const shouldUpdate =
                            (storeName === 'habits' && (item.longestStreak || 0) > (existing.longestStreak || 0)) ||
                            (storeName !== 'habits' && importedDate > existingDate);

                        if (shouldUpdate) {
                            await db.put(storeName, { ...existing, ...item, id: existing.id || id });
                            return 'updated';
                        }
                        return 'skipped'; // Already exists, no update needed
                    }
                } catch (e) {
                    console.warn(`Failed to import ${storeName} item`, item, e);
                    return false;
                }
            };

            // Map store names to potential keys in the JSON (snake_case and camelCase)
            const mappings = {
                tasks: ['tasks'],
                habits: ['habits'],
                goals: ['goals'],
                habit_logs: ['habit_logs', 'habitLogs'],
                sleep_logs: ['sleep_logs', 'sleepLogs'],
                journal_entries: ['journal_entries', 'journalEntries'],
                timer_logs: ['timer_logs', 'timerLogs'],
                reminders: ['reminders'],
                categories: ['categories'],
                rewards: ['rewards'],
                reward_history: ['reward_history', 'rewardHistory']
            };

            // Iterate over stores and find matching data
            for (const [storeName, keys] of Object.entries(mappings)) {
                let items = [];
                for (const key of keys) {
                    if (source[key] && Array.isArray(source[key])) {
                        items = source[key];
                        break;
                    }
                }

                if (items.length > 0) {
                    for (const item of items) {
                        const result = await safeAddOrUpdate(storeName, item);
                        if (result === 'added' || result === 'updated') {
                            if (storeName === 'tasks') stats.tasks++;
                            else if (storeName === 'habits') stats.habits++;
                            else if (storeName.includes('logs')) stats.logs++;
                            else stats.other++;
                        }
                    }
                }
            }

            // Handle User Profile / XP
            const profile = data.userProfile || data.user;
            if (mergeXP && profile && profile.xp) {
                const importedXP = parseInt(profile.xp) || 0;
                if (importedXP > 0) {
                    await addXP(importedXP);
                    stats.xpAdded = importedXP;
                }
            }

            await refreshData();

            setImportStats(stats);
            alert(`Import Complete!\nAdded: ${stats.tasks} Tasks, ${stats.habits} Habits, ${stats.logs} Logs.\nXP Added: ${stats.xpAdded}`);
            onClose();

        } catch (error) {
            console.error("Import error:", error);
            alert("Error importing data: " + error.message);
        } finally {
            setIsImporting(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 p-6 relative">
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-4 hover:bg-zinc-800"
                    onClick={onClose}
                >
                    <X className="w-5 h-5 text-zinc-500" />
                </Button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-full bg-neon-400/10">
                        <Database className="w-6 h-6 text-neon-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Data Migration</h2>
                        <p className="text-xs text-zinc-400">Import or Export your Zency Flow data</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Export Section */}
                    <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50 space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-zinc-200">Export Backup</h3>
                            <Download className="w-4 h-4 text-zinc-500" />
                        </div>
                        <p className="text-xs text-zinc-500">
                            Create a JSON file of your current data. Useful for moving strictly local data to a new device or account.
                        </p>
                        <Button
                            className="w-full bg-zinc-700 hover:bg-zinc-600 border border-zinc-600"
                            onClick={handleExport}
                            disabled={isExporting}
                        >
                            {isExporting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                            {isExporting ? "Exporting..." : "Download Backup"}
                        </Button>
                    </div>

                    {/* Import Section */}
                    <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50 space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-zinc-200">Import Data</h3>
                            <Upload className="w-4 h-4 text-zinc-500" />
                        </div>
                        <p className="text-xs text-zinc-500">
                            Merge data from a backup file. Existing records will be skipped (not overwritten).
                        </p>

                        <div className="flex items-center gap-2 mb-2">
                            <input
                                type="checkbox"
                                id="mergeXP"
                                checked={mergeXP}
                                onChange={e => setMergeXP(e.target.checked)}
                                className="rounded border-zinc-600 bg-zinc-900/50 text-neon-400 focus:ring-neon-400/50"
                            />
                            <label htmlFor="mergeXP" className="text-xs text-zinc-300">
                                Add imported XP to my current XP
                            </label>
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept="application/json"
                            className="hidden"
                        />
                        <Button
                            className="w-full bg-neon-400 hover:bg-neon-300 text-black font-bold"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isImporting}
                        >
                            {isImporting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                            {isImporting ? "Importing..." : "Select Backup File"}
                        </Button>
                    </div>

                    {importStats && (
                        <div className="p-3 rounded-lg bg-green-400/10 border border-green-500/20 flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-green-400">Import Successful!</p>
                                <p className="text-[10px] text-green-400/80">
                                    Added {importStats.tasks} tasks, {importStats.habits} habits.
                                    {importStats.xpAdded > 0 && ` Gained +${importStats.xpAdded} XP.`}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
