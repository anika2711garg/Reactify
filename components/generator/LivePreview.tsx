"use client";

import React from 'react';
import { LiveProvider, LiveError, LivePreview as ReactLivePreview } from 'react-live';
import * as LucideIcons from 'lucide-react';

interface LivePreviewProps {
    code: string;
}

const scope = {
    import: undefined, // Disable imports
    React,
    ...LucideIcons,
};

export function LivePreview({ code }: LivePreviewProps) {
    // Simple transformation to make the code ready for react-live
    // react-live expects "render(<Component />)" or just the JSX for a stateless component, 
    // OR a functional component without export default.
    // We need to strip "export default" and ensure it calls render or just is the component.

    const transformCode = (input: string) => {
        // Remove imports as they are likely not supported in this simple runner (unless we provide them in scope, which we do for Lucide)
        let cleanCode = input.replace(/import .* from .*/g, '');

        // Remove "export default"
        cleanCode = cleanCode.replace(/export default function/, 'function');

        // If it's a named function, we need to call it/render it. 
        // react-live implicitly renders the last expression if it's a value.
        // So "function App() {...}; <App />" works.

        // Extract function name
        const match = cleanCode.match(/function\s+(\w+)/);
        const componentName = match ? match[1] : null;

        if (componentName) {
            return `${cleanCode}\n;render(<${componentName} />)`;
        }

        return cleanCode;
    };

    const processedCode = transformCode(code);

    return (
        <div className="h-full w-full flex flex-col bg-slate-50 overflow-hidden relative">
            <div className="flex-1 overflow-auto p-8 flex items-center justify-center">
                <div className="w-full h-full bg-white shadow-sm border border-slate-200 rounded-lg overflow-hidden relative">
                    <LiveProvider code={processedCode} scope={scope} noInline={false}>
                        <div className="w-full h-full overflow-auto p-4 relative">
                            <ReactLivePreview />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
                            <LiveError className="bg-red-100 text-red-700 p-2 rounded text-sm text-left pointer-events-auto" />
                        </div>
                    </LiveProvider>
                </div>
            </div>
            <div className="py-2 px-4 bg-white border-t border-slate-200 text-xs text-slate-500 flex justify-between">
                <span>Preview Mode</span>
                <span>Viewport: Responsive</span>
            </div>
        </div>
    );
}
