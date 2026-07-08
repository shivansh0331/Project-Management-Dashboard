"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Folder, LayoutDashboard, Moon, Sun, ArrowRight, CornerDownLeft } from "lucide-react";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import { useTheme } from "@/providers/providers";
import { fuzzySearch } from "@/utils/search";
import { Project } from "@/types";
import { cn } from "@/utils/cn";

interface CommandPaletteProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function CommandPalette({ isOpen, setIsOpen }: CommandPaletteProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch projects list for searching
  const { data: projectsResponse } = useQuery<{ data: Project[] }>({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    },
    enabled: isOpen,
  });

  const projects = projectsResponse?.data || [];

  // Bind Keyboard Shortcut Ctrl+K / Cmd+K
  useKeyboardShortcut("k", () => setIsOpen(!isOpen), { ctrlKey: true });
  useKeyboardShortcut("k", () => setIsOpen(!isOpen), { metaKey: true });

  // Escape to close
  useKeyboardShortcut("Escape", () => {
    if (isOpen) setIsOpen(false);
  });

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle fuzzy search
  const filteredProjects = fuzzySearch(projects, search, ["title", "description"]);

  const staticShortcuts = [
    {
      id: "nav-dashboard",
      title: "Go to Dashboard",
      subtitle: "Navigate to the main page",
      icon: LayoutDashboard,
      action: () => router.push("/"),
    },
    {
      id: "nav-projects",
      title: "Go to Projects",
      subtitle: "Browse project details and tables",
      icon: Folder,
      action: () => router.push("/projects"),
    },
    {
      id: "toggle-theme",
      title: `Toggle Theme (Current: ${theme === "dark" ? "Dark" : "Light"})`,
      subtitle: "Change application theme system",
      icon: theme === "dark" ? Sun : Moon,
      action: () => toggleTheme(),
    },
  ];

  // Combine results: matching projects first, then static shortcuts
  const searchResults = [
    ...filteredProjects.map((p) => ({
      id: `project-${p.id}`,
      title: p.title,
      subtitle: `Project #${p.id} • ${p.status}`,
      icon: Folder,
      action: () => router.push(`/projects/${p.id}`),
    })),
    ...staticShortcuts.filter(
      (s) =>
        search === "" ||
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.subtitle.toLowerCase().includes(search.toLowerCase())
    ),
  ];

  // Reset index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Keyboard navigation inside menu
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % searchResults.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (searchResults[selectedIndex]) {
        searchResults[selectedIndex].action();
        setIsOpen(false);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4 select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[70vh] focus-visible:outline-none"
            onKeyDown={handleKeyDown}
            ref={containerRef}
            tabIndex={0}
          >
            {/* Search Input block */}
            <div className="flex items-center gap-3 px-4 border-b border-border h-12">
              <Search className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type a project name or command shortcut..."
                className="flex-1 bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground text-sm h-full w-full focus:ring-0"
              />
              <span className="text-[10px] font-semibold bg-secondary border border-border px-1.5 py-0.5 rounded-md text-muted-foreground leading-none">
                ESC
              </span>
            </div>

            {/* List block */}
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5 scrollbar-thin">
              {searchResults.length > 0 ? (
                searchResults.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        item.action();
                        setIsOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between gap-3 p-3 rounded-xl text-left transition-colors duration-150 cursor-pointer",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-secondary/60 text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <item.icon className={cn("h-4.5 w-4.5 shrink-0", isSelected ? "text-primary-foreground" : "text-muted-foreground")} />
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold truncate leading-snug">{item.title}</span>
                          <span className={cn("text-[10px] truncate leading-tight", isSelected ? "text-primary-foreground/75" : "text-muted-foreground")}>
                            {item.subtitle}
                          </span>
                        </div>
                      </div>
                      
                      {/* Interactive Selection Guide indicator */}
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-1.5 text-[10px] font-medium opacity-85 shrink-0"
                        >
                          <span>Select</span>
                          <CornerDownLeft className="h-3 w-3" />
                        </motion.div>
                      )}
                    </button>
                  );
                })
              ) : (
                /* Empty Fuzzy Results illustration */
                <div className="py-12 text-center flex flex-col items-center justify-center space-y-2.5">
                  <span className="text-xl">🔍</span>
                  <p className="text-xs font-bold text-foreground">No matches found</p>
                  <p className="text-[10px] text-muted-foreground max-w-[200px]">
                    We couldn't find any projects or action commands matching "{search}".
                  </p>
                </div>
              )}
            </div>

            {/* Guide footer */}
            <div className="px-4 py-2 border-t border-border bg-secondary/40 text-[9px] text-muted-foreground flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="font-mono bg-card px-1 py-0.5 rounded border border-border">↑↓</span> Move
                </span>
                <span className="flex items-center gap-1">
                  <span className="font-mono bg-card px-1 py-0.5 rounded border border-border">Enter</span> Select
                </span>
              </div>
              <span>Zenith Command Hub</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
