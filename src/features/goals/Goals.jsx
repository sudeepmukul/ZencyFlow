import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Modal } from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Input';
import { Plus, Trash2, Edit2, CheckCircle } from 'lucide-react';
import { SEOHead } from '../../components/seo/SEOHead';

export function Goals() {
    const { goals, addGoal, updateGoal, deleteGoal } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const [filter, setFilter] = useState('all');

    const [formData, setFormData] = useState({
        title: '',
        category: 'Personal',
        timeframe: '1 month',
        target: 100,
        current: 0,
    });

    const timeframes = ['1 week', '1 month', '3 months', '6 months', '1 year', '3 years'];
    const categories = ['Personal', 'Work', 'Health', 'Finance', 'Learning'];

    const filteredGoals = goals.filter(g => filter === 'all' || g.timeframe === filter);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const goalData = {
            ...formData,
            progress: Math.round((formData.current / formData.target) * 100),
            completed: formData.current >= formData.target
        };

        if (editingGoal) {
            await updateGoal({ ...editingGoal, ...goalData });
        } else {
            await addGoal(goalData);
        }
        closeModal();
    };

    const openModal = (goal = null) => {
        if (goal) {
            setEditingGoal(goal);
            setFormData({
                title: goal.title,
                category: goal.category,
                timeframe: goal.timeframe,
                target: goal.target,
                current: goal.current,
            });
        } else {
            setEditingGoal(null);
            setFormData({
                title: '',
                category: 'Personal',
                timeframe: '1 month',
                target: 100,
                current: 0,
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingGoal(null);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this goal?')) {
            await deleteGoal(id);
        }
    };

    return (
        <>
            <SEOHead
                title="Goals"
                description="Set and track your personal and professional goals. Measure progress and achieve more."
                path="/goals"
            />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-white to-zinc-500 bg-clip-text text-transparent">Goals</h1>
                    <Button onClick={() => openModal()}>
                        <Plus className="w-4 h-4" /> Add Goal
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    <Button
                        variant={filter === 'all' ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setFilter('all')}
                    >
                        All
                    </Button>
                    {timeframes.map(tf => (
                        <Button
                            key={tf}
                            variant={filter === tf ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => setFilter(tf)}
                        >
                            {tf}
                        </Button>
                    ))}
                </div>

                {/* Goals Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredGoals.map(goal => (
                        <Card key={goal.id} className="group relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-xs font-medium text-neon-400 px-2 py-1 rounded-full bg-neon-400/10 border border-neon-400/20">
                                        {goal.category}
                                    </span>
                                    <h3 className="text-xl font-bold text-white mt-2">{goal.title}</h3>
                                    <p className="text-xs text-zinc-500 mt-1">Created: {new Date(goal.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" onClick={() => openModal(goal)}>
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-400" onClick={() => handleDelete(goal.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">Progress</span>
                                    <span className="text-white font-bold">{goal.current} / {goal.target}</span>
                                </div>
                                <ProgressBar value={goal.progress} />
                            </div>
                        </Card>
                    ))}
                </div>

                <Modal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    title={editingGoal ? "Edit Goal" : "New Goal"}
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">Title</label>
                            <Input
                                required
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. Read 10 books"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1">Category</label>
                                <Select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </Select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1">Timeframe</label>
                                <Select
                                    value={formData.timeframe}
                                    onChange={e => setFormData({ ...formData, timeframe: e.target.value })}
                                >
                                    {timeframes.map(t => <option key={t} value={t}>{t}</option>)}
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1">Target Value</label>
                                <Input
                                    type="number"
                                    required
                                    min="1"
                                    value={formData.target}
                                    onChange={e => setFormData({ ...formData, target: parseInt(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1">Current Value</label>
                                <Input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.current}
                                    onChange={e => setFormData({ ...formData, current: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <Button type="button" variant="ghost" onClick={closeModal}>Cancel</Button>
                            <Button type="submit">Save Goal</Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </>
    );
}
