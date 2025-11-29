import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Moon, Plus, Clock } from 'lucide-react';
import { SleepChart } from './SleepChart';
import { format, subDays } from 'date-fns';

export function Sleep() {
    const { sleepLogs, addSleepLog } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        date: format(new Date(), 'yyyy-MM-dd'),
        hours: 8,
        quality: 'Good'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        await addSleepLog({
            ...formData,
            hours: parseFloat(formData.hours)
        });
        setIsModalOpen(false);
    };

    // Stats Calculation
    const last7Days = sleepLogs
        .filter(l => l.date >= format(subDays(new Date(), 7), 'yyyy-MM-dd'))
        .sort((a, b) => b.date.localeCompare(a.date));

    const avgSleep = last7Days.length > 0
        ? (last7Days.reduce((acc, curr) => acc + curr.hours, 0) / last7Days.length).toFixed(1)
        : 0;

    const goalMetCount = last7Days.filter(l => l.hours >= 8).length;
    const goalPercentage = last7Days.length > 0 ? Math.round((goalMetCount / last7Days.length) * 100) : 0;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Sleep Tracker</h1>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="w-4 h-4" /> Log Sleep
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                        <Moon className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{avgSleep}h</div>
                        <div className="text-sm text-zinc-400">Average (Last 7 Days)</div>
                    </div>
                </Card>

                <Card className="flex items-center gap-4">
                    <div className="p-3 bg-green-500/10 rounded-xl text-green-400">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{goalPercentage}%</div>
                        <div className="text-sm text-zinc-400">8h Goal Met</div>
                    </div>
                </Card>

                <Card className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                        <Moon className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{sleepLogs.length}</div>
                        <div className="text-sm text-zinc-400">Total Entries</div>
                    </div>
                </Card>
            </div>

            {/* Chart */}
            <Card>
                <h3 className="text-xl font-bold text-white mb-6">Sleep Trends (30 Days)</h3>
                <SleepChart logs={sleepLogs} />
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Sleep">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Date</label>
                        <Input
                            type="date"
                            required
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Hours Slept</label>
                        <Input
                            type="number"
                            step="0.5"
                            required
                            value={formData.hours}
                            onChange={e => setFormData({ ...formData, hours: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Save Log</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
