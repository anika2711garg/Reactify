"use client";

import React from 'react';
import type { Section } from '@/lib/parse';

interface SectionListProps {
    sections: Section[];
    onSelect: (section: Section) => void;
    selectedId: string | null;
}

export function SectionList({ sections, onSelect, selectedId }: SectionListProps) {
    if (sections.length === 0) return null;

    return (
        <div className="mt-12 w-full max-w-6xl mx-auto">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-indigo-500 rounded-full" />
                Detected Sections
                <span className="text-slate-500 font-normal text-base ml-2">({sections.length})</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sections.map((section) => (
                    <div
                        key={section.id}
                        onClick={() => onSelect(section)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                onSelect(section);
                            }
                        }}
                        className={`
              group relative flex flex-col items-start text-left p-6 rounded-2xl border transition-all duration-300 cursor-pointer
              ${selectedId === section.id
                                ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_30px_-10px_rgba(99,102,241,0.3)]'
                                : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 hover:-translate-y-1'
                            }
            `}
                    >
                        <div className="mb-4 w-full flex justify-between items-start">
                            <span className={`
                inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize border
                ${section.type === 'hero' ? 'bg-purple-500/10 text-purple-300 border-purple-500/20' :
                                    section.type === 'features' ? 'bg-blue-500/10 text-blue-300 border-blue-500/20' :
                                        section.type === 'pricing' ? 'bg-green-500/10 text-green-300 border-green-500/20' :
                                            'bg-slate-500/10 text-slate-300 border-slate-500/20'}
              `}>
                                {section.type}
                            </span>
                            {selectedId === section.id && (
                                <span className="flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-indigo-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                                </span>
                            )}
                        </div>
                        <h4 className="text-lg font-medium text-white mb-2 group-hover:text-indigo-300 transition-colors">{section.name}</h4>
                        <p className="text-sm text-slate-400 line-clamp-3 mb-6 font-mono text-xs bg-black/40 p-3 rounded-lg w-full border border-white/5">
                            {section.previewText || "<No text content>"}
                        </p>

                        <div className={`
              mt-auto w-full py-2.5 text-center rounded-lg text-sm font-medium transition-all
              ${selectedId === section.id
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                                : 'bg-white/5 text-slate-300 group-hover:bg-white/10'}
            `}>
                            {selectedId === section.id ? 'Generating...' : 'Generate React Code'}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
