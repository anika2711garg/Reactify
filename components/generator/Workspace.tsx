"use client";

import React, { useState } from 'react';
import { LivePreview } from './LivePreview';
import { Send, Code2, Play, Copy, Check, Loader2, Smartphone, Monitor, Download, Save, Trash2, X, History, Image as ImageIcon } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';

interface WorkspaceProps {
    initialCode: string;
    screenshot?: string;
    onBack: () => void;
}

export function Workspace({ initialCode, screenshot, onBack }: WorkspaceProps) {
    const [code, setCode] = useState(initialCode);
    const [input, setInput] = useState('');
    const [isIterating, setIsIterating] = useState(false);
    const [copied, setCopied] = useState(false);

    // Style Selector State
    const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

    // UI States
    const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
    const [leftTab, setLeftTab] = useState<'code' | 'original'>('code');
    const [showSaved, setShowSaved] = useState(false);
    const [savedComponents, setSavedComponents] = useState<{ id: string, name: string, code: string, date: string }[]>([]);

    React.useEffect(() => {
        const saved = localStorage.getItem('savedComponents');
        if (saved) {
            setSavedComponents(JSON.parse(saved));
        }
    }, []);

    const saveComponent = () => {
        const name = `Component ${savedComponents.length + 1}`;
        const newSaved = [{ id: Date.now().toString(), name, code, date: new Date().toLocaleString() }, ...savedComponents];
        setSavedComponents(newSaved);
        localStorage.setItem('savedComponents', JSON.stringify(newSaved));
        alert('Component saved!');
    };

    const loadComponent = (c: { code: string }) => {
        setCode(c.code);
        setShowSaved(false);
    };

    const deleteComponent = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newSaved = savedComponents.filter(c => c.id !== id);
        setSavedComponents(newSaved);
        localStorage.setItem('savedComponents', JSON.stringify(newSaved));
    };

    const [success, setSuccess] = useState(false);

    const handleSend = async (e: React.FormEvent, overrideInput?: string) => {
        if (e) e.preventDefault();

        const instructionToUse = overrideInput || input;

        if (!instructionToUse.trim() || isIterating) return;

        setIsIterating(true);
        setSuccess(false);

        try {
            const res = await fetch('/api/iterate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentCode: code, instruction: instructionToUse }),
            });
            const data = await res.json();

            if (data.code) {
                setCode(data.code);
                setInput('');
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            } else {
                throw new Error(data.error || 'Failed to update component');
            }
        } catch (err) {
            console.error(err);
            alert(err instanceof Error ? err.message : 'Error iterating component');
        } finally {
            setIsIterating(false);
        }
    };

    const handleStyleSelect = (style: string) => {
        setSelectedStyle(style);
        const prompt = `Refactor this component to use a "${style}" design style.`;
        handleSend(null as any, prompt);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([code], { type: 'text/typescript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Component.tsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 z-50 flex h-screen w-full bg-[#0a0a0a] text-white overflow-hidden animate-in fade-in duration-500">
            {/* LEFT: Code Editor / Viewer */}
            <div className="w-1/2 flex flex-col border-r border-[#1f1f1f] bg-[#0c0c0e]">
                <div className="h-14 border-b border-[#1f1f1f] flex items-center justify-between px-4 bg-[#0c0c0e]/80 backdrop-blur-sm">
                    <div className="flex items-center gap-2 p-1 bg-[#1a1a1c] rounded-lg border border-white/5">
                        <Tooltip content="Return to selection">
                            <button
                                onClick={onBack}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all mr-2"
                            >
                                ← Back
                            </button>
                        </Tooltip>
                        <Tooltip content="View React Code">
                            <button
                                onClick={() => setLeftTab('code')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${leftTab === 'code' ? 'bg-indigo-600/20 text-indigo-300 shadow-sm ring-1 ring-indigo-500/30' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                <Code2 className="w-3.5 h-3.5" />
                                Code
                            </button>
                        </Tooltip>
                        {screenshot && (
                            <Tooltip content="Compare with Original">
                                <button
                                    onClick={() => setLeftTab('original')}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${leftTab === 'original' ? 'bg-indigo-600/20 text-indigo-300 shadow-sm ring-1 ring-indigo-500/30' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    <ImageIcon className="w-3.5 h-3.5" />
                                    Original
                                </button>
                            </Tooltip>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Tooltip content="Version History">
                            <button
                                onClick={() => setShowSaved(!showSaved)}
                                className={`text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${showSaved ? 'bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/30' : 'hover:bg-white/5 text-slate-400'}`}
                            >
                                <History className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">History</span>
                            </button>
                        </Tooltip>
                        <div className="h-4 w-px bg-[#2d2d2d] mx-1" />
                        <Tooltip content="Save version locally">
                            <button
                                onClick={saveComponent}
                                className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                            >
                                <Save className="w-3.5 h-3.5" />
                            </button>
                        </Tooltip>
                        <Tooltip content="Download .tsx file">
                            <button
                                onClick={handleDownload}
                                className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                            >
                                <Download className="w-3.5 h-3.5" />
                            </button>
                        </Tooltip>
                        <Tooltip content="Copy code to clipboard">
                            <button
                                onClick={handleCopy}
                                className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                            >
                                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                        </Tooltip>
                    </div>
                </div>

                {showSaved ? (
                    <div className="flex-1 overflow-auto bg-[#0c0c0e] p-4 space-y-2 animate-in slide-in-from-left-4 duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-slate-300">Saved Versions</h3>
                            <button onClick={() => setShowSaved(false)} className="text-slate-500 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        {savedComponents.length === 0 ? (
                            <div className="text-center py-12 border border-dashed border-[#1f1f1f] rounded-xl">
                                <p className="text-slate-500 text-xs">No saved variations yet.</p>
                            </div>
                        ) : (
                            savedComponents.map(comp => (
                                <div
                                    key={comp.id}
                                    onClick={() => loadComponent(comp)}
                                    className="p-4 rounded-xl border border-[#1f1f1f] bg-[#131316] hover:border-indigo-500/50 hover:bg-[#1a1a1d] cursor-pointer group transition-all duration-200 shadow-sm"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm text-slate-200 font-medium group-hover:text-indigo-300 transition-colors">{comp.name}</p>
                                            <p className="text-[10px] text-slate-500">{comp.date}</p>
                                        </div>
                                        <button
                                            onClick={(e) => deleteComponent(comp.id, e)}
                                            className="text-slate-600 hover:text-red-400 p-1.5 rounded-md hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : leftTab === 'original' && screenshot ? (
                    <div className="flex-1 overflow-auto bg-[#0a0a0a] p-8 flex items-center justify-center">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                            <img src={screenshot} alt="Original Site" className="relative max-w-full rounded-lg border border-[#30363d] shadow-2xl" />
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-hidden bg-[#0c0c0e] p-0 font-mono text-sm leading-relaxed text-slate-300 selection:bg-indigo-500/30">
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full h-full block bg-transparent outline-none resize-none p-6 font-mono text-[13px] leading-6 text-[#e6edf3]"
                            spellCheck={false}
                        />
                    </div>
                )}

                {/* Chat Interface */}
                <div className="h-auto border-t border-[#1f1f1f] bg-[#0c0c0e] p-5">
                    {/* Style Quick Actions */}
                    <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
                        <Tooltip content="AI Assistant">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#1f1f1f] text-[10px] font-bold text-slate-500 mr-1 flex-shrink-0 cursor-help">
                                AI
                            </div>
                        </Tooltip>
                        {[
                            { name: 'Minimal', desc: 'Clean layout' },
                            { name: 'Modern', desc: 'Rounded & Gradients' },
                            { name: 'Dense', desc: 'Compact data' },
                            { name: 'Brutalist', desc: 'Sharp & Bold' }
                        ].map((style) => (
                            <Tooltip key={style.name} content={style.desc}>
                                <button
                                    onClick={() => handleStyleSelect(style.name)}
                                    disabled={isIterating}
                                    className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all duration-300 ${selectedStyle === style.name ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-lg shadow-indigo-500/25' : 'bg-[#161b22] border-[#30363d] text-slate-400 hover:text-white hover:border-slate-500'}`}
                                >
                                    {style.name}
                                </button>
                            </Tooltip>
                        ))}
                    </div>

                    <form onSubmit={handleSend} className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl blur opacity-0 group-focus-within:opacity-30 transition duration-500"></div>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Talk to the AI to refine... (e.g. 'Make buttons rounder')"
                            className="relative w-full bg-[#131316] border border-[#2d2d2d] rounded-xl py-4 pl-4 pr-14 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-colors placeholder:text-slate-600 text-slate-200"
                        />
                        <button
                            type="submit"
                            disabled={isIterating || !input.trim()}
                            className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 rounded-lg text-white transition-all disabled:opacity-50 disabled:grayscale shadow-lg shadow-indigo-500/20"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                    {isIterating && (
                        <div className="flex items-center justify-center gap-2 mt-3 text-xs text-indigo-400 px-1 animate-pulse">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span className="font-medium">AI is rewriting code...</span>
                        </div>
                    )}
                    {success && (
                        <div className="flex items-center justify-center gap-2 mt-3 text-xs text-emerald-400 px-1 animate-in fade-in slide-in-from-bottom-1">
                            <Check className="w-3 h-3" />
                            <span className="font-medium">Changes applied!</span>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT: Live Preview */}
            <div className="w-1/2 flex flex-col bg-[#0f0f10] text-slate-200 border-l border-[#1f1f1f]">
                <div className="h-14 border-b border-[#1f1f1f] flex items-center justify-between px-4 bg-[#0a0a0a]">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                        <div className="p-1.5 bg-green-500/10 rounded-md">
                            <Play className="w-4 h-4 text-green-400" />
                        </div>
                        Live Preview
                    </div>

                    {/* View Toggle */}
                    <div className="flex items-center gap-1 bg-[#1f1f1f] p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode('desktop')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'desktop' ? 'bg-[#2d2d2d] shadow-sm text-slate-200' : 'text-slate-500 hover:text-slate-400'}`}
                        >
                            <Monitor className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('mobile')}
                            className={`p-1.5 rounded-md transition-all ${viewMode === 'mobile' ? 'bg-[#2d2d2d] shadow-sm text-slate-200' : 'text-slate-500 hover:text-slate-400'}`}
                        >
                            <Smartphone className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></span>
                        <span className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></span>
                        <span className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></span>
                    </div>
                </div>

                {/* Preview Area */}
                <div className="flex-1 overflow-hidden relative bg-[#0f0f10] flex items-center justify-center p-8 transition-all duration-300 bg-[radial-gradient(#1f1f1f_1px,transparent_1px)] [background-size:16px_16px]">
                    <div
                        className={`w-full h-full bg-white shadow-2xl border border-slate-700/50 rounded-lg overflow-hidden relative transition-all duration-500 ease-in-out ${viewMode === 'mobile' ? 'max-w-[375px] max-h-[812px] shadow-2xl border-slate-700' : 'max-w-full max-h-full'
                            }`}
                    >
                        <LivePreview code={code} />
                    </div>
                </div>

                <div className="py-2 px-4 bg-[#0a0a0a] border-t border-[#1f1f1f] text-xs text-slate-500 flex justify-between">
                    <span>Preview Mode: {viewMode === 'desktop' ? 'Desktop' : 'iPhone 13 mini'}</span>
                    <span>{viewMode === 'desktop' ? '100% Width' : '375px × 812px'}</span>
                </div>
            </div>
        </div>
    );
}
