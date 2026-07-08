"use client";

import React from "react";
import { Menu, Search, Bell, Command, Keyboard } from "lucide-react";
import { cn } from "@/utils/cn";

interface NavbarProps {
  onMenuClick: () => void;
  onSearchClick: () => void;
  title?: string;
}

export function Navbar({ onMenuClick, onSearchClick, title = "Dashboard" }: NavbarProps) {
  return (
    <header className="h-16 border-b border-border bg-card/65 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-6 select-none">
      {/* Left side: Mobile Toggle + Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
          aria-label="Toggle Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-md font-bold tracking-tight text-foreground md:text-lg">
          {title}
        </h1>
      </div>

      {/* Right side: Search, Notifications, Profile */}
      <div className="flex items-center gap-4">
        {/* Fake Search Trigger for Command Palette */}
        <button
          onClick={onSearchClick}
          className="hidden sm:flex items-center justify-between w-64 px-3.5 py-1.5 rounded-xl border border-border bg-background hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer shadow-sm text-xs select-none"
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5" />
            <span>Search projects...</span>
          </div>
          <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-md border border-border bg-secondary text-[10px] font-mono leading-none">
            <span className="text-[8px]">Ctrl</span>
            <span>K</span>
          </div>
        </button>

        {/* Mobile Search Button */}
        <button
          onClick={onSearchClick}
          className="sm:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </button>

        {/* Notifications Button (UI only) */}
        <button
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary relative transition-colors cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-card animate-pulse" />
        </button>

        {/* User avatar indicator (UI only) */}
        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center font-bold text-white text-xs shadow-inner cursor-pointer hover:opacity-90 transition-opacity border border-border">
          JD
        </div>
      </div>
    </header>
  );
}
