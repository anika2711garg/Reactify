"use client";

import React, { useState } from "react";
import { Code2, Eye, Image as ImageIcon } from "lucide-react";
import { GenerationStage } from "@/components/generator/GenerationStage";
import { CodePanel } from "@/components/code-editor/CodePanel";
import { PreviewCanvas } from "@/components/preview/PreviewCanvas";
import { RefinementBar } from "@/components/workspace/RefinementBar";
import { SourcePanel } from "@/components/workspace/SourcePanel";
import { Tabs } from "@/components/ui/Tabs";
import { useApp } from "@/lib/app-context";
import type { WorkspacePane } from "@/lib/types";
import { cn } from "@/lib/utils";

export function Workspace() {
  const { isScraping, isGenerating, generatedCode, generationStage, screenshot, uploadedImage, sections } = useApp();
  const [pane, setPane] = useState<WorkspacePane>("preview");
  const [codeExpanded, setCodeExpanded] = useState(false);
  const [sourceWidth, setSourceWidth] = useState(22);
  const [codeWidth, setCodeWidth] = useState(30);
  const showStages = (isScraping || isGenerating) && !generatedCode;

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
                <div style={{ width: `${sourceWidth}%` }} className="min-w-[220px] shrink-0">
                  <SourcePanel />
                </div>
                <button
                  type="button"
                  aria-label="Resize source panel"
                  onMouseDown={startResize("source")}
                  className="mx-1 w-1.5 shrink-0 cursor-ew-resize rounded-full bg-white/0 hover:bg-white/10"
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
              className="mx-1 w-1.5 shrink-0 cursor-ew-resize rounded-full bg-white/0 hover:bg-white/10"
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
