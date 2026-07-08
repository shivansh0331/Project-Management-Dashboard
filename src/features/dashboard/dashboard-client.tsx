"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderPlus,
  ClipboardList,
  Calendar,
  AlertCircle,
  TrendingUp,
  Activity,
  Plus,
  Search,
  ExternalLink,
  CheckCircle2,
  Clock,
  Pause,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { Project, Task, ProjectStatus, TaskStatus } from "@/types";
import { AnimatedCounter } from "@/components/animated-counter";
import { DashboardCharts } from "./dashboard-charts";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, daysRemaining, isOverdue } from "@/utils/date";

// Zod schemas for validation
const projectSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().max(500, "Description is too long"),
  status: z.enum(["Active", "Completed", "OnHold"] as const),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid deadline date",
  }),
});

const taskSchema = z.object({
  projectId: z.number({ message: "Select a valid project" }).int().positive("Select a valid project"),
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().max(500, "Description is too long"),
  status: z.enum(["Pending", "InProgress", "Completed"] as const),
});

type ProjectFormValues = z.infer<typeof projectSchema>;
type TaskFormValues = z.infer<typeof taskSchema>;

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
} as const;

export function DashboardClient() {
  const queryClient = useQueryClient();
  const { user, role } = useAuth();
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  // Forms setup
  const {
    register: registerProject,
    handleSubmit: handleProjectSubmit,
    reset: resetProjectForm,
    formState: { errors: projectErrors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: { title: "", description: "", status: "Active", deadline: "" },
  });

  const {
    register: registerTask,
    handleSubmit: handleTaskSubmit,
    reset: resetTaskForm,
    formState: { errors: taskErrors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: { projectId: undefined, title: "", description: "", status: "Pending" },
  });

  // Queries
  const { data: projectsData, isLoading: projectsLoading } = useQuery<{ data: Project[] }>({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to load projects");
      return res.json();
    },
  });

  const { data: tasksData, isLoading: tasksLoading } = useQuery<{ data: Task[] }>({
    queryKey: ["tasks"],
    queryFn: async () => {
      const res = await fetch("/api/tasks");
      if (!res.ok) throw new Error("Failed to load tasks");
      return res.json();
    },
  });

  const projects = projectsData?.data || [];
  const tasks = tasksData?.data || [];

  // Mutations (TanStack Query Optimistic UI)
  const createProjectMutation = useMutation({
    mutationFn: async (newProject: ProjectFormValues) => {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProject),
      });
      if (!res.ok) throw new Error("Failed to create project");
      return res.json();
    },
    onMutate: async (newProject) => {
      await queryClient.cancelQueries({ queryKey: ["projects"] });
      const previousProjects = queryClient.getQueryData<{ data: Project[] }>(["projects"]);
      
      // Optimistically insert project (with random mock ID)
      if (previousProjects) {
        queryClient.setQueryData(["projects"], {
          ...previousProjects,
          data: [
            {
              id: Math.floor(Math.random() * 1000) + 200,
              title: newProject.title,
              description: newProject.description,
              status: newProject.status,
              deadline: newProject.deadline,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            ...previousProjects.data,
          ],
        });
      }

      return { previousProjects };
    },
    onError: (err, newProject, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(["projects"], context.previousProjects);
      }
      toast.error("Failed to create project. Please try again.");
    },
    onSuccess: () => {
      toast.success("Project created successfully!");
      setProjectModalOpen(false);
      resetProjectForm();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (newTask: TaskFormValues) => {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });
      if (!res.ok) throw new Error("Failed to create task");
      return res.json();
    },
    onMutate: async (newTask) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousTasks = queryClient.getQueryData<{ data: Task[] }>(["tasks"]);

      if (previousTasks) {
        queryClient.setQueryData(["tasks"], {
          ...previousTasks,
          data: [
            {
              id: Math.floor(Math.random() * 1000) + 1000,
              title: newTask.title,
              description: newTask.description,
              status: newTask.status,
              projectId: newTask.projectId,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            ...previousTasks.data,
          ],
        });
      }

      return { previousTasks };
    },
    onError: (err, newTask, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(["tasks"], context.previousTasks);
      }
      toast.error("Failed to create task. Please try again.");
    },
    onSuccess: () => {
      toast.success("Task created successfully!");
      setTaskModalOpen(false);
      resetTaskForm();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] }); // Invalidate projects to recount progress
    },
  });

  const onAddProject = (data: ProjectFormValues) => {
    createProjectMutation.mutate(data);
  };

  const onAddTask = (data: TaskFormValues) => {
    createTaskMutation.mutate(data);
  };

  if (projectsLoading || tasksLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-card border border-border rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-card border border-border rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-80 bg-card border border-border rounded-xl animate-pulse" />
      </div>
    );
  }

  // Calculate metrics
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === "Active").length;
  const completedProjects = projects.filter((p) => p.status === "Completed").length;
  const onHoldProjects = projects.filter((p) => p.status === "OnHold").length;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "Completed").length;
  const inProgressTasks = tasks.filter((t) => t.status === "InProgress").length;
  const pendingTasks = tasks.filter((t) => t.status === "Pending").length;

  const overallCompletion = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // List recent projects (last 3)
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  // List upcoming deadlines (Active or OnHold, sorted by nearest deadline)
  const upcomingDeadlines = projects
    .filter((p) => p.status !== "Completed")
    .map((p) => ({
      ...p,
      daysLeft: daysRemaining(p.deadline),
    }))
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 3);

  // Generate simulated activity feed based on actual records
  const recentActivity = [
    ...projects.map((p) => ({
      id: `act-proj-${p.id}`,
      type: "project-created",
      title: "Project Registered",
      description: `Project "${p.title}" was registered in workspace.`,
      time: p.createdAt,
      icon: FolderPlus,
      color: "text-blue-500 bg-blue-500/10",
    })),
    ...tasks.map((t) => ({
      id: `act-task-${t.id}`,
      type: "task-created",
      title: "Task Assigned",
      description: `Task "${t.title}" was added to project #${t.projectId}.`,
      time: t.createdAt,
      icon: ClipboardList,
      color: "text-yellow-500 bg-yellow-500/10",
    })),
    ...tasks
      .filter((t) => t.status === "Completed")
      .map((t) => ({
        id: `act-task-comp-${t.id}`,
        type: "task-completed",
        title: "Task Completed",
        description: `Task "${t.title}" was marked completed.`,
        time: t.updatedAt,
        icon: CheckCircle2,
        color: "text-green-500 bg-green-500/10",
      })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 5);

  const kpis = [
    { name: "Total Projects", value: totalProjects, change: "All workspaces", color: "border-border" },
    { name: "Active Projects", value: activeProjects, change: "In active build", color: "border-blue-500/10" },
    { name: "Completed Projects", value: completedProjects, change: "Successfully shipped", color: "border-green-500/10" },
    { name: "On Hold Projects", value: onHoldProjects, change: "Paused constraints", color: "border-amber-500/10" },
    { name: "Pending Tasks", value: pendingTasks, change: "Backlog status", color: "border-border" },
    { name: "In Progress Tasks", value: inProgressTasks, change: "Currently executing", color: "border-blue-500/10" },
    { name: "Completed Tasks", value: completedTasks, change: "Marked resolved", color: "border-green-500/10" },
    { name: "Overall Completion", value: overallCompletion, change: "Total task ratio", isPercent: true, color: "border-primary/10" },
  ];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left select-none">
        <div className="space-y-0.5">
          <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
            Hello, {user?.name || "Guest"}
          </h2>
          <p className="text-xs text-muted-foreground">
            Operational dashboard and workspace metrics ({user?.role === "ADMIN" ? "Admin Workspace" : "Standard Access"}).
          </p>
        </div>

        {/* Global Search command hint */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground bg-card border border-border px-3 py-1.5 rounded-xl shadow-sm leading-none shrink-0">
          <span>Press</span>
          <kbd className="px-1.5 py-0.5 bg-secondary text-[10px] border border-border rounded font-mono font-bold">Ctrl + K</kbd>
          <span>for Command Center</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {kpis.map((kpi) => (
          <motion.div
            key={kpi.name}
            variants={itemVariants}
            whileHover={{ y: -4, scale: 1.01, boxShadow: "0 12px 20px -8px rgba(0, 0, 0, 0.08)" }}
            whileTap={{ scale: 0.99 }}
            className={`bg-card border ${kpi.color} rounded-2xl p-4 text-left flex flex-col justify-between h-28 hover:border-border/80 transition-all duration-200 shadow-sm relative overflow-hidden`}
          >
            <span className="text-[10px] font-bold text-muted-foreground truncate uppercase select-none">
              {kpi.name}
            </span>
            <div className="text-2xl font-black tracking-tight text-foreground my-1 leading-none">
              <AnimatedCounter value={kpi.value} />
              {kpi.isPercent && <span className="text-lg font-black">%</span>}
            </div>
            <span className="text-[10px] text-muted-foreground truncate select-none">
              {kpi.change}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Grid */}
      <DashboardCharts
        projectStats={{ active: activeProjects, completed: completedProjects, onHold: onHoldProjects }}
        taskStats={{ pending: pendingTasks, inProgress: inProgressTasks, completed: completedTasks }}
      />

      {/* Dynamic Activity, Deadlines and Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recent Activity Feed */}
        <div className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between hover:border-border/80 transition-colors shadow-sm select-none">
          <div className="flex items-center gap-2 text-left shrink-0">
            <Activity className="h-4.5 w-4.5 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Recent Activity</h3>
          </div>

          <div className="flex-1 mt-4 space-y-4 max-h-[300px] overflow-y-auto pr-1">
            {recentActivity.length > 0 ? (
              recentActivity.map((act) => {
                const ActIcon = act.icon;
                return (
                  <div key={act.id} className="flex gap-3 text-left">
                    <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${act.color}`}>
                      <ActIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 flex flex-col min-w-0">
                      <span className="text-xs font-bold text-foreground truncate leading-snug">{act.title}</span>
                      <p className="text-[10px] text-muted-foreground leading-normal mt-0.5">{act.description}</p>
                      <span className="text-[8px] text-muted-foreground/60 mt-1">
                        {formatDate(act.time, "MMM dd, hh:mm a")}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-xs text-muted-foreground">No recent activities log found.</div>
            )}
          </div>
        </div>

        {/* Upcoming Deadlines Widget */}
        <div className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between hover:border-border/80 transition-colors shadow-sm select-none">
          <div className="flex items-center gap-2 text-left shrink-0">
            <Calendar className="h-4.5 w-4.5 text-red-500" />
            <h3 className="text-sm font-bold text-foreground">Upcoming Deadlines</h3>
          </div>

          <div className="flex-1 mt-4 space-y-4 max-h-[300px] overflow-y-auto pr-1">
            {upcomingDeadlines.length > 0 ? (
              upcomingDeadlines.map((p) => {
                const isLate = p.daysLeft < 0;
                return (
                  <Link
                    href={`/projects/${p.id}`}
                    key={p.id}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-border bg-background/50 hover:bg-secondary/40 hover:border-border/80 transition-all text-left group"
                  >
                    <div className="flex-1 flex flex-col min-w-0">
                      <span className="text-xs font-bold text-foreground truncate leading-snug group-hover:text-primary transition-colors">
                        {p.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground leading-none mt-1">
                        Due {formatDate(p.deadline, "MMM dd, yyyy")}
                      </span>
                    </div>

                    {/* Remaining Days indicator */}
                    <div className="shrink-0 text-right flex flex-col items-end">
                      {isLate ? (
                        <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20 leading-none uppercase">
                          Overdue
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 leading-none">
                          {p.daysLeft}d left
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="py-12 text-center text-xs text-muted-foreground">No active project deadlines upcoming.</div>
            )}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between hover:border-border/80 transition-colors shadow-sm select-none h-fit">
          <div className="flex items-center gap-2 text-left shrink-0">
            <TrendingUp className="h-4.5 w-4.5 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Quick Actions</h3>
          </div>

          <div className="space-y-3 mt-4 w-full">
            <Button
              variant="outline"
              size="md"
              disabled={role !== "ADMIN"}
              onClick={() => setProjectModalOpen(true)}
              className="w-full justify-start text-xs border border-border bg-background/50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {role === "ADMIN" ? (
                <FolderPlus className="h-4 w-4 text-blue-500" />
              ) : (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
              <span>
                {role === "ADMIN" ? "Create New Project" : "Create Project (Admin Only)"}
              </span>
            </Button>
            <Button
              variant="outline"
              size="md"
              disabled={role !== "ADMIN" || projects.length === 0}
              onClick={() => setTaskModalOpen(true)}
              className="w-full justify-start text-xs border border-border bg-background/50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {role === "ADMIN" ? (
                <ClipboardList className="h-4 w-4 text-yellow-500" />
              ) : (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
              <span>
                {role === "ADMIN" ? "Create New Task" : "Create Task (Admin Only)"}
              </span>
            </Button>
            <Link href="/projects" className="block w-full">
              <Button
                variant="outline"
                size="md"
                className="w-full justify-start text-xs border border-border bg-background/50"
              >
                <ExternalLink className="h-4 w-4 text-green-500" />
                <span>Go to Projects List</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 1. Add Project Modal Dialog */}
      <Dialog
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        title="Add New Project"
        description="Register a new master project to trace in your active roadmap."
      >
        <form onSubmit={handleProjectSubmit(onAddProject)} className="space-y-4 text-left">
          <Input
            label="Project Title"
            placeholder="e.g. Mobile App Redesign"
            error={projectErrors.title?.message}
            {...registerProject("title")}
          />
          <Textarea
            label="Project Description"
            placeholder="Outline scope, goals, and primary targets..."
            error={projectErrors.description?.message}
            {...registerProject("description")}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground select-none leading-none">
                Initial Status
              </label>
              <select
                {...registerProject("status")}
                className="w-full h-10 px-3.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="Active">Active</option>
                <option value="OnHold">On Hold</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <Input
              type="date"
              label="Project Deadline"
              error={projectErrors.deadline?.message}
              {...registerProject("deadline")}
            />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-border mt-5 select-none">
            <Button type="button" variant="outline" onClick={() => setProjectModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={createProjectMutation.isPending}>
              Create Project
            </Button>
          </div>
        </form>
      </Dialog>

      {/* 2. Add Task Modal Dialog */}
      <Dialog
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        title="Add New Task"
        description="Assign a subtask under one of your active projects."
      >
        <form onSubmit={handleTaskSubmit(onAddTask)} className="space-y-4 text-left">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted-foreground select-none leading-none">
              Assign to Project
            </label>
            <select
              {...registerTask("projectId", { valueAsNumber: true })}
              className="w-full h-10 px-3.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="">Select a project...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
            {taskErrors.projectId && (
              <p className="text-[10px] font-semibold text-destructive leading-none mt-0.5">
                {taskErrors.projectId.message}
              </p>
            )}
          </div>
          <Input
            label="Task Title"
            placeholder="e.g. Design Login UI flow"
            error={taskErrors.title?.message}
            {...registerTask("title")}
          />
          <Textarea
            label="Task Description"
            placeholder="Detail technical requirements..."
            error={taskErrors.description?.message}
            {...registerTask("description")}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted-foreground select-none leading-none">
              Initial Status
            </label>
            <select
              {...registerTask("status")}
              className="w-full h-10 px-3.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="Pending">Pending</option>
              <option value="InProgress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-border mt-5 select-none">
            <Button type="button" variant="outline" onClick={() => setTaskModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={createTaskMutation.isPending}>
              Create Task
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

// Helpers for register hook select options coercion
function registerObj(obj: any) {
  return obj;
}

function registerWithCoerce(obj: any) {
  return obj;
}
