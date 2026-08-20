"use client";

import React, { useMemo, useState } from "react";
import { Check, Copy, Download, Maximize2, Minimize2 } from "lucide-react";
import { Highlight, themes } from "prism-react-renderer";
import { IconButton } from "@/components/ui/IconButton";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { Tabs } from "@/components/ui/Tabs";
import { useApp } from "@/lib/app-context";
import { useTheme } from "@/lib/theme";
import type { CodeTab } from "@/lib/types";
import { extractDependencies } from "@/lib/utils";

export function CodePanel({
  expanded,
  onToggleExpand,
}: {
  expanded?: boolean;
  onToggleExpand?: () => void;
}) {
  const { generatedCode, setGeneratedCode } = useApp();
  const { theme } = useTheme();
  const [tab, setTab] = useState<CodeTab>("component");
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);

  const dependencies = useMemo(() => extractDependencies(generatedCode), [generatedCode]);
  const styles = useMemo(() => {
    const classes = Array.from(generatedCode.matchAll(/className=["'`]([^"'`]+)["'`]/g))
      .flatMap((match) => match[1].split(/\s+/))
      .filter(Boolean);
    return Array.from(new Set(classes)).slice(0, 80).join("\n");
  }, [generatedCode]);

  const display =
    tab === "component"
      ? generatedCode || "// Generate a section to see production React here."
      : tab === "styles"
        ? styles || "// Tailwind classes will appear after generation."
        : dependencies.map((dep) => `"${dep}"`).join("\n");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedCode], { type: "text/typescript" });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = "Component.tsx";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(href);
  };

  return (
    <Panel className="flex h-full flex-col bg-canvas">
      <PanelHeader>
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { id: "component", label: "Component.tsx" },
            { id: "styles", label: "styles" },
            { id: "dependencies", label: "dependencies" },
          ]}
        />
        <div className="flex items-center gap-1">
          {tab === "component" && (
            <button
              type="button"
              onClick={() => setEditing((value) => !value)}
              className="mr-1 rounded-lg px-2 py-1 text-[11px] text-muted hover:bg-wash hover:text-ink"
            >
              {editing ? "Highlight" : "Edit"}
            </button>
          )}
          <IconButton label={copied ? "Copied" : "Copy"} side="bottom" onClick={handleCopy}>
            {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
          </IconButton>
          <IconButton label="Download TSX" side="bottom" onClick={handleDownload} disabled={!generatedCode}>
            <Download className="h-3.5 w-3.5" />
          </IconButton>
          {onToggleExpand && (
            <IconButton label={expanded ? "Collapse editor" : "Expand editor"} side="bottom" onClick={onToggleExpand}>
              {expanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </IconButton>
          )}
        </div>
      </PanelHeader>

      <div className="min-h-0 flex-1 overflow-auto">
        {tab === "component" && editing ? (
          <textarea
            value={generatedCode}
            onChange={(event) => setGeneratedCode(event.target.value)}
            spellCheck={false}
            aria-label="Edit generated component"
            className="h-full w-full resize-none bg-transparent p-4 font-mono text-[12.5px] leading-6 text-ink outline-none"
          />
        ) : tab === "component" ? (
          <Highlight theme={theme === "light" ? themes.github : themes.nightOwl} code={display} language="tsx">
            {({ tokens, getLineProps, getTokenProps }) => (
              <pre className="min-h-full p-4 font-mono text-[12.5px] leading-6">
                {tokens.map((line, index) => (
                  <div key={index} {...getLineProps({ line })} className="table-row">
                    <span className="table-cell w-10 select-none pr-4 text-right text-faint">
                      {index + 1}
                    </span>
                    <span className="table-cell">
                      {line.map((token, key) => (
                        <span key={key} {...getTokenProps({ token })} />
                      ))}
                    </span>
                  </div>
                ))}
              </pre>
            )}
          </Highlight>
        ) : (
          <pre className="h-full p-4 font-mono text-[12.5px] leading-6 text-ink">{display}</pre>
        )}
      </div>
    </Panel>
  );
}
