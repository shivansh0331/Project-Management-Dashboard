import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProjectStatus } from "@prisma/client";
import { z } from "zod";

const projectCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500),
  status: z.enum(["Active", "Completed", "OnHold"]),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid deadline date",
  }),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("q") || "";
    const status = searchParams.get("status") || "";
    const sortBy = searchParams.get("sortBy") || "newest";
    const order = searchParams.get("order") || "desc";

    // Build prisma query
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (status && ["Active", "Completed", "OnHold"].includes(status)) {
      where.status = status as ProjectStatus;
    }

    // Build sorting
    let orderBy: any = {};
    if (sortBy === "name") {
      orderBy = { title: order === "desc" ? "desc" : "asc" };
    } else if (sortBy === "deadline") {
      orderBy = { deadline: order === "desc" ? "desc" : "asc" };
    } else if (sortBy === "status") {
      orderBy = { status: order === "desc" ? "desc" : "asc" };
    } else if (sortBy === "oldest") {
      orderBy = { createdAt: "asc" };
    } else {
      // Default: newest
      orderBy = { createdAt: "desc" };
    }

    const projects = await prisma.project.findMany({
      where,
      orderBy,
      include: {
        _count: {
          select: { tasks: true },
        },
        tasks: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Projects retrieved successfully.",
      data: projects,
    });
  } catch (error) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve projects.",
        data: null,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = projectCreateSchema.safeParse(body);

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

    const project = await prisma.project.create({
      data: {
        title: result.data.title,
        description: result.data.description,
        status: result.data.status as ProjectStatus,
        deadline: new Date(result.data.deadline),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Project created successfully.",
        data: project,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create project.",
        data: null,
      },
      { status: 500 }
    );
  }
}
