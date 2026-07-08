"use client";

import React, { forwardRef, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, containerClassName, id, rows = 4, ...props }, ref) => {
    const textareaId = id || useId();

    return (
      <div className={cn("flex flex-col gap-1.5 w-full relative", containerClassName)}>
        {label && (
          <label
            htmlFor={textareaId}
            className="text-xs font-bold text-muted-foreground select-none leading-none transition-colors duration-200"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <textarea
            id={textareaId}
            ref={ref}
            rows={rows}
            className={cn(
              "w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50 resize-y min-h-[80px]",
              error && "border-destructive focus:border-destructive focus:ring-destructive",
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${textareaId}-error` : undefined}
            {...props}
          />
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              id={`${textareaId}-error`}
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

Textarea.displayName = "Textarea";
