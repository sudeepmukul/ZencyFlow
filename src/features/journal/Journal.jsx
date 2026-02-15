import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useData } from '../../contexts/DataContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Input';
import { Plus, Trash2, Edit2, Search, Smile, Meh, Frown, Heart, CloudLightning, X, ImagePlus } from 'lucide-react';
import { format } from 'date-fns';
import { SEOHead } from '../../components/seo/SEOHead';

const MOODS = [
    { label: 'Happy', value: 'Happy', icon: Smile, color: 'text-yellow-400' },
    { label: 'Good', value: 'Good', icon: Heart, color: 'text-pink-400' },
    { label: 'Neutral', value: 'Neutral', icon: Meh, color: 'text-blue-400' },
    { label: 'Bad', value: 'Bad', icon: CloudLightning, color: 'text-orange-400' },
    { label: 'Terrible', value: 'Terrible', icon: Frown, color: 'text-red-500' },
];

// Helper to render content with inline images
function renderContentWithImages(content) {
    if (!content) return null;
    // Split on ![...](data:...) markers
    const parts = content.split(/(\!\[.*?\]\(data:.*?\))/g);
    return parts.map((part, i) => {
        const match = part.match(/\!\[(.*?)\]\((data:.*?)\)/);
        if (match) {
            return (
                <img
                    key={i}
                    src={match[2]}
                    alt={match[1] || 'Journal image'}
                    className="max-w-full rounded-xl border border-zinc-800 my-4 shadow-lg"
                />
            );
        }
        // Render text with line breaks
        return part.split('\n').map((line, j) => (
            <React.Fragment key={`${i}-${j}`}>
                {line}
                {j < part.split('\n').length - 1 && <br />}
            </React.Fragment>
        ));
    });
}

