import React from "react";

export default function Loading() {
  return (
    <div className="w-full min-h-screen flex bg-background text-foreground">
      {/* Sidebar Skeleton */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card p-6 space-y-6">
        <div className="h-8 w-32 bg-secondary rounded-md animate-pulse" />
        <div className="space-y-3">
          <div className="h-10 w-full bg-secondary rounded-md animate-pulse" />
          <div className="h-10 w-full bg-secondary rounded-md animate-pulse" />
          <div className="h-10 w-full bg-secondary rounded-md animate-pulse" />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Navbar Skeleton */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card">
          <div className="h-8 w-48 bg-secondary rounded-md animate-pulse" />
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 bg-secondary rounded-full animate-pulse" />
            <div className="h-8 w-8 bg-secondary rounded-full animate-pulse" />
            <div className="h-8 w-8 bg-secondary rounded-full animate-pulse" />
          </div>
        </header>

        {/* Dashboard Content Skeleton */}
        <main className="flex-1 p-6 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {/* Title */}
          <div className="h-8 w-48 bg-secondary rounded-md animate-pulse" />

          {/* KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="h-28 bg-card border border-border rounded-xl p-4 space-y-2">
              <div className="h-4 w-20 bg-secondary rounded animate-pulse" />
              <div className="h-8 w-12 bg-secondary rounded animate-pulse" />
              <div className="h-3 w-32 bg-secondary rounded animate-pulse" />
            </div>
            <div className="h-28 bg-card border border-border rounded-xl p-4 space-y-2">
              <div className="h-4 w-20 bg-secondary rounded animate-pulse" />
              <div className="h-8 w-12 bg-secondary rounded animate-pulse" />
              <div className="h-3 w-32 bg-secondary rounded animate-pulse" />
            </div>
            <div className="h-28 bg-card border border-border rounded-xl p-4 space-y-2">
              <div className="h-4 w-20 bg-secondary rounded animate-pulse" />
              <div className="h-8 w-12 bg-secondary rounded animate-pulse" />
              <div className="h-3 w-32 bg-secondary rounded animate-pulse" />
            </div>
            <div className="h-28 bg-card border border-border rounded-xl p-4 space-y-2">
              <div className="h-4 w-20 bg-secondary rounded animate-pulse" />
              <div className="h-8 w-12 bg-secondary rounded animate-pulse" />
              <div className="h-3 w-32 bg-secondary rounded animate-pulse" />
            </div>
          </div>

          {/* Charts Skeleton Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-80 bg-card border border-border rounded-xl p-6 flex flex-col justify-between">
              <div className="h-4 w-40 bg-secondary rounded animate-pulse" />
              <div className="h-48 w-full bg-secondary/50 rounded animate-pulse" />
            </div>
            <div className="h-80 bg-card border border-border rounded-xl p-6 flex flex-col justify-between">
              <div className="h-4 w-40 bg-secondary rounded animate-pulse" />
              <div className="h-48 w-full bg-secondary/50 rounded animate-pulse" />
            </div>
          </div>

          {/* Widgets Skeleton Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-96 bg-card border border-border rounded-xl p-6 space-y-4">
              <div className="h-4 w-48 bg-secondary rounded animate-pulse" />
              <div className="space-y-3">
                <div className="h-12 w-full bg-secondary/75 rounded animate-pulse" />
                <div className="h-12 w-full bg-secondary/75 rounded animate-pulse" />
                <div className="h-12 w-full bg-secondary/75 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-96 bg-card border border-border rounded-xl p-6 space-y-4">
              <div className="h-4 w-48 bg-secondary rounded animate-pulse" />
              <div className="space-y-3">
                <div className="h-12 w-full bg-secondary/75 rounded animate-pulse" />
                <div className="h-12 w-full bg-secondary/75 rounded animate-pulse" />
                <div className="h-12 w-full bg-secondary/75 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
