"use client";

import React from "react";
import {
    LiveProvider,
    LiveError,
    LivePreview as ReactLivePreview,
} from "react-live";
import * as LucideIcons from "lucide-react";
import {
    useState,
    useEffect,
    useRef,
    useCallback,
    useMemo,
    useReducer,
    useContext,
    useLayoutEffect,
    useId,
    useImperativeHandle,
    useDebugValue,
    useTransition,
    useDeferredValue,
    useInsertionEffect,
    useSyncExternalStore,
} from "react";

interface LivePreviewProps {
    code: string;
}

const scope = {
    React,
    useState,
    useEffect,
    useRef,
    useCallback,
    useMemo,
    useReducer,
    useContext,
    useLayoutEffect,
    useId,
    useImperativeHandle,
    useDebugValue,
    useTransition,
    useDeferredValue,
    useInsertionEffect,
    useSyncExternalStore,
    ...LucideIcons,
};

export function LivePreview({ code }: LivePreviewProps) {
    const transformCode = (input: string) => {
        let src = input || "";

        // 0. Remove markdown code fences and language identifiers
        src = src.replace(/```[\s\S]*?```/g, (block) =>
            block.replace(/```[a-zA-Z]*\n?/, "").replace(/```/, "")
        );
        // Also remove standalone language labels like "javascript" at the start
        src = src.replace(/^\s*(javascript|js|tsx|ts|jsx)\s*\n/i, "");

        // 1. Remove non-runtime syntax
        // Remove "use client" directive
        src = src.replace(/["']use client["'];?\s*/g, "");
        // Remove imports
        src = src.replace(/import\s+(?:(?:\w+|[\w\s{},*]+)\s+from\s+)?['"][^'"]+['"];?/g, "");

        // Handle "export default" more robustly
        // If it's "export default function Name", keep "function Name"
        // If it's "export default function()", make it "const GeneratedComponent = function()"
        if (src.match(/export\s+default\s+function\s*\(/)) {
            src = src.replace(/export\s+default\s+function\s*\(/, "const GeneratedComponent = function(");
        } else {
            src = src.replace(/export\s+default\s+/g, "");
        }

        // Remove "export" from named exports
        src = src.replace(/^export\s+/gm, "");

        // 2. Strip TypeScript
        src = src.replace(/interface\s+\w+\s*\{[\s\S]*?\}\s*/g, "");
        src = src.replace(/type\s+\w+\s*=\s*[\s\S]*?;/g, "");
        src = src.replace(/\)\s*:\s*[\w.<>\[\]|&\s]+\s*\{/g, ") {");
        src = src.replace(/:\s*[\w.<>\[\]|&\s]+(?=[=;,)])/g, "");

        // 3. JSX fixes
        src = src.replace(/\sclass=/g, " className=");
        src = src.replace(/\sfor=/g, " htmlFor=");
        src = src.replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, "");

        src = src.trim();

        // 4. Detect component
        const fnMatch = src.match(/function\s+(\w+)/);
        const constMatch = src.match(/const\s+(\w+)\s*=\s*[:(]?/); // Improved const match
        // Prioritize 'GeneratedComponent' if we created it, or explicit names
        let componentName = src.includes("const GeneratedComponent") ? "GeneratedComponent" : (fnMatch?.[1] || constMatch?.[1]);

        // Fallback: If no component name found, but code seems to have a function, try to guess
        if (!componentName) {
            // Match ANY function defined at top level?
            const anyFn = src.match(/(?:function|const)\s+(\w+)/);
            if (anyFn) componentName = anyFn[1];
        }

        // 6. Handle common icon hallucinations (Feather/FontAwesome)
        // (Removed fragile regex replacement. Relies on strictly correct generation)

        // 7. ALWAYS render exactly once
        return `
try {
  ${src || ""}

  ${componentName
                ? `render(<${componentName} />);`
                : `render(<pre style={{color:'red'}}>No component detected. Ensure you export a component.</pre>);`
            }
} catch (e) {
  render(
    <pre style={{ color: "red", whiteSpace: "pre-wrap" }}>
      {String(e)}
    </pre>
  );
}
`;
    };

    const processedCode = useMemo(() => transformCode(code), [code]);

    const [darkMode, setDarkMode] = useState(true); // Default to dark mode for premium look

    return (
        <div className="h-full w-full flex flex-col bg-slate-50 overflow-hidden">
            <div className="flex-1 overflow-hidden p-6">
                <div
                    className={`w-full h-full border rounded-lg shadow-sm transition-colors duration-300 ${darkMode ? 'bg-slate-950 border-slate-800 text-slate-100 dark' : 'bg-white border-slate-200 text-slate-900'}`}
                    style={{
                        '--background': darkMode ? '#020617' : '#ffffff',
                        '--foreground': darkMode ? '#f1f5f9' : '#0f172a',
                    } as React.CSSProperties}
                >
                    <LiveProvider code={processedCode} scope={scope} noInline>
                        <div className="w-full h-full p-4 overflow-auto">
                            <ReactLivePreview />
                        </div>

                        <div className="p-3">
                            <LiveError className="bg-red-100 text-red-700 p-2 rounded text-sm" />
                        </div>
                    </LiveProvider>
                </div>
            </div>

            <div className="px-4 py-2 text-xs text-slate-500 border-t bg-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <span>Preview Mode</span>
                    <span className="w-px h-3 bg-slate-300 mx-1" />
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className="flex items-center gap-1.5 hover:text-slate-900 transition-colors"
                    >
                        {darkMode ? (
                            <>
                                <LucideIcons.Sun className="w-3 h-3" />
                                <span>Light</span>
                            </>
                        ) : (
                            <>
                                <LucideIcons.Moon className="w-3 h-3" />
                                <span>Dark</span>
                            </>
                        )}
                    </button>
                </div>
                <span>Viewport: Responsive</span>
            </div>
        </div>
    );
}
