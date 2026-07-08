import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TaskStatus } from "@prisma/client";
import { z } from "zod";

const taskUpdateSchema = z.object({
  title: z.string().min(1, "Title is required").max(100).optional(),
  description: z.string().max(500).optional(),
  status: z.enum(["Pending", "InProgress", "Completed"]).optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const taskId = parseInt(id, 10);

    if (isNaN(taskId)) {
      return NextResponse.json(
        { success: false, message: "Invalid task ID format.", data: null },
        { status: 400 }
      );
    }

    const body = await request.json();
    const result = taskUpdateSchema.safeParse(body);

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

    const taskExists = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!taskExists) {
      return NextResponse.json(
        { success: false, message: "Task not found.", data: null },
        { status: 404 }
      );
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(result.data.title !== undefined && { title: result.data.title }),
        ...(result.data.description !== undefined && { description: result.data.description }),
        ...(result.data.status !== undefined && { status: result.data.status as TaskStatus }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Task updated successfully.",
      data: task,
    });
  } catch (error) {
    console.error("PUT /api/tasks/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update task.", data: null },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const taskId = parseInt(id, 10);

    if (isNaN(taskId)) {
      return NextResponse.json(
        { success: false, message: "Invalid task ID format.", data: null },
        { status: 400 }
      );
    }

    const taskExists = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!taskExists) {
      return NextResponse.json(
        { success: false, message: "Task not found.", data: null },
        { status: 404 }
      );
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    return NextResponse.json({
      success: true,
      message: "Task deleted successfully.",
      data: { id: taskId },
    });
  } catch (error) {
    console.error("DELETE /api/tasks/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete task.", data: null },
      { status: 500 }
    );
  }
}
