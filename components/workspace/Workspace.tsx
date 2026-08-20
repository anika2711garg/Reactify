"use client";

import React, { useEffect, useState } from "react";
import { Code2, Eye, GitBranch, Image as ImageIcon } from "lucide-react";
import { GenerationStage } from "@/components/generator/GenerationStage";
import { CodePanel } from "@/components/code-editor/CodePanel";
import { PreviewCanvas } from "@/components/preview/PreviewCanvas";
import { RefinementBar } from "@/components/workspace/RefinementBar";
import { SourcePanel } from "@/components/workspace/SourcePanel";
import { ComponentTree } from "@/components/editor/ComponentTree";
import { RevisionControls } from "@/components/editor/RevisionControls";
import { Tabs } from "@/components/ui/Tabs";
import { useApp } from "@/lib/app-context";
import type { WorkspacePane } from "@/lib/types";
import { cn } from "@/lib/utils";

type LeftPane = "source" | "tree";

export function Workspace() {
  const {
    isScraping,
    isGenerating,
    generatedCode,
    generationStage,
    screenshot,
    uploadedImage,
    sections,
    undo,
    redo,
    setSelectedElementId,
  } = useApp();
  const [pane, setPane] = useState<WorkspacePane>("preview");
  const [leftPane, setLeftPane] = useState<LeftPane>("source");
  const [codeExpanded, setCodeExpanded] = useState(false);
  const [sourceWidth, setSourceWidth] = useState(22);
  const [codeWidth, setCodeWidth] = useState(30);
  const showStages = (isScraping || isGenerating) && !generatedCode;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const typing = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        if (typing) return;
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      }
      if (event.key === "Escape") setSelectedElementId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [redo, setSelectedElementId, undo]);

  const startResize = (edge: "source" | "code") => (event: React.MouseEvent) => {
    event.preventDefault();
    const startX = event.clientX;
    const startSource = sourceWidth;
    const startCode = codeWidth;

    const move = (moveEvent: MouseEvent) => {
      const delta = ((moveEvent.clientX - startX) / window.innerWidth) * 100;
      if (edge === "source") setSourceWidth(Math.min(36, Math.max(16, startSource + delta)));
      if (edge === "code") setCodeWidth(Math.min(46, Math.max(22, startCode - delta)));
    };
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  return (
    <div className="flex h-full flex-col gap-3 p-3 md:p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center justify-between lg:hidden">
          <Tabs
            value={pane}
            onChange={setPane}
            tabs={[
              { id: "source", label: "Source", icon: <ImageIcon className="h-3.5 w-3.5" /> },
              { id: "preview", label: "Preview", icon: <Eye className="h-3.5 w-3.5" /> },
              { id: "code", label: "Code", icon: <Code2 className="h-3.5 w-3.5" /> },
            ]}
          />
        </div>
        <RevisionControls />
      </div>

      {showStages ? (
        <div className="min-h-0 flex-1">
          <GenerationStage
            stage={generationStage}
            screenshot={screenshot || uploadedImage}
            sectionLabels={sections.map((section) => section.name)}
          />
        </div>
      ) : (
        <>
          <div className="hidden min-h-0 flex-1 lg:flex">
            {!codeExpanded && (
              <>
                <div style={{ width: `${sourceWidth}%` }} className="flex min-w-[240px] shrink-0 flex-col gap-2">
                  <Tabs
                    value={leftPane}
                    onChange={setLeftPane}
                    tabs={[
                      { id: "source", label: "Source", icon: <ImageIcon className="h-3.5 w-3.5" /> },
                      { id: "tree", label: "Tree", icon: <GitBranch className="h-3.5 w-3.5" /> },
                    ]}
                  />
                  <div className="min-h-0 flex-1">
                    {leftPane === "source" ? <SourcePanel /> : <ComponentTree />}
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Resize source panel"
                  onMouseDown={startResize("source")}
                  className="mx-1 w-1.5 shrink-0 cursor-ew-resize rounded-full bg-transparent hover:bg-wash"
                />
              </>
            )}

            <div className="min-w-0 flex-1">
              <PreviewCanvas />
            </div>

            <button
              type="button"
              aria-label="Resize code panel"
              onMouseDown={startResize("code")}
              className="mx-1 w-1.5 shrink-0 cursor-ew-resize rounded-full bg-transparent hover:bg-wash"
            />
            <div
              style={{ width: codeExpanded ? "46%" : `${codeWidth}%` }}
              className={cn("min-w-[280px] shrink-0 transition-[width] duration-300")}
            >
              <CodePanel expanded={codeExpanded} onToggleExpand={() => setCodeExpanded((value) => !value)} />
            </div>
          </div>

          <div className="min-h-0 flex-1 lg:hidden">
            {pane === "source" && <SourcePanel />}
            {pane === "preview" && <PreviewCanvas />}
            {pane === "code" && <CodePanel />}
          </div>
        </>
      )}

      <RefinementBar />
    </div>
  );
}
