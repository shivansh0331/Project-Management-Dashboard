import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TaskStatus } from "@prisma/client";
import { z } from "zod";

const taskCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500),
  status: z.enum(["Pending", "InProgress", "Completed"]),
  projectId: z.number().int().positive(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectIdStr = searchParams.get("projectId");

    const where: any = {};
    if (projectIdStr) {
      const projectId = parseInt(projectIdStr, 10);
      if (!isNaN(projectId)) {
        where.projectId = projectId;
      }
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      message: "Tasks retrieved successfully.",
      data: tasks,
    });
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve tasks.", data: null },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = taskCreateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.error.issues[0].message,
          data: null,
        },
        { status: 400 }
      );
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: result.data.projectId },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, message: "Associated project not found.", data: null },
        { status: 404 }
      );
    }

    const task = await prisma.task.create({
      data: {
        title: result.data.title,
        description: result.data.description,
        status: result.data.status as TaskStatus,
        projectId: result.data.projectId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Task created successfully.",
        data: task,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/tasks error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create task.", data: null },
      { status: 500 }
    );
  }
}
