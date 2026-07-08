"use client";

import React, { useState } from "react";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";
import { CommandPalette } from "../command-palette";

import { useAuth } from "@/providers/auth-provider";
import { Loader2 } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function AppLayout({ children, title }: AppLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background select-none">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen w-full relative">
      {/* Sidebar navigation */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main app panel */}
      <div className="flex-1 flex flex-col min-w-0 bg-background relative">
        {/* Top Navbar */}
        <Navbar
          onMenuClick={() => setMobileOpen(true)}
          onSearchClick={() => setCommandPaletteOpen(true)}
          title={title}
        />

        {/* Content body */}
        <main className="flex-1 p-4 md:p-6 w-full max-w-7xl mx-auto overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Global Command palette search trigger */}
      <CommandPalette isOpen={commandPaletteOpen} setIsOpen={setCommandPaletteOpen} />
    </div>
  );
}
