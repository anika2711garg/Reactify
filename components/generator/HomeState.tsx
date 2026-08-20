"use client";

import React from "react";
import { AdvancedSettings } from "@/components/generator/AdvancedSettings";
import { InputCommand } from "@/components/generator/InputCommand";
import { StyleSelector } from "@/components/generator/StyleSelector";
import { useApp } from "@/lib/app-context";

export function HomeState() {
  const { style, setStyle, advanced, setAdvanced } = useApp();

  return (
    <div className="flex h-full items-center justify-center overflow-auto px-4 py-10 md:px-8">
      <div className="flex w-full max-w-4xl flex-col items-center text-center">
        <p className="mb-5 text-[11px] uppercase tracking-[0.28em] text-faint">
          Interface laboratory
        </p>
        <h1 className="max-w-4xl text-[42px] font-semibold leading-[1.05] tracking-[-0.04em] text-ink sm:text-6xl md:text-[72px]">
          Turn any interface into React.
        </h1>
        <p className="mt-5 max-w-xl text-base text-muted sm:text-lg">
          Paste a URL or drop a screenshot. Reactify handles the rest.
        </p>

        <div className="mt-10 w-full">
          <InputCommand />
        </div>

        <div className="mt-8 w-full">
          <StyleSelector value={style} onChange={setStyle} />
        </div>

        <div className="mt-6 w-full">
          <AdvancedSettings value={advanced} onChange={setAdvanced} />
        </div>
      </div>
    </div>
  );
}
