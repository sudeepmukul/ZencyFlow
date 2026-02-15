import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const BulkTaskModal = ({ isOpen, onClose, onAddTasks }) => {
    const [inputText, setInputText] = useState('');
    const [parsedTasks, setParsedTasks] = useState([]);

    // Parse text whenever it changes
    useEffect(() => {
        if (!inputText.trim()) {
            setParsedTasks([]);
            return;
        }

        const tasks = inputText.split(',').map(segment => {
            const trimmed = segment.trim();
            if (!trimmed) return null;

            // Regex to find "Name - XP" pattern (handling spaces around dash)
            // Captures: 1=Name, 2=XP (optional)
            const match = trimmed.match(/^(.*?)(?:\s*-\s*(\d+))?$/);

            if (match) {
                const title = match[1].trim();
                const xp = match[2] ? parseInt(match[2], 10) : 25; // Default 25 XP

                if (!title) return null;

                return {
                    title,
                    xpValue: xp,
                    priority: xp >= 50 ? 'High' : xp >= 25 ? 'Medium' : 'Low',
                    category: 'General'
                };
            }
            return null;
        }).filter(Boolean);

        setParsedTasks(tasks);
    }, [inputText]);

    const handleSubmit = () => {
        if (parsedTasks.length === 0) return;
        onAddTasks(parsedTasks);
        setInputText('');
        onClose();
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl bg-[#121212] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-900/50">
                    <div>
                        <h2 className="text-xl font-bold text-[#FBFF00] uppercase tracking-wide">Bulk Add Quests</h2>
                        <p className="text-zinc-500 text-xs mt-1">Add multiple tasks rapidly. Suffix with "- XP" (e.g. "Run - 50")</p>
                    </div>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Input Area */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Quest List (Comma Separated)</label>
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Workout - 25, Read Book - 10, Call Mom, Finish Project - 100"
                            className="w-full h-32 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-[#FBFF00]/50 focus:ring-1 focus:ring-[#FBFF00]/20 resize-none font-mono text-sm leading-relaxed"
                            autoFocus
                        />
                    </div>

                    {/* Preview Section */}
                    {parsedTasks.length > 0 ? (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                <span>Preview ({parsedTasks.length})</span>
                                <span>Total XP: {parsedTasks.reduce((sum, t) => sum + t.xpValue, 0)}</span>
                            </div>
                            <div className="max-h-[200px] overflow-y-auto custom-scrollbar space-y-2 pr-2">
                                {parsedTasks.map((task, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-zinc-900/30 border border-zinc-800/50 rounded-lg group hover:border-[#FBFF00]/30 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-500">
                                                {idx + 1}
                                            </span>
                                            <span className="text-sm font-medium text-zinc-200">{task.title}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${task.priority === 'High' ? 'bg-red-500/10 text-red-500' :
                                                    task.priority === 'Medium' ? 'bg-[#FBFF00]/10 text-[#FBFF00]' :
                                                        'bg-blue-500/10 text-blue-500'
                                                }`}>
                                                {task.priority}
                                            </span>
                                            <span className="text-xs font-bold text-zinc-500">{task.xpValue} XP</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-zinc-600 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
                            <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                            <p className="text-sm">Start typing to see preview...</p>
                        </div>
                    )}

                    {/* Action Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={parsedTasks.length === 0}
                        className="w-full bg-[#FBFF00] hover:bg-[#d4d800] text-black font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(251,255,0,0.2)]"
                    >
                        <Plus className="w-5 h-5" />
                        Add {parsedTasks.length > 0 ? `${parsedTasks.length} Quests` : 'Quests'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
