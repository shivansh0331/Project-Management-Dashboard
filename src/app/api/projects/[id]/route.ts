import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProjectStatus } from "@prisma/client";
import { z } from "zod";

const projectUpdateSchema = z.object({
  title: z.string().min(1, "Title is required").max(100).optional(),
  description: z.string().max(500).optional(),
  status: z.enum(["Active", "Completed", "OnHold"]).optional(),
  deadline: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid deadline date",
    })
    .optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id, 10);

    if (isNaN(projectId)) {
      return NextResponse.json(
        { success: false, message: "Invalid project ID format.", data: null },
        { status: 400 }
      );
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        tasks: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found.", data: null },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Project details retrieved successfully.",
      data: project,
    });
  } catch (error) {
    console.error("GET /api/projects/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Server error.", data: null },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const projectId = parseInt(id, 10);

    if (isNaN(projectId)) {
      return NextResponse.json(
        { success: false, message: "Invalid project ID format.", data: null },
        { status: 400 }
      );
    }

    const body = await request.json();
    const result = projectUpdateSchema.safeParse(body);

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

    const projectExists = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!projectExists) {
      return NextResponse.json(
        { success: false, message: "Project not found.", data: null },
        { status: 404 }
      );
    }

    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(result.data.title !== undefined && { title: result.data.title }),
        ...(result.data.description !== undefined && { description: result.data.description }),
        ...(result.data.status !== undefined && { status: result.data.status as ProjectStatus }),
        ...(result.data.deadline !== undefined && { deadline: new Date(result.data.deadline) }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Project updated successfully.",
      data: project,
    });
  } catch (error) {
    console.error("PUT /api/projects/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update project.", data: null },
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
    const projectId = parseInt(id, 10);

    if (isNaN(projectId)) {
      return NextResponse.json(
        { success: false, message: "Invalid project ID format.", data: null },
        { status: 400 }
      );
    }

    const projectExists = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!projectExists) {
      return NextResponse.json(
        { success: false, message: "Project not found.", data: null },
        { status: 404 }
      );
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully.",
      data: { id: projectId },
    });
  } catch (error) {
    console.error("DELETE /api/projects/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete project.", data: null },
      { status: 500 }
    );
  }
}
