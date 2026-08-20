"use client";

import React, { useEffect, useMemo, useRef } from "react";
import {
  LiveProvider,
  LiveError,
  LivePreview as ReactLivePreview,
} from "react-live";
import * as LucideIcons from "lucide-react";
import {
  useState,
  useEffect as useReactEffect,
  useRef as useReactRef,
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
import { looksTruncated, repairGeneratedJsx, stripLeakedSourceText, stripTypescript } from "@/lib/ai/contract";
import { analyzeJsx } from "@/lib/parser/jsx-tree";

interface LivePreviewProps {
  code: string;
  selectedPath?: string | null;
  onSelectPath?: (path: string | null) => void;
}

const scope = {
  React,
  useState,
  useEffect: useReactEffect,
  useRef: useReactRef,
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
  const cleaned = stripLeakedSourceText(stripTypescript(repairGeneratedJsx(input || "")));
  const analysis = analyzeJsx(cleaned);
  let src = analysis.warnings.some((warning) => /parse|unexpected|token/i.test(warning))
    ? cleaned
    : analysis.instrumented || cleaned;

  src = src.replace(/```[\s\S]*?```/g, (block) =>
    block.replace(/```[a-zA-Z]*\n?/, "").replace(/```/, "")
  );
  src = src.replace(/^\s*(javascript|js|tsx|ts|jsx)\s*\n/i, "");
  src = src.replace(/import\s+(?:(?:\w+|[\w\s{},*]+)\s+from\s+)?['"][^'"]+['"];?/g, "");

  if (src.match(/export\s+default\s+function\s*\(/)) {
    src = src.replace(/export\s+default\s+function\s*\(/, "const GeneratedComponent = function(");
  } else {
    src = src.replace(/export\s+default\s+/g, "");
  }

  src = src.replace(/^export\s+/gm, "");
  src = stripTypescript(src);
  src = src.replace(/\sclass=/g, " className=");
  src = src.replace(/\sfor=/g, " htmlFor=");
  src = src.replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, "");
  src = src.trim();

  const fnMatch = src.match(/function\s+(\w+)/);
  const constMatch = src.match(/const\s+(\w+)\s*=\s*[:(]?/);
  let componentName = src.includes("const GeneratedComponent")
    ? "GeneratedComponent"
    : analysis.componentName || fnMatch?.[1] || constMatch?.[1];

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

export function LivePreview({ code, selectedPath, onSelectPath }: LivePreviewProps) {
  const processedCode = useMemo(() => transformPreviewCode(code), [code]);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    root.querySelectorAll("[data-rf-selected='true']").forEach((node) => {
      node.removeAttribute("data-rf-selected");
      (node as HTMLElement).style.outline = "";
      (node as HTMLElement).style.outlineOffset = "";
    });

    if (!selectedPath) return;
    const match = root.querySelector(`[data-rf-path="${selectedPath}"]`) as HTMLElement | null;
    if (match) {
      match.setAttribute("data-rf-selected", "true");
      match.style.outline = "2px solid #a855f7";
      match.style.outlineOffset = "2px";
      match.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [selectedPath, processedCode]);

  return (
    <div
      ref={rootRef}
      className="h-full w-full overflow-auto bg-white text-slate-950"
      onClick={(event) => {
        const target = (event.target as HTMLElement).closest("[data-rf-path]") as HTMLElement | null;
        if (target?.dataset.rfPath) {
          event.preventDefault();
          event.stopPropagation();
          onSelectPath?.(target.dataset.rfPath);
        }
      }}
    >
      <LiveProvider code={processedCode} scope={scope} noInline>
        <div className="min-h-full">
          <ReactLivePreview />
        </div>
        {looksTruncated(code) ? (
          <p className="m-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            The generated component was cut off mid-line, so the preview cannot run it. Ask Reactify to fix the syntax, or click Generate again.
          </p>
        ) : (
          <LiveError className="m-3 rounded-lg bg-red-50 p-3 text-sm text-red-700" />
        )}
      </LiveProvider>
    </div>
  );
}
