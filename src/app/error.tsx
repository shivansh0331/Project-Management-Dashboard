"use client";

import React, { useEffect } from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Rendering Error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 relative">
      <div className="max-w-md w-full glass border border-destructive/20 rounded-2xl p-8 space-y-6 text-center shadow-xl glow-on-hover transition-all">
        <div className="mx-auto h-16 w-16 bg-destructive/10 text-destructive flex items-center justify-center rounded-full">
          <AlertCircle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Something went wrong!</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            An unexpected error occurred while rendering this page. The details have been logged.
          </p>
        </div>

        {error.digest && (
          <div className="bg-secondary/50 border border-border p-3 rounded-lg text-xs font-mono text-muted-foreground break-all">
            Digest: {error.digest}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all cursor-pointer shadow-md"
          >
            <RotateCcw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-secondary text-secondary-foreground border border-border font-semibold text-sm hover:bg-secondary/80 transition-all cursor-pointer"
          >
            <Home className="h-4 w-4" />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
