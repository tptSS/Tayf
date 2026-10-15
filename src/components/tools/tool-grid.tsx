"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ConverterSummary } from "@/converters/types";
import { ToolCard } from "./tool-card";

export function ToolGrid({ converters }: { converters: ConverterSummary[] }) {
  const reduceMotion = useReducedMotion();

  if (converters.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        Aramanla eşleşen bir araç bulamadım.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {converters.map((converter, index) => (
        <motion.div
          key={converter.slug}
          layout={!reduceMotion}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: reduceMotion ? 0 : Math.min(index * 0.02, 0.3) }}
        >
          <ToolCard converter={converter} />
        </motion.div>
      ))}
    </div>
  );
}
