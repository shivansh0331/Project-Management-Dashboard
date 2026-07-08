"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FolderKanban,
  Settings,
  Menu,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Zap,
  LogOut,
} from "lucide-react";
import { useTheme } from "@/providers/providers";
import { useAuth } from "@/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/cn"; // Custom helper to merge tailwind class names

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Projects", href: "/projects", icon: FolderKanban },
    { name: "Settings", href: "#", icon: Settings, isUiOnly: true },
  ];

  const sidebarVariants = {
    expanded: { width: 256, transition: { duration: 0.3, ease: "easeInOut" } },
    collapsed: { width: 76, transition: { duration: 0.3, ease: "easeInOut" } },
  } as const;

  const navContent = (
    <div className="flex-1 flex flex-col h-full bg-card border-r border-border relative">
      {/* Sidebar Header / Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
          <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20 shrink-0">
            <Zap className="h-5 w-5" />
          </div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="text-lg font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-foreground to-muted-foreground"
            >
              Zenith Flow
            </motion.span>
          )}
        </Link>

        {/* Collapse Toggle Button (Desktop Only) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex h-6 w-6 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group relative",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-105",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="whitespace-nowrap"
                >
                  {item.name}
                  {item.isUiOnly && (
                    <span className="ml-2 px-1.5 py-0.5 text-[10px] font-semibold bg-secondary text-muted-foreground rounded-md border border-border">
                      UI
                    </span>
                  )}
                </motion.span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Theme Toggle & User Info */}
      <div className="p-3 border-t border-border space-y-3">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border bg-background hover:bg-secondary text-muted-foreground hover:text-foreground transition-all cursor-pointer text-xs font-semibold shadow-sm",
            collapsed ? "px-0" : "px-3"
          )}
        >
          {theme === "dark" ? (
            <>
              <Sun className="h-4 w-4 text-amber-500" />
              {!collapsed && <span>Light Mode</span>}
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 text-blue-500" />
              {!collapsed && <span>Dark Mode</span>}
            </>
          )}
        </button>

        {/* User Card */}
        <div
          onClick={collapsed ? logout : undefined}
          className={cn(
            "flex items-center justify-between p-1.5 rounded-xl bg-secondary/30 border border-border/40 overflow-hidden",
            collapsed && "cursor-pointer hover:bg-danger/10 hover:border-danger/25 group/user"
          )}
          title={collapsed ? "Logout session" : undefined}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={cn(
              "h-8 w-8 shrink-0 rounded-lg bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center font-bold text-white text-xs shadow-inner uppercase transition-all duration-200",
              collapsed && "group-hover/user:from-danger group-hover/user:to-red-600"
            )}>
              {collapsed ? (
                <>
                  <span className="group-hover/user:hidden">{user?.name.slice(0, 2) || "JD"}</span>
                  <LogOut className="hidden group-hover/user:block h-3.5 w-3.5 text-white" />
                </>
              ) : (
                user?.name.slice(0, 2) || "JD"
              )}
            </div>
            {!collapsed && (
              <div className="flex flex-col text-left min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold truncate leading-tight text-foreground">
                    {user?.name || "Guest"}
                  </span>
                  <Badge variant={user?.role === "ADMIN" ? "success" : "secondary"} className="text-[7px] px-1 py-0 select-none scale-[0.85] leading-none shrink-0 border border-border/10">
                    {user?.role === "ADMIN" ? "Admin" : "User"}
                  </Badge>
                </div>
                <span className="text-[9px] text-muted-foreground truncate mt-0.5">
                  {user?.email || "guest@zenith.flow"}
                </span>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={logout}
              className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-danger hover:bg-danger/10 transition-all cursor-pointer border border-border bg-background shrink-0"
              title="Logout session"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Collapsible) */}
      <motion.aside
        animate={collapsed ? "collapsed" : "expanded"}
        variants={sidebarVariants}
        className="hidden md:block h-screen sticky top-0 shrink-0 select-none z-30"
      >
        {navContent}
      </motion.aside>

      {/* Mobile Drawer Navigation (Backdrop + Content) */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 w-72 z-50 md:hidden h-full"
            >
              <div className="h-full relative">
                {navContent}
                {/* Close handle */}
                <button
                  onClick={() => setMobileOpen(false)}
                  className="absolute right-[-48px] top-4 h-9 w-9 bg-card border border-border rounded-xl flex items-center justify-center text-foreground hover:bg-secondary cursor-pointer shadow-lg"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
