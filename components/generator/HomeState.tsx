"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AdvancedSettings } from "@/components/generator/AdvancedSettings";
import { InputCommand } from "@/components/generator/InputCommand";
import { StyleSelector } from "@/components/generator/StyleSelector";
import { LogoMark, Wordmark } from "@/components/layout/Logo";
import { useApp } from "@/lib/app-context";

const ease = [0.22, 1, 0.36, 1] as const;

export function HomeState() {
  const { style, setStyle, advanced, setAdvanced } = useApp();
  const reduce = useReducedMotion();

  const fadeUp = {
    hidden: { opacity: 0, y: reduce ? 0 : 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
  };

  return (
    <div className="relative flex h-full items-center justify-center overflow-auto px-4 py-8 md:px-8">
      <div className="orb left-[12%] top-[18%] h-40 w-40 bg-accent/20" />
      <div className="orb right-[10%] top-[28%] h-32 w-32 bg-cyan-400/10" style={{ animationDelay: "-4s" }} />

      <motion.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: reduce ? 0 : 0.08 } } }}
        className="relative flex w-full max-w-4xl flex-col items-center text-center"
      >
        <motion.div variants={fadeUp} className="mb-6 flex flex-col items-center gap-3">
          <LogoMark size={72} className="rounded-[18px]" />
          <Wordmark className="text-2xl sm:text-3xl" />
        </motion.div>

        <motion.p variants={fadeUp} className="mb-4 text-[11px] uppercase tracking-[0.28em] text-faint">
          Interface laboratory
        </motion.p>
        <motion.h1
          variants={fadeUp}
          className="max-w-4xl text-[42px] font-semibold leading-[1.05] tracking-[-0.04em] text-ink sm:text-6xl md:text-[72px]"
        >
          Turn any interface into React.
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-5 max-w-xl text-base text-muted sm:text-lg">
          Paste a URL or drop a screenshot. Reactify handles the rest.
        </motion.p>

        <motion.div variants={fadeUp} className="mt-10 w-full">
          <InputCommand />
        </motion.div>

        <motion.div variants={fadeUp} className="mt-8 w-full">
          <StyleSelector value={style} onChange={setStyle} />
        </motion.div>

        <motion.div variants={fadeUp} className="mt-6 w-full">
          <AdvancedSettings value={advanced} onChange={setAdvanced} />
        </motion.div>
      </motion.div>
    </div>
  );
}
