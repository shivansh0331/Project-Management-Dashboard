"use client";

import React from "react";
import { AlertTriangle, RotateCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#09090b] text-[#fafafa] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full border border-red-500/20 bg-[#18181b] rounded-2xl p-8 space-y-6 text-center shadow-2xl">
          <div className="mx-auto h-16 w-16 bg-red-500/10 text-red-500 flex items-center justify-center rounded-full">
            <AlertTriangle className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Critical Error!</h2>
            <p className="text-[#a1a1aa] text-sm leading-relaxed">
              A critical application error occurred. The page layout failed to load.
            </p>
          </div>

          {error.digest && (
            <div className="bg-[#27272a] border border-[#27272a] p-3 rounded-lg text-xs font-mono text-[#a1a1aa] break-all">
              Digest: {error.digest}
            </div>
          )}

          <button
            onClick={() => reset()}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#3b82f6] text-white font-semibold text-sm hover:bg-[#3b82f6]/90 transition-all cursor-pointer shadow-md"
          >
            <RotateCw className="h-4 w-4" />
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
