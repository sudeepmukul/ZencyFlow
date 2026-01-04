import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Edit2, Check, Upload, Trash2, ChevronRight, Plus, Sparkles, Link, Image } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

const NEON_YELLOW = '#fbff00';

// Default category icons/emojis
const DEFAULT_ICONS = {
    'Work': '💼',
    'Personal': '🏠',
    'Health': '❤️',
    'Learning': '📚',
    'Finance': '💰',
    'Social': '👥',
    'Creative': '🎨',
    'General': '📌'
};

export function CategoryManagerModal({ isOpen, onClose, tasks }) {
    const { categories, updateCategory, deleteCategory, addCategory } = useData();
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editImage, setEditImage] = useState('');
    const [imageInputMode, setImageInputMode] = useState('url'); // 'url' or 'file'
    const [newCategoryName, setNewCategoryName] = useState('');
    const [timeFilter, setTimeFilter] = useState('month'); // 'month' or 'all'
    const fileInputRef = useRef(null);

    // Lock scroll when open
    useEffect(() => {
        const mainContent = document.getElementById('main-content');
        if (isOpen && mainContent) {
            mainContent.style.overflow = 'hidden';
        }
        return () => {
            if (mainContent) mainContent.style.overflow = '';
        };
    }, [isOpen]);

    // Get current month/year for filtering
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Calculate XP per category with time filter
    const categoryStats = useMemo(() => {
        const stats = {};

        // Initialize from custom categories
        categories.forEach(cat => {
            stats[cat.name] = {
                xp: 0,
                tasks: [],
                id: cat.id,
                image: cat.image || null,
                icon: cat.icon || DEFAULT_ICONS[cat.name] || '📁'
            };
        });

        // Aggregate from completed tasks
        tasks.forEach(task => {
            if (task.status === 'completed' && task.category) {
                // Apply time filter
                if (timeFilter === 'month' && task.completedAt) {
                    const completedDate = new Date(task.completedAt);
                    if (completedDate.getMonth() !== currentMonth || completedDate.getFullYear() !== currentYear) {
                        return; // Skip tasks not from this month
                    }
                }

                if (!stats[task.category]) {
                    stats[task.category] = {
                        xp: 0,
                        tasks: [],
                        id: null,
                        icon: DEFAULT_ICONS[task.category] || '📁'
                    };
                }
                stats[task.category].xp += task.xpValue || 20;
                stats[task.category].tasks.push(task);
            }
        });

        return stats;
    }, [categories, tasks, timeFilter, currentMonth, currentYear]);

    const handleStartEdit = (catName) => {
        const cat = categories.find(c => c.name === catName);
        setEditingId(cat?.id || catName);
        setEditName(catName);
        setEditImage(cat?.image || '');
        setImageInputMode('url');
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditImage(reader.result); // Base64 data URL
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveEdit = async () => {
        const cat = categories.find(c => c.id === editingId || c.name === editingId);
        if (cat) {
            await updateCategory({ ...cat, name: editName, image: editImage || null });
        }
        setEditingId(null);
        setEditName('');
        setEditImage('');
    };

    const handleDeleteCategory = async (catId) => {
        if (window.confirm('Delete this category? Tasks will keep their category label but it won\'t appear in settings.')) {
            await deleteCategory(catId);
        }
    };

    const handleAddCategory = async () => {
        if (newCategoryName.trim()) {
            await addCategory(newCategoryName.trim());
            setNewCategoryName('');
        }
    };

    if (!isOpen) return null;

    // Month name for display
    const monthName = now.toLocaleString('default', { month: 'long' });

    // Detail view for selected category
    if (selectedCategory) {
        const catData = categoryStats[selectedCategory] || { xp: 0, tasks: [] };
        return createPortal(
            <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md overflow-y-auto">
                <div className="min-h-full flex flex-col">
                    {/* Fixed Header */}
                    <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-white/5 p-4 md:px-8">
                        <div className="max-w-4xl mx-auto flex items-center justify-between">
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                            >
                                <ChevronRight className="w-5 h-5 rotate-180" />
                                Back to Categories
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4 md:p-8">
                        <div className="max-w-4xl mx-auto">
                            {/* Category Header */}
                            <div className="text-center mb-8">
                                {catData.image ? (
                                    <img
                                        src={catData.image}
                                        alt={selectedCategory}
                                        className="w-24 h-24 rounded-2xl object-cover mx-auto mb-4 border-2 border-white/10"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-2xl bg-zinc-800 flex items-center justify-center text-4xl mx-auto mb-4 border-2 border-white/10">
                                        {catData.icon}
                                    </div>
                                )}
                                <h1 className="text-3xl font-bold text-white mb-2">{selectedCategory}</h1>
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#fbff00]/10 border border-[#fbff00]/30">
                                    <Sparkles className="w-4 h-4" style={{ color: NEON_YELLOW }} />
                                    <span className="font-bold" style={{ color: NEON_YELLOW }}>
                                        {catData.xp} XP {timeFilter === 'month' ? `(${monthName})` : '(All Time)'}
                                    </span>
                                </div>
                            </div>

                            {/* Task List */}
                            <div className="bg-zinc-900/50 rounded-2xl border border-white/5 overflow-hidden">
                                <div className="p-4 border-b border-white/5">
                                    <h3 className="font-bold text-white">Completed Tasks ({catData.tasks.length})</h3>
                                </div>

                                {catData.tasks.length === 0 ? (
                                    <div className="p-8 text-center text-zinc-500">
                                        No completed tasks in this category {timeFilter === 'month' ? 'this month' : ''}.
                                    </div>
                                ) : (
                                    <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
                                        {catData.tasks.map(task => (
                                            <div key={task.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                                <div>
                                                    <h4 className="font-medium text-white">{task.title}</h4>
                                                    <p className="text-xs text-zinc-500">
                                                        {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : 'Unknown date'}
                                                    </p>
                                                </div>
                                                <span className="text-sm font-bold" style={{ color: NEON_YELLOW }}>
                                                    +{task.xpValue || 20} XP
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>,
            document.body
        );
    }

    // Main category grid
    return createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md overflow-y-auto">
            <div className="min-h-full flex flex-col">
                {/* Fixed Header */}
                <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-white/5 p-4 md:px-8">
                    <div className="max-w-5xl mx-auto flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white">Categories</h1>
                            <p className="text-zinc-400 text-xs md:text-sm">Manage categories & view XP</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Time Filter Toggle */}
                            <div className="flex bg-zinc-900 rounded-full p-1 border border-zinc-800">
                                <button
                                    onClick={() => setTimeFilter('month')}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${timeFilter === 'month'
                                        ? 'text-black'
                                        : 'text-zinc-400 hover:text-white'
                                        }`}
                                    style={timeFilter === 'month' ? { backgroundColor: NEON_YELLOW } : {}}
                                >
                                    {monthName}
                                </button>
                                <button
                                    onClick={() => setTimeFilter('all')}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${timeFilter === 'all'
                                        ? 'text-black'
                                        : 'text-zinc-400 hover:text-white'
                                        }`}
                                    style={timeFilter === 'all' ? { backgroundColor: NEON_YELLOW } : {}}
                                >
                                    All Time
                                </button>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-4 md:p-8">
                    <div className="max-w-5xl mx-auto">
                        {/* Add New Category */}
                        <div className="mb-6 flex gap-3">
                            <input
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="New category name..."
                                className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#fbff00]/50"
                                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                            />
                            <button
                                onClick={handleAddCategory}
                                disabled={!newCategoryName.trim()}
                                className="px-6 py-3 rounded-xl font-bold text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
                                style={{ backgroundColor: NEON_YELLOW }}
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Category Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(categoryStats).map(([catName, data]) => (
                                <div
                                    key={catName}
                                    className="group relative bg-zinc-900/60 rounded-2xl border border-white/5 overflow-hidden hover:border-[#fbff00]/30 transition-all duration-300 hover:-translate-y-1"
                                >
                                    {/* Image/Icon Area */}
                                    <div
                                        onClick={() => editingId !== data.id && setSelectedCategory(catName)}
                                        className="h-28 relative cursor-pointer overflow-hidden"
                                    >
                                        {data.image ? (
                                            <img
                                                src={data.image}
                                                alt={catName}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-4xl">
                                                {data.icon}
                                            </div>
                                        )}
                                        {/* Overlay gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                                        {/* XP Badge */}
                                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/10">
                                            <span className="text-xs font-bold" style={{ color: NEON_YELLOW }}>{data.xp} XP</span>
                                        </div>

                                        {/* Task count */}
                                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-sm text-[10px] text-zinc-300">
                                            {data.tasks.length} tasks
                                        </div>
                                    </div>

                                    {/* Info Area */}
                                    <div className="p-3">
                                        {editingId === data.id ? (
                                            <div className="space-y-2">
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#fbff00]/50"
                                                    placeholder="Category name"
                                                    autoFocus
                                                />

                                                {/* Image Input Mode Toggle */}
                                                <div className="flex gap-1 mb-1">
                                                    <button
                                                        onClick={() => setImageInputMode('url')}
                                                        className={`flex-1 py-1 text-xs rounded-lg flex items-center justify-center gap-1 ${imageInputMode === 'url' ? 'bg-zinc-700 text-white' : 'bg-zinc-800 text-zinc-500'
                                                            }`}
                                                    >
                                                        <Link className="w-3 h-3" /> URL
                                                    </button>
                                                    <button
                                                        onClick={() => setImageInputMode('file')}
                                                        className={`flex-1 py-1 text-xs rounded-lg flex items-center justify-center gap-1 ${imageInputMode === 'file' ? 'bg-zinc-700 text-white' : 'bg-zinc-800 text-zinc-500'
                                                            }`}
                                                    >
                                                        <Upload className="w-3 h-3" /> Upload
                                                    </button>
                                                </div>

                                                {imageInputMode === 'url' ? (
                                                    <input
                                                        type="text"
                                                        value={editImage}
                                                        onChange={(e) => setEditImage(e.target.value)}
                                                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#fbff00]/50"
                                                        placeholder="Image URL"
                                                    />
                                                ) : (
                                                    <div>
                                                        <input
                                                            type="file"
                                                            ref={fileInputRef}
                                                            onChange={handleFileUpload}
                                                            accept="image/*"
                                                            className="hidden"
                                                        />
                                                        <button
                                                            onClick={() => fileInputRef.current?.click()}
                                                            className="w-full py-2 bg-zinc-800 border border-zinc-700 border-dashed rounded-lg text-zinc-400 text-xs hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            <Image className="w-4 h-4" />
                                                            {editImage ? 'Image Selected ✓' : 'Choose Image'}
                                                        </button>
                                                    </div>
                                                )}

                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleSaveEdit}
                                                        className="flex-1 py-2 rounded-lg font-bold text-black text-sm"
                                                        style={{ backgroundColor: NEON_YELLOW }}
                                                    >
                                                        <Check className="w-4 h-4 mx-auto" />
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingId(null)}
                                                        className="flex-1 py-2 rounded-lg bg-zinc-800 text-zinc-400 text-sm hover:bg-zinc-700"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-bold text-white text-sm truncate">{catName}</h3>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {data.id && (
                                                        <>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleStartEdit(catName); }}
                                                                className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                                                            >
                                                                <Edit2 className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleDeleteCategory(data.id); }}
                                                                className="p-1.5 rounded-lg hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {Object.keys(categoryStats).length === 0 && (
                            <div className="text-center py-16 text-zinc-500">
                                <div className="text-5xl mb-4">📁</div>
                                <p>No categories yet. Add one above to get started!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
