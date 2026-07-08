"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

// 1. Horizontal Progress Bar
interface ProgressBarProps {
  value: number; // 0 to 100
  className?: string;
  showText?: boolean;
}

export function ProgressBar({ value, className, showText = false }: ProgressBarProps) {
  const percentage = Math.min(Math.max(value, 0), 100);

  return (
    <div className={cn("w-full flex flex-col gap-1", className)}>
      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden border border-border/40 relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full bg-primary rounded-full"
        />
      </div>
      {showText && (
        <span className="text-[10px] font-bold text-muted-foreground self-end leading-none select-none">
          {percentage}% Complete
        </span>
      )}
    </div>
  );
}

// 2. Circular Progress Ring
interface ProgressRingProps {
  value: number; // 0 to 100
  size?: number; // width and height in px
  strokeWidth?: number;
  className?: string;
}

export function ProgressRing({ value, size = 80, strokeWidth = 8, className }: ProgressRingProps) {
  const percentage = Math.min(Math.max(value, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn("relative flex items-center justify-center select-none shrink-0", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Track Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
          className="transition-colors duration-300"
        />
        {/* Foreground Progress Circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="var(--primary)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      {/* Percentage Center Text */}
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-sm font-black text-foreground tracking-tight leading-none">
          {percentage}%
        </span>
      </div>
    </div>
  );
}