export function Journal() {
    const { journalEntries, addJournalEntry, updateJournalEntry, deleteJournalEntry } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterMood, setFilterMood] = useState('All Moods');
    const [readingEntry, setReadingEntry] = useState(null);
    const fileInputRef = useRef(null);
    const readModalContentRef = useRef(null);

    // Initial scroll reset and body lock for read mode
    useEffect(() => {
        if (readingEntry) {
            document.body.style.overflow = 'hidden';
            if (readModalContentRef.current) {
                readModalContentRef.current.scrollTop = 0;
            }
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [readingEntry]);

    const [formData, setFormData] = useState({
        title: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        content: '',
        mood: 'Happy'
    });

    const handleOpenModal = (entry = null) => {
        if (entry) {
            setEditingEntry(entry);
            setFormData({
                title: entry.title || '',
                date: entry.date,
                content: entry.content,
                mood: entry.mood || 'Happy'
            });
        } else {
            setEditingEntry(null);
            setFormData({
                title: '',
                date: format(new Date(), 'yyyy-MM-dd'),
                content: '',
                mood: 'Happy'
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editingEntry) {
            await updateJournalEntry({ ...editingEntry, ...formData });
        } else {
            await addJournalEntry(formData);
        }
        setIsModalOpen(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this entry?')) {
            await deleteJournalEntry(id);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type and size
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('Image too large. Max 5MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result;
            const marker = `\n![${file.name}](${base64})\n`;
            setFormData(prev => ({
                ...prev,
                content: prev.content + marker
            }));
        };
        reader.readAsDataURL(file);

        // Reset input so same file can be selected again
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const filteredEntries = journalEntries
        .filter(entry => {
            const matchesSearch = (entry.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (entry.content?.toLowerCase() || '').includes(searchTerm.toLowerCase());
            const matchesMood = filterMood === 'All Moods' || entry.mood === filterMood;
            return matchesSearch && matchesMood;
        })
        .sort((a, b) => b.date.localeCompare(a.date));

    const getMoodIcon = (moodValue) => {
        const mood = MOODS.find(m => m.value === moodValue) || MOODS[2];
        const Icon = mood.icon;
        return <Icon className={`w-4 h-4 ${mood.color}`} />;
    };

    return (
        <>
            <SEOHead
                title="Journal"
                description="Keep a personal journal with mood tracking. Reflect on your day and track your emotional well-being."
                path="/journal"
            />
            <div className="space-y-8 max-w-5xl mx-auto">
                <div className="flex items-center justify-between">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-white to-zinc-500 bg-clip-text text-transparent">Journal</h1>
                    <Button onClick={() => handleOpenModal()}>
                        <Plus className="w-4 h-4" /> New Entry
                    </Button>
                </div>

                {/* Search and Filter Bar */}
                <Card className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <input
                                type="text"
                                placeholder="Search entries by title, content..."
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-zinc-200 focus:outline-none focus:border-neon-400 placeholder:text-zinc-600"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="w-full md:w-48">
                            <Select
                                value={filterMood}
                                onChange={(e) => setFilterMood(e.target.value)}
                                className="bg-zinc-950 border-zinc-800"
                            >
                                <option>All Moods</option>
                                {MOODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                            </Select>
                        </div>
                    </div>
                </Card>

                {/* Entries Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredEntries.map(entry => (
                        <Card
                            key={entry.id}
                            className="group relative flex flex-col h-full hover:border-neon-400/30 transition-colors cursor-pointer"
                            onDoubleClick={() => setReadingEntry(entry)}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="font-bold text-zinc-200">
                                        {format(new Date(entry.date), 'MMMM d, yyyy')}
                                    </div>
                                    <div className="text-xs text-zinc-500">
                                        {format(new Date(entry.date), 'EEEE')}
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={(e) => { e.stopPropagation(); handleOpenModal(entry); }} className="p-1.5 text-zinc-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-md transition-colors">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }} className="p-1.5 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">
                                {entry.title || 'Untitled Entry'}
                            </h3>

                            {/* Image Preview */}
                            {(() => {
                                const firstImage = entry.content?.match(/\!\[.*?\]\((data:.*?)\)/)?.[1];
                                return firstImage ? (
                                    <div className="mb-3 h-32 w-full overflow-hidden rounded-xl border border-zinc-800/50">
                                        <img src={firstImage} alt="Preview" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    </div>
                                ) : null;
                            })()}

                            <p className="text-zinc-400 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
                                {entry.content?.replace(/\!\[.*?\]\(data:.*?\)/g, '').trim() || 'No content...'}
                            </p>

                            <div className="flex items-center gap-2 pt-3 border-t border-zinc-800/50 mt-auto">
                                {getMoodIcon(entry.mood)}
                                <span className="text-xs text-zinc-400 font-medium">{entry.mood || 'Neutral'}</span>
                                <span className="text-[10px] text-zinc-600 ml-auto">Double-click to read</span>
                            </div>
                        </Card>
                    ))}
                    {filteredEntries.length === 0 && (
                        <div className="col-span-full text-center py-20 text-zinc-500 bg-zinc-900/20 rounded-xl border border-zinc-800 border-dashed">
                            {searchTerm ? 'No matching entries found.' : 'Your journal is empty. Write your first entry today!'}
                        </div>
                    )}
                </div>

                {/* Read Mode Overlay */}
                {readingEntry && createPortal(
                    <div
                        className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
                        onClick={() => setReadingEntry(null)}
                        onKeyDown={(e) => e.key === 'Escape' && setReadingEntry(null)}
                    >
                        <div
                            ref={readModalContentRef}
                            className="relative bg-[#0a0a0a] border border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto custom-scrollbar p-8 md:p-12 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close button */}
                            <button
                                onClick={() => setReadingEntry(null)}
                                className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Mood indicator */}
                            <div className="flex items-center gap-2 mb-6">
                                {getMoodIcon(readingEntry.mood)}
                                <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">{readingEntry.mood || 'Neutral'}</span>
                            </div>

                            {/* Date */}
                            <div className="mb-2">
                                <span className="text-sm text-zinc-500 font-medium">
                                    {format(new Date(readingEntry.date), 'EEEE, MMMM d, yyyy')}
                                </span>
                            </div>

                            {/* Title */}
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 leading-tight">
                                {readingEntry.title || 'Untitled Entry'}
                            </h2>

                            {/* Divider */}
                            <div className="w-12 h-0.5 bg-[#FBFF00]/40 mb-8 rounded-full" />

                            {/* Content with rendered images */}
                            <div className="text-zinc-300 text-base leading-relaxed font-light tracking-wide">
                                {renderContentWithImages(readingEntry.content)}
                            </div>

                            {/* Bottom actions */}
                            <div className="mt-10 pt-6 border-t border-zinc-800/50 flex items-center gap-3">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-zinc-500 hover:text-blue-400"
                                    onClick={() => { setReadingEntry(null); handleOpenModal(readingEntry); }}
                                >
                                    <Edit2 className="w-4 h-4 mr-1" /> Edit
                                </Button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}

                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingEntry ? "Edit Entry" : "New Journal Entry"}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">Title</label>
                            <Input
                                required
                                placeholder="Give your day a headline..."
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div onClick={() => document.getElementById('journal-date-input').showPicker()} className="cursor-pointer">
                                <label className="block text-sm font-medium text-zinc-400 mb-1 pointer-events-none">Date</label>
                                <Input
                                    id="journal-date-input"
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    className="cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1">Mood</label>
                                <Select
                                    value={formData.mood}
                                    onChange={e => setFormData({ ...formData, mood: e.target.value })}
                                >
                                    {MOODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                                </Select>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-sm font-medium text-zinc-400">Entry</label>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-1 text-xs text-zinc-500 hover:text-[#FBFF00] transition-colors px-2 py-1 rounded-md hover:bg-[#FBFF00]/10"
                                >
                                    <ImagePlus className="w-3.5 h-3.5" />
                                    Add Image
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                />
                            </div>
                            <textarea
                                required
                                rows={10}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-neon-400 focus:ring-1 focus:ring-neon-400 transition-all duration-200 resize-none"
                                placeholder="Write your thoughts here..."
                                value={formData.content}
                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-2">
                            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button type="submit">{editingEntry ? "Update Entry" : "Save Entry"}</Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </>
    );
}
