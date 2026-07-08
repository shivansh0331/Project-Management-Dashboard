export type ProjectStatus = "Active" | "Completed" | "OnHold";
export type TaskStatus = "Pending" | "InProgress" | "Completed";

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  projectId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  status: ProjectStatus;
  deadline: string; // ISO String format
  createdAt: string;
  updatedAt: string;
  tasks?: Task[];
  _count?: {
    tasks: number;
  };
}

export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  onHoldProjects: number;
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  completionPercentage: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiListResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export type SortField = "name" | "deadline" | "status" | "newest" | "oldest";
export type SortOrder = "asc" | "desc";
