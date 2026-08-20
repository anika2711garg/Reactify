"use client";

import React, { useMemo } from "react";
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
  useMemo as useReactMemo,
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
  useMemo: useReactMemo,
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

export function transformPreviewCode(input: string) {
  let src = input || "";

  src = src.replace(/```[\s\S]*?```/g, (block) =>
    block.replace(/```[a-zA-Z]*\n?/, "").replace(/```/, "")
  );
  src = src.replace(/^\s*(javascript|js|tsx|ts|jsx)\s*\n/i, "");
  src = src.replace(/["']use client["'];?\s*/g, "");
  src = src.replace(/import\s+(?:(?:\w+|[\w\s{},*]+)\s+from\s+)?['"][^'"]+['"];?/g, "");

  if (src.match(/export\s+default\s+function\s*\(/)) {
    src = src.replace(/export\s+default\s+function\s*\(/, "const GeneratedComponent = function(");
  } else {
    src = src.replace(/export\s+default\s+/g, "");
  }

  src = src.replace(/^export\s+/gm, "");
  src = src.replace(/interface\s+\w+\s*\{[\s\S]*?\}\s*/g, "");
  src = src.replace(/type\s+\w+\s*=\s*[\s\S]*?;/g, "");
  src = src.replace(/\)\s*:\s*[\w.<>\[\]|&\s]+\s*\{/g, ") {");
  src = src.replace(/:\s*[\w.<>\[\]|&\s]+(?=[=;,)])/g, "");
  src = src.replace(/\sclass=/g, " className=");
  src = src.replace(/\sfor=/g, " htmlFor=");
  src = src.replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, "");
  src = src.trim();

  const fnMatch = src.match(/function\s+(\w+)/);
  const constMatch = src.match(/const\s+(\w+)\s*=\s*[:(]?/);
  let componentName = src.includes("const GeneratedComponent")
    ? "GeneratedComponent"
    : fnMatch?.[1] || constMatch?.[1];

  if (!componentName) {
    const anyFn = src.match(/(?:function|const)\s+(\w+)/);
    if (anyFn) componentName = anyFn[1];
  }

  return `
try {
  ${src || ""}

  ${
    componentName
      ? `render(<${componentName} />);`
      : `render(<pre style={{color:'#f07178'}}>No component detected. Ensure you export a component.</pre>);`
  }
} catch (e) {
  render(
    <pre style={{ color: "#f07178", whiteSpace: "pre-wrap" }}>
      {String(e)}
    </pre>
  );
}
`;
}

export function LivePreview({ code }: LivePreviewProps) {
  const processedCode = useMemo(() => transformPreviewCode(code), [code]);

  return (
    <div className="h-full w-full overflow-auto bg-white text-slate-950">
      <LiveProvider code={processedCode} scope={scope} noInline>
        <div className="min-h-full">
          <ReactLivePreview />
        </div>
        <LiveError className="m-3 rounded-lg bg-red-50 p-3 text-sm text-red-700" />
      </LiveProvider>
    </div>
  );
}
