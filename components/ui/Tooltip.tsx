"use client";

import React, { useState } from 'react';

interface TooltipProps {
    content: string;
    children: React.ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div
            className="relative flex items-center justify-center z-50"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && (
                <div className="absolute bottom-full mb-2 px-3 py-1.5 text-xs font-medium text-white bg-slate-900/90 backdrop-blur-sm rounded-lg shadow-xl whitespace-nowrap border border-white/10 animate-in fade-in zoom-in-95 duration-200 pointer-events-none select-none">
                    {content}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900/90 backdrop-blur-sm rotate-45 border-r border-b border-white/10" />
                </div>
            )}
        </div>
    );
}
