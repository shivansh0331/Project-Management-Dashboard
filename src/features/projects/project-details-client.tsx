"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Calendar,
  ChevronLeft,
  Edit2,
  Trash2,
  Plus,
  CheckCircle2,
  Circle,
  Play,
  Pause,
  AlertTriangle,
  ArrowRight,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { DndContext, DragEndEvent, useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Project, Task, ProjectStatus, TaskStatus } from "@/types";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ProgressBar, ProgressRing } from "@/components/ui/progress";
import { formatDate, isOverdue } from "@/utils/date";
import { cn } from "@/utils/cn";
import { useAuth } from "@/providers/auth-provider";

// Zod schemas
const projectSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500),
  status: z.enum(["Active", "Completed", "OnHold"]),
  deadline: z.string(),
});

const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500),
  status: z.enum(["Pending", "InProgress", "Completed"]),
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

interface DetailsClientProps {
  id: number;
}

export function ProjectDetailsClient({ id }: DetailsClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { role } = useAuth();

  // Modals state
  const [projectEditOpen, setProjectEditOpen] = useState(false);
  const [projectDeleteOpen, setProjectDeleteOpen] = useState(false);
  
  const [taskCreateOpen, setTaskCreateOpen] = useState(false);
  const [taskEditOpen, setTaskEditOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [taskDeleteOpen, setTaskDeleteOpen] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);

  // Forms
  const {
    register: registerProject,
    handleSubmit: handleProjectSubmit,
    setValue: setProjectValue,
    formState: { errors: projectErrors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
  });

  const {
    register: registerTask,
    handleSubmit: handleTaskSubmit,
    setValue: setTaskValue,
    reset: resetTaskForm,
    formState: { errors: taskErrors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: { title: "", description: "", status: "Pending" },
  });

  // Query project details (with tasks)
  const { data: response, isLoading, error } = useQuery<{ data: Project }>({
    queryKey: ["project-details", id],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${id}`);
      if (!res.ok) throw new Error("Failed to load project details");
      return res.json();
    },
  });

  const project = response?.data;
  const tasks = project?.tasks || [];

  // Populate project edit form when loaded
  useEffect(() => {
    if (project) {
      setProjectValue("title", project.title);
      setProjectValue("description", project.description);
      setProjectValue("status", project.status);
      const formattedDeadline = new Date(project.deadline).toISOString().split("T")[0];
      setProjectValue("deadline", formattedDeadline);
    }
  }, [project, setProjectValue]);

  // Mutations
  const updateProjectMutation = useMutation({
    mutationFn: async (data: ProjectFormValues) => {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update project");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Project updated.");
      setProjectEditOpen(false);
      queryClient.invalidateQueries({ queryKey: ["project-details", id] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete project");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Project deleted.");
      setProjectDeleteOpen(false);
      router.push("/projects");
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: TaskFormValues) => {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, projectId: id }),
      });
      if (!res.ok) throw new Error("Failed to create task");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Task created.");
      setTaskCreateOpen(false);
      resetTaskForm();
      queryClient.invalidateQueries({ queryKey: ["project-details", id] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, data }: { taskId: number; data: Partial<TaskFormValues> }) => {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update task");
      return res.json();
    },
    onSuccess: (resData) => {
      queryClient.invalidateQueries({ queryKey: ["project-details", id] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });

      // Trigger Confetti if the newly completed task puts the project at 100%!
      const updatedTask = resData.data as Task;
      if (updatedTask.status === "Completed") {
        const completedCount = tasks.filter((t) => t.id !== updatedTask.id && t.status === "Completed").length + 1;
        if (completedCount === tasks.length && tasks.length > 0) {
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
          });
          toast.success("Congratulations! Project reached 100% completion! 🎉");
        } else {
          toast.success("Task completed.");
        }
      } else {
        toast.success("Task saved.");
      }

      setTaskEditOpen(false);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete task");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Task deleted.");
      setTaskDeleteOpen(false);
      queryClient.invalidateQueries({ queryKey: ["project-details", id] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // Task reorder/drag end mutation (Optimistic UI)
  const moveTaskMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: number; status: TaskStatus }) => {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to move task");
      return res.json();
    },
    onMutate: async ({ taskId, status }) => {
      await queryClient.cancelQueries({ queryKey: ["project-details", id] });
      const previousDetails = queryClient.getQueryData<{ data: Project }>(["project-details", id]);

      if (previousDetails && previousDetails.data.tasks) {
        queryClient.setQueryData(["project-details", id], {
          ...previousDetails,
          data: {
            ...previousDetails.data,
            tasks: previousDetails.data.tasks.map((t) =>
              t.id === taskId ? { ...t, status } : t
            ),
          },
        });
      }

      return { previousDetails };
    },
    onError: (err, variables, context) => {
      if (context?.previousDetails) {
        queryClient.setQueryData(["project-details", id], context.previousDetails);
      }
      toast.error("Failed to move task.");
    },
    onSuccess: (resData) => {
      // Check if project hit 100% complete
      const updated = resData.data as Task;
      if (updated.status === "Completed") {
        const completedCount = tasks.filter((t) => t.id !== updated.id && t.status === "Completed").length + 1;
        if (completedCount === tasks.length && tasks.length > 0) {
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
          });
          toast.success("Congratulations! Project reached 100% completion! 🎉");
        } else {
          toast.info("Task status updated.");
        }
      } else {
        toast.info("Task status updated.");
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["project-details", id] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const openTaskEditModal = (task: Task) => {
    setEditingTask(task);
    setTaskValue("title", task.title);
    setTaskValue("description", task.description);
    setTaskValue("status", task.status);
    setTaskEditOpen(true);
  };

  const openTaskDeleteDialog = (taskId: number) => {
    setDeletingTaskId(taskId);
    setTaskDeleteOpen(true);
  };

  // Drag and drop handler
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as number;
    const overId = over.id as string; // Will represent column name: "Pending", "InProgress", "Completed"

    // Check if the element was dragged into a valid column container
    if (["Pending", "InProgress", "Completed"].includes(overId)) {
      const targetStatus = overId as TaskStatus;
      const originalTask = tasks.find((t) => t.id === taskId);
      if (originalTask && originalTask.status !== targetStatus) {
        moveTaskMutation.mutate({ taskId, status: targetStatus });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-24 bg-card border border-border rounded-xl animate-pulse" />
        <div className="h-40 w-full bg-card border border-border rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-[450px] bg-card border border-border rounded-2xl animate-pulse" />
          <div className="h-[450px] bg-card border border-border rounded-2xl animate-pulse" />
          <div className="h-[450px] bg-card border border-border rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="py-24 text-center select-none space-y-4">
        <span className="text-3xl">⚠️</span>
        <h3 className="text-base font-bold text-foreground">Project Not Found</h3>
        <p className="text-xs text-muted-foreground max-w-xs mx-auto">
          We couldn't retrieve details for project #{id}. It may have been deleted or the URL is invalid.
        </p>
        <Link href="/projects" className="inline-block pt-2">
          <Button variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4" />
            <span>Back to Projects</span>
          </Button>
        </Link>
      </div>
    );
  }

  // Calculate project task parameters
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "Completed").length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const isLate = isOverdue(project.deadline) && project.status !== "Completed";

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

  return (
    <div className="space-y-6 select-none text-left">
      {/* Back Button */}
      <Link href="/projects" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0">
        <ChevronLeft className="h-4 w-4" />
        <span>Back to Projects</span>
      </Link>

      {/* Project Master Info Card */}
      <div className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left Side: General metadata */}
        <div className="space-y-3.5 flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2.5">
            <h2 className="text-lg md:text-xl font-bold tracking-tight text-foreground truncate">
              {project.title}
            </h2>
            {getStatusBadge(project.status)}
            {isLate && (
              <Badge variant="danger" className="text-[8px] px-1 py-0 shadow-sm border border-danger/10">
                Overdue
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
            {project.description}
          </p>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>DEADLINE: {formatDate(project.deadline, "MMMM dd, yyyy")}</span>
          </div>
          
          {/* Horizontal progress bar */}
          <div className="space-y-1 max-w-sm pt-1">
            <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground leading-none">
              <span>Task Progress</span>
              <span>
                {completedTasks}/{totalTasks} ({progressPercentage}%)
              </span>
            </div>
            <ProgressBar value={progressPercentage} />
          </div>
        </div>

        {/* Center: Circular Progress Ring & Actions */}
        <div className="flex items-center gap-6 shrink-0 self-stretch md:self-auto justify-end border-t md:border-t-0 border-border/40 pt-4 md:pt-0">
          {/* Completion circular ring */}
          <ProgressRing value={progressPercentage} size={90} strokeWidth={9} />

          {/* Quick operations */}
          {role === "ADMIN" && (
            <div className="flex flex-col gap-2 shrink-0">
              <Button variant="outline" size="sm" className="justify-start text-xs border border-border bg-background" onClick={() => setProjectEditOpen(true)}>
                <Edit2 className="h-3.5 w-3.5" />
                <span>Edit Details</span>
              </Button>
              <Button variant="outline" size="sm" className="justify-start text-xs border border-destructive/20 text-muted-foreground hover:text-destructive hover:bg-destructive/10 bg-background" onClick={() => setProjectDeleteOpen(true)}>
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Project</span>
              </Button>
              <Button variant="primary" size="sm" className="justify-start text-xs" onClick={() => setTaskCreateOpen(true)}>
                <Plus className="h-4 w-4" />
                <span>Add Task</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Kanban DndContext Board */}
      <DndContext onDragEnd={handleDragEnd}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start"
        >
          {/* Column 1: Pending */}
          <KanbanColumn
            id="Pending"
            title="Pending"
            badgeColor="secondary"
            tasks={tasks.filter((t) => t.status === "Pending")}
            onEdit={openTaskEditModal}
            onDelete={openTaskDeleteDialog}
            onToggleStatus={(taskId) => moveTaskMutation.mutate({ taskId, status: "InProgress" })}
          />

          {/* Column 2: In Progress */}
          <KanbanColumn
            id="InProgress"
            title="In Progress"
            badgeColor="info"
            tasks={tasks.filter((t) => t.status === "InProgress")}
            onEdit={openTaskEditModal}
            onDelete={openTaskDeleteDialog}
            onToggleStatus={(taskId) => moveTaskMutation.mutate({ taskId, status: "Completed" })}
          />

          {/* Column 3: Completed */}
          <KanbanColumn
            id="Completed"
            title="Completed"
            badgeColor="success"
            tasks={tasks.filter((t) => t.status === "Completed")}
            onEdit={openTaskEditModal}
            onDelete={openTaskDeleteDialog}
            onToggleStatus={(taskId) => moveTaskMutation.mutate({ taskId, status: "Pending" })}
          />
        </motion.div>
      </DndContext>

      {/* ================================================= */}
      {/* Modals & Dialog Boxes */}
      {/* ================================================= */}

      {/* A. Edit Project Modal */}
      <Dialog
        isOpen={projectEditOpen}
        onClose={() => setProjectEditOpen(false)}
        title="Edit Project Details"
        description="Update description parameters or deadline limitations."
      >
        <form onSubmit={handleProjectSubmit((data) => updateProjectMutation.mutate(data))} className="space-y-4 text-left">
          <Input label="Project Title" error={projectErrors.title?.message} {...registerProject("title")} />
          <Textarea label="Project Description" error={projectErrors.description?.message} {...registerProject("description")} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted-foreground select-none leading-none">
                Status
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
            <Input type="date" label="Deadline" error={projectErrors.deadline?.message} {...registerProject("deadline")} />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-border mt-5 select-none">
            <Button type="button" variant="outline" onClick={() => setProjectEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={updateProjectMutation.isPending}>
              Save Details
            </Button>
          </div>
        </form>
      </Dialog>

      {/* B. Delete Project Confirmation */}
      <Dialog
        isOpen={projectDeleteOpen}
        onClose={() => setProjectDeleteOpen(false)}
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
            <Button variant="outline" onClick={() => setProjectDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteProjectMutation.mutate()}
              isLoading={deleteProjectMutation.isPending}
            >
              Delete Project
            </Button>
          </div>
        </div>
      </Dialog>

      {/* C. Create Task Modal */}
      <Dialog
        isOpen={taskCreateOpen}
        onClose={() => setTaskCreateOpen(false)}
        title="Create New Task"
        description="Add a task card under the current project."
      >
        <form onSubmit={handleTaskSubmit((data) => createTaskMutation.mutate(data))} className="space-y-4 text-left">
          <Input label="Task Title" error={taskErrors.title?.message} {...registerTask("title")} />
          <Textarea label="Task Description" error={taskErrors.description?.message} {...registerTask("description")} />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted-foreground select-none leading-none">
              Status
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
            <Button type="button" variant="outline" onClick={() => setTaskCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={createTaskMutation.isPending}>
              Create Task
            </Button>
          </div>
        </form>
      </Dialog>

      {/* D. Edit Task Modal */}
      <Dialog
        isOpen={taskEditOpen}
        onClose={() => setTaskEditOpen(false)}
        title="Edit Task Details"
        description="Modify properties or status tags for this task."
      >
        <form
          onSubmit={handleTaskSubmit((data) => {
            if (editingTask) {
              updateTaskMutation.mutate({ taskId: editingTask.id, data });
            }
          })}
          className="space-y-4 text-left"
        >
          <Input label="Task Title" error={taskErrors.title?.message} {...registerTask("title")} />
          <Textarea label="Task Description" error={taskErrors.description?.message} {...registerTask("description")} />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted-foreground select-none leading-none">
              Status
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
            <Button type="button" variant="outline" onClick={() => setTaskEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={updateTaskMutation.isPending}>
              Save Changes
            </Button>
          </div>
        </form>
      </Dialog>

      {/* E. Delete Task Confirmation Dialog */}
      <Dialog
        isOpen={taskDeleteOpen}
        onClose={() => setTaskDeleteOpen(false)}
        title="Confirm Task Deletion"
        description="Are you sure you want to remove this task?"
      >
        <div className="space-y-5 text-left select-none">
          <p className="text-xs text-muted-foreground leading-relaxed">
            This action will permanently delete the task from the database. It cannot be recovered.
          </p>
          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button variant="outline" onClick={() => setTaskDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingTaskId && deleteTaskMutation.mutate(deletingTaskId)}
              isLoading={deleteTaskMutation.isPending}
            >
              Delete Task
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

// =================================================
// Kanban board support components
// =================================================

interface ColumnProps {
  id: string;
  title: string;
  badgeColor: any;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number) => void;
}

function KanbanColumn({ id, title, badgeColor, tasks, onEdit, onDelete, onToggleStatus }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <motion.div
      ref={setNodeRef}
      variants={itemVariants}
      className={cn(
        "bg-card/45 border border-border rounded-2xl p-4 flex flex-col gap-4.5 min-h-[420px] transition-colors duration-200 select-none shadow-sm",
        isOver && "bg-secondary/40 border-primary/20 shadow-inner"
      )}
    >
      {/* Column Title Header */}
      <div className="flex items-center justify-between text-left shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-foreground leading-none">{title}</span>
          <Badge variant={badgeColor} className="text-[9px] px-1.5 py-0 shadow-sm border border-border/20 leading-none">
            {tasks.length}
          </Badge>
        </div>
      </div>

      {/* Sortable Tasks List */}
      <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[50vh] pr-0.5 scrollbar-thin">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <SortableTaskCard
                key={task.id}
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleStatus={onToggleStatus}
              />
            ))
          ) : (
            /* Empty column placeholder layout */
            <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-border/80 bg-background/25 rounded-2xl py-12 px-4 text-center select-none text-muted-foreground mt-2">
              <ClipboardList className="h-6 w-6 mb-2 opacity-50" />
              <span className="text-[10px] font-bold">No tasks here</span>
              <span className="text-[8px] mt-0.5">Drag cards here or add a new task to columns.</span>
            </div>
          )}
        </SortableContext>
      </div>
    </motion.div>
  );
}

interface CardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number) => void;
}

function SortableTaskCard({ task, onEdit, onDelete, onToggleStatus }: CardProps) {
  const { role } = useAuth();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  const isCompleted = task.status === "Completed";
  const isInProgress = task.status === "InProgress";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-card border border-border rounded-2xl p-4 flex flex-col gap-3.5 text-left group shadow-sm transition-all duration-200 glow-on-hover hover:border-border/80",
        isDragging && "shadow-xl border-primary/20 scale-[1.01]"
      )}
    >
      {/* Drag handle & Header */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          {/* Click checkbox to toggle status quickly */}
          <button
            onClick={() => onToggleStatus(task.id)}
            className="mt-0.5 text-muted-foreground hover:text-foreground shrink-0 transition-colors duration-150 cursor-pointer"
          >
            {isCompleted ? (
              <CheckCircle2 className="h-4.5 w-4.5 text-green-500 hover:text-green-600 scale-[1.05]" />
            ) : (
              <Circle className="h-4.5 w-4.5 text-muted-foreground hover:text-foreground" />
            )}
          </button>
          
          <div className="flex flex-col min-w-0">
            <span
              className={cn(
                "text-xs font-bold leading-snug truncate",
                isCompleted ? "line-through text-muted-foreground" : "text-foreground"
              )}
            >
              {task.title}
            </span>
            <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed mt-0.5">
              {task.description}
            </p>
          </div>
        </div>

        {/* Drag handle indicator */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 -mr-1 text-muted-foreground/40 hover:text-muted-foreground rounded hover:bg-secondary shrink-0 transition-colors"
          title="Drag to move status"
        >
          <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
            <path d="M7 2a2 2 0 11-4 0 2 2 0 014 0zM7 8a2 2 0 11-4 0 2 2 0 014 0zM7 14a2 2 0 11-4 0 2 2 0 014 0zM17 2a2 2 0 11-4 0 2 2 0 014 0zM17 8a2 2 0 11-4 0 2 2 0 014 0zM17 14a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
      </div>

      {/* Meta Row & Quick Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[10px] leading-none shrink-0 select-none">
        {/* Shifter indicators */}
        <div className="flex items-center gap-1.5">
          {isCompleted ? (
            <Badge variant="success" className="text-[8px] leading-none px-1 py-0 shadow-sm border border-green-500/10">Done</Badge>
          ) : isInProgress ? (
            <Badge variant="info" className="text-[8px] leading-none px-1 py-0 shadow-sm border border-blue-500/10">In Dev</Badge>
          ) : (
            <Badge variant="secondary" className="text-[8px] leading-none px-1 py-0 shadow-sm border border-border/20">Todo</Badge>
          )}
        </div>

        {/* Edit and Delete operations */}
        {role === "ADMIN" && (
          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => onEdit(task)}
              className="p-1 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors cursor-pointer border border-border/40 bg-background"
              title="Edit Task"
            >
              <Edit2 className="h-3 w-3" />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer border border-border/40 bg-background"
              title="Delete Task"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
