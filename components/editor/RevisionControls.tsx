"use client";

import React from "react";
import { Redo2, Undo2 } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { useApp } from "@/lib/app-context";

export function RevisionControls() {
  const { undo, redo, canUndo, canRedo, revisions, revisionIndex } = useApp();
  const current = revisions[revisionIndex];

  return (
    <div className="flex items-center gap-1">
      <IconButton label="Undo" side="bottom" compact disabled={!canUndo} onClick={undo}>
        <Undo2 className="h-4 w-4" />
      </IconButton>
      <IconButton label="Redo" side="bottom" compact disabled={!canRedo} onClick={redo}>
        <Redo2 className="h-4 w-4" />
      </IconButton>
      {current && (
        <span className="hidden max-w-[180px] truncate text-[11px] text-faint lg:inline">
          {current.label}
        </span>
      )}
    </div>
  );
}
