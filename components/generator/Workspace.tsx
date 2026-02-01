"use client";

import React, { useState } from 'react';
import { LivePreview } from './LivePreview';
import { Send, Code2, Play, Copy, Check, Loader2 } from 'lucide-react';

interface WorkspaceProps {
    initialCode: string;
}

export function Workspace({ initialCode }: WorkspaceProps) {
    const [code, setCode] = useState(initialCode);
    const [input, setInput] = useState('');
    const [isIterating, setIsIterating] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isIterating) return;

        setIsIterating(true);
        try {
            const res = await fetch('/api/iterate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentCode: code, instruction: input }),
            });
            const data = await res.json();
            if (data.code) {
                setCode(data.code);
                setInput('');
            } else {
                alert('Failed to update component');
            }
        } catch (err) {
            console.error(err);
            alert('Error iterating component');
        } finally {
            setIsIterating(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex h-screen w-full bg-[#0a0a0a] text-white overflow-hidden animate-in fade-in duration-300">
            {/* LEFT: Code Editor / Viewer */}
            <div className="w-1/2 flex flex-col border-r border-[#1f1f1f]">
                <div className="h-14 border-b border-[#1f1f1f] flex items-center justify-between px-4 bg-[#0a0a0a]">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                        <div className="p-1.5 bg-blue-500/10 rounded-md">
                            <Code2 className="w-4 h-4 text-blue-400" />
                        </div>
                        Generated Component.tsx
                    </div>
                    <button
                        onClick={handleCopy}
                        className="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-white/5 text-slate-400 transition-colors"
                    >
                        {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Copied' : 'Copy Code'}
                    </button>
                </div>
                <div className="flex-1 overflow-auto bg-[#0a0a0a] p-0 font-mono text-sm leading-relaxed text-slate-300">
                    <textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full h-full bg-transparent outline-none resize-none p-6 font-mono text-[13px] leading-6 text-[#e6edf3]"
                        spellCheck={false}
                    />
                </div>

                {/* Chat Interface */}
                <div className="h-auto border-t border-[#1f1f1f] bg-[#0a0a0a] p-4">
                    <form onSubmit={handleSend} className="relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type instructions to refine (e.g., 'Make the button blue')..."
                            className="w-full bg-[#161b22] border border-[#30363d] rounded-xl py-4 pl-4 pr-12 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-colors placeholder:text-slate-600 text-slate-200"
                        />
                        <button
                            type="submit"
                            disabled={isIterating || !input.trim()}
                            className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-all disabled:opacity-50 disabled:grayscale"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                    {isIterating && (
                        <div className="flex items-center gap-2 mt-3 text-xs text-blue-400 px-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Refining component with AI...
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT: Live Preview */}
            <div className="w-1/2 flex flex-col bg-white text-slate-900 border-l border-[#1f1f1f]">
                <div className="h-14 border-b border-slate-200 flex items-center justify-between px-4 bg-slate-50/80 backdrop-blur">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <div className="p-1.5 bg-green-500/10 rounded-md">
                            <Play className="w-4 h-4 text-green-600" />
                        </div>
                        Live Preview
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-400/20 border border-red-400/50"></span>
                        <span className="w-3 h-3 rounded-full bg-yellow-400/20 border border-yellow-400/50"></span>
                        <span className="w-3 h-3 rounded-full bg-green-400/20 border border-green-400/50"></span>
                    </div>
                </div>
                <div className="flex-1 overflow-hidden relative bg-slate-100">
                    <LivePreview code={code} />
                </div>
            </div>
        </div>
    );
}
