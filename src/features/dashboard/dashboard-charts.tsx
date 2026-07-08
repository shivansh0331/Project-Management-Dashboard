"use client";

import React, { useEffect, useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { useTheme } from "@/providers/providers";

interface ChartsProps {
  projectStats: {
    active: number;
    completed: number;
    onHold: number;
  };
  taskStats: {
    pending: number;
    inProgress: number;
    completed: number;
  };
}

export function DashboardCharts({ projectStats, taskStats }: ChartsProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[340px] bg-card border border-border rounded-2xl animate-pulse" />
        <div className="h-[340px] bg-card border border-border rounded-2xl animate-pulse" />
      </div>
    );
  }

  const isDark = theme === "dark";

  // Data mapping
  const projectData = [
    { name: "Active", value: projectStats.active, color: "#3B82F6" }, // Primary Blue
    { name: "Completed", value: projectStats.completed, color: "#22C55E" }, // Success Green
    { name: "On Hold", value: projectStats.onHold, color: "#F59E0B" }, // Warning Amber
  ].filter((item) => item.value > 0);

  const taskData = [
    { name: "Pending", count: taskStats.pending, color: "#A1A1AA" }, // Muted gray
    { name: "In Progress", count: taskStats.inProgress, color: "#3B82F6" }, // Blue
    { name: "Completed", count: taskStats.completed, color: "#22C55E" }, // Green
  ];

  const tooltipContentStyle = {
    backgroundColor: isDark ? "#18181B" : "#FFFFFF",
    borderColor: isDark ? "#27272A" : "#E4E4E7",
    color: isDark ? "#FAFAFA" : "#09090B",
    borderRadius: "12px",
    fontSize: "12px",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 select-none">
      {/* Task Status Bar Chart */}
      <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5 flex flex-col justify-between hover:border-border/80 transition-colors shadow-sm">
        <div className="flex flex-col text-left">
          <h3 className="text-sm font-bold text-foreground">Task Distribution</h3>
          <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
            Comparison of task volume grouped by current lifecycle state.
          </p>
        </div>

        <div className="h-[240px] w-full mt-4 flex items-center justify-center">
          {taskStats.pending === 0 && taskStats.inProgress === 0 && taskStats.completed === 0 ? (
            <div className="text-xs text-muted-foreground font-semibold">No tasks available to graph.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  stroke={isDark ? "#71717A" : "#888888"}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke={isDark ? "#71717A" : "#888888"}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip contentStyle={tooltipContentStyle} cursor={{ fill: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={45}>
                  {taskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Project Status Pie Chart */}
      <div className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between hover:border-border/80 transition-colors shadow-sm">
        <div className="flex flex-col text-left">
          <h3 className="text-sm font-bold text-foreground">Project Allocation</h3>
          <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
            Proportional split of projects by current operational status.
          </p>
        </div>

        <div className="h-[200px] w-full mt-4 relative flex items-center justify-center">
          {projectData.length === 0 ? (
            <div className="text-xs text-muted-foreground font-semibold">No projects to display.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {projectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipContentStyle} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Custom Legend */}
        <div className="flex items-center justify-center gap-4 mt-2 text-[10px] font-semibold text-muted-foreground shrink-0">
          {projectData.map((item) => (
            <div key={item.name} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span>
                {item.name} ({item.value})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
