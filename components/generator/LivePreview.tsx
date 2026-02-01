"use client";

import React from "react";
import {
    LiveProvider,
    LiveError,
    LivePreview as ReactLivePreview,
} from "react-live";
import * as LucideIcons from "lucide-react";

interface LivePreviewProps {
    code: string;
}

const scope = {
    React,
    ...LucideIcons,
};

export function LivePreview({ code }: LivePreviewProps) {
    const transformCode = (input: string) => {
        let src = input || "";

        // 1. Remove non-runtime syntax
        // Remove "use client" directive
        src = src.replace(/["']use client["'];?\s*/g, "");
        // Remove imports (handling multi-line and optional semicolon)
        src = src.replace(/import\s+(?:(?:\w+|[\w\s{},*]+)\s+from\s+)?['"][^'"]+['"];?/g, "");
        // Remove "export default"
        src = src.replace(/export\s+default\s+/g, "");
        // Remove "export" from named exports (preserve the declaration)
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
        const constMatch = src.match(/const\s+(\w+)\s*=\s*\(/);
        const componentName = fnMatch?.[1] || constMatch?.[1];

        // 5. ALWAYS render exactly once
        return `
try {
  ${src || ""}

  ${componentName
                ? `render(<${componentName} />);`
                : `render(null);`
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

    const processedCode = transformCode(code);

    return (
        <div className="h-full w-full flex flex-col bg-slate-50 overflow-hidden">
            <div className="flex-1 overflow-auto p-6">
                <div className="w-full h-full bg-white border rounded-lg shadow-sm">
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

            <div className="px-4 py-2 text-xs text-slate-500 border-t bg-white flex justify-between">
                <span>Preview Mode</span>
                <span>Viewport: Responsive</span>
            </div>
        </div>
    );
}
