import React from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { Button } from '../../components/ui/Button';
import { Bell, Calendar, Clock, Flame, ToggleLeft, ToggleRight, CheckCircle2 } from 'lucide-react';

// Toggle switch component
const Toggle = ({ enabled, onChange, label, description }) => (
    <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors">
        <div className="flex-1">
            <h4 className="font-medium text-white text-sm">{label}</h4>
            {description && <p className="text-xs text-zinc-500 mt-0.5">{description}</p>}
        </div>
        <button
            onClick={onChange}
            className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? 'bg-neon-400' : 'bg-zinc-700'}`}
        >
            <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
            />
        </button>
    </div>
);

export function NotificationSettings() {
    const {
        notificationSettings,
        updateNotificationSettings,
        enableNotifications,
        isEnabled
    } = useNotifications();

    const handleEnableNotifications = async () => {
        const success = await enableNotifications();
        if (!success) {
            alert("Please enable notifications in your browser settings and try again.");
        }
    };

    // If master switch is off (or not granted permission)
    if (!notificationSettings.enabled) {
        return (
            <div className="space-y-4">
                <div className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-800 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-neon-400/10 flex items-center justify-center">
                        <Bell className="w-6 h-6 text-neon-400" />
                    </div>
                    <h3 className="font-bold text-white mb-2">Stay on Track</h3>
                    <p className="text-sm text-zinc-400 mb-4">
                        Enable notifications to receive reminders for tasks, habits, and more.
                    </p>
                    <Button variant="primary" onClick={handleEnableNotifications}>
                        <Bell className="w-4 h-4" />
                        Enable Notifications
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Status Badge */}
            <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-xs font-medium text-green-400">Notifications Active</span>
                </div>
            </div>

            {/* Individual Toggles */}
            <div className="space-y-2">
                <Toggle
                    enabled={notificationSettings.reminders}
                    onChange={() => updateNotificationSettings({ reminders: !notificationSettings.reminders })}
                    label="Reminder Notifications"
                    description="Get notified when reminders are due"
                />

                <Toggle
                    enabled={notificationSettings.taskSchedules}
                    onChange={() => updateNotificationSettings({ taskSchedules: !notificationSettings.taskSchedules })}
                    label="Task Schedules"
                    description="Alerts when scheduled tasks are due"
                />

                <Toggle
                    enabled={notificationSettings.timerCheckIns}
                    onChange={() => updateNotificationSettings({ timerCheckIns: !notificationSettings.timerCheckIns })}
                    label="Timer Check-Ins"
                    description="Periodic prompts while focusing"
                />

                <Toggle
                    enabled={notificationSettings.streakReminders}
                    onChange={() => updateNotificationSettings({ streakReminders: !notificationSettings.streakReminders })}
                    label="Streak Reminders"
                    description="Evening alerts for habits at risk"
                />
            </div>

            {/* Streak Reminder Time */}
            {notificationSettings.streakReminders && (
                <div className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                        <Flame className="w-4 h-4 inline mr-1.5 text-orange-400" />
                        Streak Reminder Time
                    </label>
                    <div className="flex gap-2 flex-wrap">
                        {[18, 19, 20, 21, 22].map(hour => {
                            const label = hour > 12 ? `${hour - 12} PM` : `${hour} PM`;
                            const isSelected = notificationSettings.streakReminderHour === hour;
                            return (
                                <Button
                                    key={hour}
                                    size="sm"
                                    variant={isSelected ? 'primary' : 'secondary'}
                                    onClick={() => updateNotificationSettings({ streakReminderHour: hour })}
                                    className="min-w-[60px]"
                                >
                                    {label}
                                </Button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Test Button */}
            <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <p className="text-xs text-blue-400 mb-2">Debug: Test if notifications work</p>
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                        console.log('[Test] Attempting to create notification...');
                        console.log('[Test] Notification.permission =', Notification?.permission);
                        try {
                            const n = new Notification("Test Notification 🧪", {
                                body: "If you see this, notifications work!",
                                icon: '/favicon.svg'
                            });
                            console.log('[Test] Notification created:', n);
                        } catch (e) {
                            console.error('[Test] Failed:', e);
                            alert('Failed: ' + e.message);
                        }
                    }}
                >
                    Send Test Notification
                </Button>
            </div>

            {/* Disable Button */}
            <div className="pt-2 border-t border-zinc-800">
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-zinc-500 hover:text-red-400"
                    onClick={() => updateNotificationSettings({ enabled: false })}
                >
                    Disable All Notifications
                </Button>
            </div>
        </div>
    );
}
