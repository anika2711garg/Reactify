"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";

export function SectionPicker() {
  const { sections, handleSelectSection, isGenerating, url, screenshot, uploadedImage } = useApp();
  const source = screenshot || uploadedImage;

  return (
    <div className="flex h-full flex-col overflow-auto px-4 py-6 md:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <p className="text-[11px] uppercase tracking-[0.18em] text-faint">Step 2</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Choose what to generate</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted">
          Pick one part of the page. Reactify will generate the React component, then you can preview it and copy the
          code.
        </p>
        {url && <p className="mt-2 truncate text-xs text-faint">{url}</p>}

        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {sections.map((section, index) => (
            <motion.button
              key={section.id}
              type="button"
              disabled={isGenerating}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              onClick={() => handleSelectSection(section)}
              className={cn(
                "rounded-[16px] border border-stroke bg-surface p-4 text-left shadow-panel transition-all duration-200",
                "hover:border-stroke-strong hover:bg-wash disabled:opacity-60"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="rounded-md bg-accent/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-accent-soft">
                  {section.type}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-accent">
                  <Sparkles className="h-3.5 w-3.5" />
                  Generate
                </span>
              </div>
              <h2 className="mt-3 text-base font-medium text-ink">{section.name}</h2>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
                {section.previewText.replace(/\.\.\.$/, "")}
              </p>
            </motion.button>
          ))}
        </div>

        {source && (
          <div className="mt-8 overflow-hidden rounded-[16px] border border-stroke bg-canvas">
            <p className="border-b border-stroke px-4 py-2 text-[11px] uppercase tracking-[0.14em] text-faint">
              Captured page
            </p>
            <img src={source} alt="Captured page" className="max-h-64 w-full object-contain object-top" />
          </div>
        )}
      </div>
    </div>
  );
}
