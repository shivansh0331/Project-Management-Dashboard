"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { ProjectStatus } from "@/types";

const projectSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().max(500, "Description is too long"),
  status: z.enum(["Active", "Completed", "OnHold"] as const),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid deadline date",
  }),
});

export async function createProjectAction(rawState: unknown, formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const status = formData.get("status") as ProjectStatus;
    const deadline = formData.get("deadline") as string;

    const validated = projectSchema.parse({ title, description, status, deadline });

    const project = await prisma.project.create({
      data: {
        title: validated.title,
        description: validated.description,
        status: validated.status,
        deadline: new Date(validated.deadline),
      },
    });

    revalidatePath("/");
    revalidatePath("/projects");

    return {
      success: true,
      message: "Project created successfully.",
      data: project,
    };
  } catch (error) {
    console.error("Failed to create project:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: error.issues[0].message,
      };
    }
    return {
      success: false,
      message: "Failed to create project due to a database or network error.",
    };
  }
}

export async function updateProjectAction(id: number, data: { title?: string; description?: string; status?: ProjectStatus; deadline?: string }) {
  try {
    const project = await prisma.project.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.deadline !== undefined && { deadline: new Date(data.deadline) }),
      },
    });

    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath(`/projects/${id}`);

    return {
      success: true,
      message: "Project updated successfully.",
      data: project,
    };
  } catch (error) {
    console.error(`Failed to update project ${id}:`, error);
    return {
      success: false,
      message: "Failed to update project details.",
    };
  }
}

export async function deleteProjectAction(id: number) {
  try {
    await prisma.project.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath("/projects");

    return {
      success: true,
      message: "Project deleted successfully.",
      data: { id },
    };
  } catch (error) {
    console.error(`Failed to delete project ${id}:`, error);
    return {
      success: false,
      message: "Failed to delete project.",
    };
  }
}
