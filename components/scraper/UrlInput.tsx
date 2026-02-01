"use client";

import React, { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';

interface UrlInputProps {
    onScrape: (url: string) => Promise<void>;
    isLoading: boolean;
}

export function UrlInput({ onScrape, isLoading }: UrlInputProps) {
    const [url, setUrl] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        if (!url.startsWith('http')) {
            setError('Please enter a valid URL (https://...)');
            return;
        }

        setError('');
        await onScrape(url);
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <form onSubmit={handleSubmit} className="relative flex items-center group">
                <div className="relative w-full">
                    <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <input
                        type="url"
                        placeholder="https://example.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full h-16 pl-8 pr-36 rounded-full bg-white/5 border border-white/10 shadow-xl backdrop-blur-md text-white md:text-lg outline-none placeholder:text-slate-500 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all z-10 relative"
                        disabled={isLoading}
                    />
                    {isLoading && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm flex items-center gap-2 z-20">
                            <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                            <span className="animate-pulse">Scraping</span>
                        </div>
                    )}
                </div>

                {!isLoading && (
                    <button
                        type="submit"
                        disabled={!url || isLoading}
                        className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 rounded-full font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 z-20"
                    >
                        Generate
                        <ArrowRight className="w-4 h-4" />
                    </button>
                )}
            </form>

            {error && (
                <p className="text-red-400 text-sm pl-8 animate-in slide-in-from-top-1">{error}</p>
            )}

            <p className="text-center text-slate-500 text-sm">
                Enter a public URL to start. Localhost and auth-protected pages are not supported.
            </p>
        </div>
    );
}
