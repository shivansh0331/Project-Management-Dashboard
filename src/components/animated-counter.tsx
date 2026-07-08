"use client";

import React, { useEffect, useRef } from "react";
import { animate } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
}

export function AnimatedCounter({ value }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const controls = animate(0, value, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate(latest) {
        node.textContent = Math.round(latest).toString();
      },
    });

    return () => controls.stop();
  }, [value]);

  return <span ref={ref}>0</span>;
}
