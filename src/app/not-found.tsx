import React from "react";
import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 relative">
      <div className="max-w-md w-full text-center space-y-6 z-10">
        {/* Glow compass icon */}
        <div className="mx-auto h-24 w-24 bg-primary/10 text-primary flex items-center justify-center rounded-full shadow-lg relative overflow-hidden animate-pulse">
          <Compass className="h-12 w-12" />
        </div>

        <div className="space-y-3">
          <h1 className="text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600 dark:from-primary dark:to-cyan-400">
            404
          </h1>
          <h2 className="text-xl font-bold tracking-tight">Page Not Found</h2>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto leading-relaxed">
            The page you are looking for does not exist, has been removed, or is temporarily unavailable.
          </p>
        </div>

        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all cursor-pointer shadow-md glow-on-hover"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
