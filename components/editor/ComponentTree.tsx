"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, Layers } from "lucide-react";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { useApp } from "@/lib/app-context";
import type { ComponentTreeNode } from "@/lib/parser/jsx-tree";
import { cn } from "@/lib/utils";

function TreeItem({
  node,
  depth,
}: {
  node: ComponentTreeNode;
  depth: number;
}) {
  const { selectedElementId, setSelectedElementId } = useApp();
  const [open, setOpen] = useState(depth < 2);
  const selected = selectedElementId === node.id;
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div className="flex items-center">
        <button
          type="button"
          aria-label={open ? "Collapse" : "Expand"}
          className="flex h-6 w-6 items-center justify-center text-faint"
          onClick={() => setOpen((value) => !value)}
          disabled={!hasChildren}
        >
          {hasChildren ? (
            open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <span className="h-1 w-1 rounded-full bg-faint" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setSelectedElementId(node.id)}
          className={cn(
            "min-w-0 flex-1 truncate rounded-md px-2 py-1 text-left text-xs transition-colors duration-200",
            selected ? "bg-accent-dim text-ink" : "text-muted hover:bg-wash hover:text-ink"
          )}
          style={{ paddingLeft: `${depth * 8 + 8}px` }}
        >
          <span className="font-medium">{node.name}</span>
          {node.text && <span className="ml-2 text-faint">{node.text}</span>}
        </button>
      </div>
      {open &&
        node.children.map((child) => <TreeItem key={child.id} node={child} depth={depth + 1} />)}
    </div>
  );
}

export function ComponentTree() {
  const { componentTree, treeWarnings, generatedCode } = useApp();

  return (
    <Panel className="flex h-full flex-col">
      <PanelHeader>
        <span className="inline-flex items-center gap-2 text-xs font-medium text-ink">
          <Layers className="h-3.5 w-3.5 text-accent" />
          Component tree
        </span>
      </PanelHeader>
      <div className="min-h-0 flex-1 overflow-auto p-2">
        {!generatedCode && (
          <p className="px-2 py-6 text-center text-xs text-muted">Generate a component to inspect its hierarchy.</p>
        )}
        {generatedCode && componentTree.length === 0 && (
          <p className="px-2 py-6 text-center text-xs text-muted">
            {treeWarnings[0] || "No JSX tree was detected."}
          </p>
        )}
        {componentTree.map((node) => (
          <TreeItem key={node.id} node={node} depth={0} />
        ))}
      </div>
    </Panel>
  );
}
