import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Input';
import { Plus, Flame, Calendar as CalendarIcon, Edit2, Trash2, Snowflake } from 'lucide-react';
import { HabitGrid } from './HabitGrid';
import { Heatmap } from './Heatmap';
import { MiniHeatmap } from './MiniHeatmap';

import { useUser } from '../../contexts/UserContext';

export function Habits() {
    const { habits, addHabit, updateHabit, deleteHabit, habitLogs } = useData();
    const { user, spendXP, addInventoryItem } = useUser();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        category: 'Health',
        frequency: 'daily',
    });

    const categories = ['Health', 'Productivity', 'Mindfulness', 'Learning', 'Social'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.id) {
            await updateHabit(formData);
        } else {
            await addHabit(formData);
        }
        setIsModalOpen(false);
        setFormData({ title: '', category: 'Health', frequency: 'daily' });
    };

    const handleBuyFreeze = () => {
        if (spendXP(50)) {
            addInventoryItem('streak_freeze');
            alert("❄️ Streak Freeze acquired! It will automatically save your streak if you miss a day.");
        } else {
            alert("Not enough XP! You need 50 XP.");
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Habit Tracker</h1>
                    <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2 text-sm text-cyan-400 bg-cyan-950/30 px-3 py-1 rounded-full border border-cyan-900">
                            <Snowflake className="w-4 h-4" />
                            <span>{user.inventory?.streak_freeze || 0} Freezes</span>
                        </div>
                        <Button size="sm" variant="secondary" onClick={handleBuyFreeze} className="h-7 text-xs">
                            Buy Freeze (50 XP)
                        </Button>
                    </div>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="w-4 h-4" /> New Habit
                </Button>
            </div>

            {/* Weekly Tracker */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-zinc-300 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" /> Weekly Progress
                </h2>
                <div className="grid gap-4">
                    {habits.map(habit => (
                        <div key={habit.id} className="space-y-2">
                            <div className="flex justify-between items-center pr-4">
                                <div className="flex-1">
                                    <HabitGrid habit={habit} logs={habitLogs} />
                                </div>
                                <div className="flex flex-col gap-2 ml-2">
                                    <Button variant="ghost" size="icon" onClick={() => {
                                        setFormData({ ...habit });
                                        setIsModalOpen(true);
                                    }}>
                                        <Edit2 className="w-4 h-4 text-zinc-400" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => deleteHabit(habit.id)}>
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                </div>
                            </div>
                            <div className="pl-4 pr-4 pb-4">
                                <div className="text-xs text-zinc-500 mb-1">Last 90 Days Consistency</div>
                                <MiniHeatmap habitId={habit.id} logs={habitLogs} />
                            </div>
                        </div>
                    ))}
                    {habits.length === 0 && (
                        <div className="text-center py-10 text-zinc-500 bg-zinc-900/30 rounded-xl border border-zinc-800 border-dashed">
                            No habits yet. Start building your streak!
                        </div>
                    )}
                </div>
            </div>

            {/* Yearly Heatmap (Placeholder for now, or simple implementation) */}
            {habits.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-zinc-300 flex items-center gap-2">
                        <Flame className="w-5 h-5 text-orange-500" /> Overall Consistency
                    </h2>
                    <Card>
                        <Heatmap logs={habitLogs} />
                    </Card>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={formData.id ? "Edit Habit" : "New Habit"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Habit Title</label>
                        <Input
                            required
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Morning Meditation"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Category</label>
                        <Select
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                        >
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </Select>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Create Habit</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
