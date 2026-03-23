import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole, handleApiError } from "@/lib/auth-guard";
import { projectSchema } from "@/lib/validations";
import { PAGE_SIZE } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const page = Math.max(1, Number(searchParams.get("page") || "1"));

    const where = {
      isDeleted: false,
      ...(search && {
        name: { contains: search, mode: "insensitive" as const },
      }),
      ...(status && {
        status: status as "PLANNING" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD",
      }),
    };

    const [data, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          department: true,
          _count: { select: { tasks: true } },
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.project.count({ where }),
    ]);

    return NextResponse.json({ data, total });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole("MANAGER", "ADMIN");

    const body = await request.json();
    const result = projectSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "入力内容に誤りがあります", details: result.error.issues },
        { status: 400 }
      );
    }

    const { startDate, endDate, ...rest } = result.data;

    const data = await prisma.project.create({
      data: {
        ...rest,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
      include: {
        department: true,
        _count: { select: { tasks: true } },
      },
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
