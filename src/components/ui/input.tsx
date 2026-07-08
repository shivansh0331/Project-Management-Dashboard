"use client";

import React, { forwardRef, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, containerClassName, id, ...props }, ref) => {
    const inputId = id || useId();

    return (
      <div className={cn("flex flex-col gap-1.5 w-full relative", containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-bold text-muted-foreground select-none leading-none transition-colors duration-200"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            type={type}
            className={cn(
              "w-full h-10 px-3.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-destructive focus:border-destructive focus:ring-destructive",
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              id={`${inputId}-error`}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="text-[10px] font-semibold text-destructive leading-none mt-0.5"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = "Input";
