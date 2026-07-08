"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { TaskStatus } from "@/types";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().max(500, "Description is too long"),
  status: z.enum(["Pending", "InProgress", "Completed"] as const),
  projectId: z.number().int().positive(),
});

export async function createTaskAction(projectId: number, data: { title: string; description: string; status: TaskStatus }) {
  try {
    const validated = taskSchema.parse({
      title: data.title,
      description: data.description,
      status: data.status,
      projectId,
    });

    const task = await prisma.task.create({
      data: {
        title: validated.title,
        description: validated.description,
        status: validated.status,
        projectId: validated.projectId,
      },
    });

    revalidatePath("/");
    revalidatePath(`/projects/${projectId}`);

    return {
      success: true,
      message: "Task created successfully.",
      data: task,
    };
  } catch (error) {
    console.error("Failed to create task:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.issues[0].message,
      };
    }
    return {
      success: false,
      message: "Failed to create task.",
    };
  }
}

export async function updateTaskAction(id: number, data: { title?: string; description?: string; status?: TaskStatus }) {
  try {
    const originalTask = await prisma.task.findUnique({
      where: { id },
      select: { projectId: true },
    });

    if (!originalTask) {
      return {
        success: false,
        message: "Task not found.",
      };
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.status !== undefined && { status: data.status }),
      },
    });

    revalidatePath("/");
    revalidatePath(`/projects/${originalTask.projectId}`);

    return {
      success: true,
      message: "Task updated successfully.",
      data: task,
    };
  } catch (error) {
    console.error(`Failed to update task ${id}:`, error);
    return {
      success: false,
      message: "Failed to update task.",
    };
  }
}

export async function deleteTaskAction(id: number) {
  try {
    const originalTask = await prisma.task.findUnique({
      where: { id },
      select: { projectId: true },
    });

    if (!originalTask) {
      return {
        success: false,
        message: "Task not found.",
      };
    }

    await prisma.task.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath(`/projects/${originalTask.projectId}`);

    return {
      success: true,
      message: "Task deleted successfully.",
      data: { id },
    };
  } catch (error) {
    console.error(`Failed to delete task ${id}:`, error);
    return {
      success: false,
      message: "Failed to delete task.",
    };
  }
}
