"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  ArrowUpDown,
  Edit2,
  Trash2,
  ExternalLink,
  Folder,
  Calendar,
  AlertTriangle,
  FolderMinus,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { Project, ProjectStatus } from "@/types";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { formatDate, isOverdue } from "@/utils/date";
import { fuzzySearch } from "@/utils/search";
import { useAuth } from "@/providers/auth-provider";

// Schema for updating project
const projectSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500),
  status: z.enum(["Active", "Completed", "OnHold"]),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid deadline date",
  }),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

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

export function ProjectsClient() {
  const queryClient = useQueryClient();
  const { role } = useAuth();

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "All">("All");
  const [sortBy, setSortBy] = useState<"name" | "deadline" | "status" | "newest">("newest");

  // Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
  });

  // Query projects list
  const { data: response, isLoading } = useQuery<{ data: Project[] }>({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to load projects");
      return res.json();
    },
  });

  const projects = response?.data || [];

  // Mutations
  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ProjectFormValues }) => {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update project");
      return res.json();
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["projects"] });
      const previousProjects = queryClient.getQueryData<{ data: Project[] }>(["projects"]);

      if (previousProjects) {
        queryClient.setQueryData(["projects"], {
          ...previousProjects,
          data: previousProjects.data.map((p) =>
            p.id === id
              ? {
                  ...p,
                  title: data.title,
                  description: data.description,
                  status: data.status,
                  deadline: data.deadline,
                }
              : p
          ),
        });
      }

      return { previousProjects };
    },
    onError: (err, variables, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(["projects"], context.previousProjects);
      }
      toast.error("Failed to update project. Please try again.");
    },
    onSuccess: () => {
      toast.success("Project details saved.");
      setEditModalOpen(false);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete project");
      return res.json();
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["projects"] });
      const previousProjects = queryClient.getQueryData<{ data: Project[] }>(["projects"]);

      if (previousProjects) {
        queryClient.setQueryData(["projects"], {
          ...previousProjects,
          data: previousProjects.data.filter((p) => p.id !== id),
        });
      }

      return { previousProjects };
    },
    onError: (err, variables, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(["projects"], context.previousProjects);
      }
      toast.error("Failed to delete project.");
    },
    onSuccess: () => {
      toast.success("Project deleted successfully.");
      setDeleteDialogOpen(false);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setValue("title", project.title);
    setValue("description", project.description);
    setValue("status", project.status);
    // Format to YYYY-MM-DD
    const dateFormatted = new Date(project.deadline).toISOString().split("T")[0];
    setValue("deadline", dateFormatted);
    setEditModalOpen(true);
  };

  const openDeleteDialog = (id: number) => {
    setDeletingProjectId(id);
    setDeleteDialogOpen(true);
  };

  const onUpdateSubmit = (data: ProjectFormValues) => {
    if (editingProject) {
      updateProjectMutation.mutate({ id: editingProject.id, data });
    }
  };

  const onConfirmDelete = () => {
    if (deletingProjectId) {
      deleteProjectMutation.mutate(deletingProjectId);
    }
  };

  // 1. Fuzzy Search & Filter logic combined
  const processedProjects = useMemo(() => {
    // A. Filter by status first
    let result = projects;
    if (statusFilter !== "All") {
      result = result.filter((p) => p.status === statusFilter);
    }

    // B. Fuzzy search on title/desc
    result = fuzzySearch(result, search, ["title", "description"]);

    // C. Sort
    return [...result].sort((a, b) => {
      if (sortBy === "name") {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === "deadline") {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (sortBy === "status") {
        return a.status.localeCompare(b.status);
      }
      // Default: newest
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [projects, search, statusFilter, sortBy]);

  // Status mapping badge helper
  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case "Active":
        return <Badge variant="info">Active</Badge>;
      case "Completed":
        return <Badge variant="success">Completed</Badge>;
      case "OnHold":
        return <Badge variant="warning">On Hold</Badge>;
    }
  };

  // Compute tasks progress
  const getProjectProgress = (project: Project) => {
    const projectTasks = project.tasks || [];
    if (projectTasks.length === 0) return 0;
    const completed = projectTasks.filter((t) => t.status === "Completed").length;
    return Math.round((completed / projectTasks.length) * 100);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-card border border-border rounded-xl animate-pulse animate-duration-1000" />
        <div className="h-12 w-full bg-card border border-border rounded-xl animate-pulse" />
        <div className="h-96 w-full bg-card border border-border rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left select-none">
        <div className="space-y-0.5">
          <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">Workspace Projects</h2>
          <p className="text-xs text-muted-foreground">
            Browse, manage, and inspect all projects and key deliverable paths.
          </p>
        </div>
      </div>

      {/* Toolbar Toolbar */}
      <div className="flex flex-col gap-4 bg-card border border-border rounded-2xl p-4 md:flex-row md:items-center md:justify-between select-none">
        {/* Search & Sorting Panel */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 max-w-2xl">
          {/* Fuzzy Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search project title or description..."
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-border bg-background text-sm text-foreground outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Sorting selection drop */}
          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="h-10 px-3.5 rounded-xl border border-border bg-background text-xs font-semibold text-foreground outline-none focus:border-primary cursor-pointer"
            >
              <option value="newest">Sort by: Newest</option>
              <option value="name">Sort by: Name (A-Z)</option>
              <option value="deadline">Sort by: Deadline</option>
              <option value="status">Sort by: Status</option>
            </select>
          </div>
        </div>

        {/* Dynamic Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          {(["All", "Active", "Completed", "OnHold"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer relative ${
                statusFilter === status
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "bg-background border-border text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              }`}
            >
              {status === "OnHold" ? "On Hold" : status}
            </button>
          ))}
        </div>
      </div>

      {/* Main List Area */}
      <AnimatePresence mode="wait">
        {processedProjects.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-hidden bg-card border border-border rounded-2xl shadow-sm">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/30 select-none text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="p-4">Project</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Deadline</th>
                    <th className="p-4 text-center">Tasks</th>
                    <th className="p-4 w-1/4">Progress</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {processedProjects.map((project) => {
                    const progress = getProjectProgress(project);
                    const isLate = isOverdue(project.deadline) && project.status !== "Completed";
                    return (
                      <tr key={project.id} className="hover:bg-secondary/25 transition-colors group">
                        <td className="p-4 max-w-sm">
                          <Link href={`/projects/${project.id}`} className="block">
                            <span className="font-bold text-foreground hover:text-primary transition-colors block">
                              {project.title}
                            </span>
                            <span className="text-[10px] text-muted-foreground truncate block mt-0.5 max-w-xs leading-relaxed">
                              {project.description}
                            </span>
                          </Link>
                        </td>
                        <td className="p-4">{getStatusBadge(project.status)}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{formatDate(project.deadline)}</span>
                            {isLate && (
                              <Badge variant="danger" className="ml-1 text-[8px] px-1 py-0 shadow-sm border border-danger/10">
                                Overdue
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-center font-bold text-xs">
                          {project._count?.tasks ?? project.tasks?.length ?? 0}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <ProgressBar value={progress} className="flex-1" />
                            <span className="text-xs font-black text-foreground shrink-0 w-8 text-right">
                              {progress}%
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-right select-none">
                          <div className="flex items-center justify-end gap-2.5">
                            <Link href={`/projects/${project.id}`}>
                              <button
                                className="h-8 w-8 rounded-xl border border-border bg-background hover:bg-secondary text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
                                title="Inspect Details"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </button>
                            </Link>
                            {role === "ADMIN" && (
                              <>
                                <button
                                  onClick={() => openEditModal(project)}
                                  className="h-8 w-8 rounded-xl border border-border bg-background hover:bg-secondary text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
                                  title="Edit Project"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => openDeleteDialog(project.id)}
                                  className="h-8 w-8 rounded-xl border border-destructive/20 bg-background hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center transition-colors cursor-pointer"
                                  title="Delete Project"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards Grid View */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 gap-4 md:hidden"
            >
              {processedProjects.map((project) => {
                const progress = getProjectProgress(project);
                const isLate = isOverdue(project.deadline) && project.status !== "Completed";
                return (
                  <motion.div
                    key={project.id}
                    variants={itemVariants}
                    whileHover={{ y: -2, scale: 1.01, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)" }}
                    className="bg-card border border-border rounded-2xl p-4.5 space-y-4 shadow-sm relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-3 text-left">
                      <div className="space-y-0.5">
                        <Link href={`/projects/${project.id}`} className="block">
                          <span className="font-bold text-sm text-foreground hover:text-primary transition-colors block">
                            {project.title}
                          </span>
                          <span className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                            {project.description}
                          </span>
                        </Link>
                      </div>
                      {getStatusBadge(project.status)}
                    </div>

                    {/* Progress slider bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground">
                        <span>Workspace Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <ProgressBar value={progress} />
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[10px] text-muted-foreground leading-none">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Due {formatDate(project.deadline)}</span>
                        {isLate && <span className="text-red-500 font-bold uppercase ml-1">Overdue</span>}
                      </div>
                      <div>
                        Tasks: <span className="font-bold text-foreground">{project._count?.tasks ?? project.tasks?.length ?? 0}</span>
                      </div>
                    </div>

                    {/* Actions row */}
                    <div className="flex justify-end gap-2 pt-2 select-none border-t border-border/40">
                      <Link href={`/projects/${project.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>View</span>
                        </Button>
                      </Link>
                      {role === "ADMIN" && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => openEditModal(project)}>
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="outline" size="sm" className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20" onClick={() => openDeleteDialog(project.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        ) : (
          /* Empty Search results layout */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/25 py-24 px-4 text-center select-none"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary border border-border/50 text-muted-foreground mb-4.5">
              <FolderMinus className="h-7 w-7" />
            </div>
            <h3 className="text-sm font-bold tracking-tight text-foreground">No Projects Found</h3>
            <p className="mt-1.5 text-xs text-muted-foreground max-w-sm leading-relaxed">
              We couldn't find any projects matching your search filter "{search}". Try adjusting filters or create a new project.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Edit Project Modal */}
      <Dialog
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Project Details"
        description="Update general properties, deadline constraints or status tags."
      >
        <form onSubmit={handleSubmit(onUpdateSubmit)} className="space-y-4 text-left">
          <Input label="Project Title" error={errors.title?.message} {...register("title")} />
          <Textarea label="Project Description" error={errors.description?.message} {...register("description")} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground select-none leading-none">
                Status
              </label>
              <select
                {...register("status")}
                className="w-full h-10 px-3.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="Active">Active</option>
                <option value="OnHold">On Hold</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <Input type="date" label="Deadline" error={errors.deadline?.message} {...register("deadline")} />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-border mt-5 select-none">
            <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={updateProjectMutation.isPending}>
              Save Details
            </Button>
          </div>
        </form>
      </Dialog>

      {/* 2. Delete Project Confirmation Dialog */}
      <Dialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Confirm Project Deletion"
        description="Are you absolutely sure you want to remove this project?"
      >
        <div className="space-y-5 text-left select-none">
          <div className="p-3 bg-danger/10 border border-danger/25 text-danger rounded-xl flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-xs font-bold">Warning: This action is permanent!</span>
              <p className="text-[10px] leading-relaxed mt-0.5">
                Deleting this project will cascade delete all associated subtasks. This action cannot be reversed.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirmDelete}
              isLoading={deleteProjectMutation.isPending}
            >
              Delete Project
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
