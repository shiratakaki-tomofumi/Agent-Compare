import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole, handleApiError } from "@/lib/auth-guard";
import { projectSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Params) {
  try {
    await requireAuth();
    const { id } = await context.params;

    const data = await prisma.project.findFirst({
      where: { id, isDeleted: false },
      include: {
        department: true,
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!data) {
      return NextResponse.json({ error: "案件が見つかりません" }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, context: Params) {
  try {
    await requireRole("MANAGER", "ADMIN");
    const { id } = await context.params;

    const body = await request.json();
    const result = projectSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "入力内容に誤りがあります", details: result.error.issues },
        { status: 400 }
      );
    }

    const existing = await prisma.project.findFirst({
      where: { id, isDeleted: false },
    });

    if (!existing) {
      return NextResponse.json({ error: "案件が見つかりません" }, { status: 404 });
    }

    const { startDate, endDate, ...rest } = result.data;

    const data = await prisma.project.update({
      where: { id },
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

    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, context: Params) {
  try {
    await requireRole("MANAGER", "ADMIN");
    const { id } = await context.params;

    const existing = await prisma.project.findFirst({
      where: { id, isDeleted: false },
    });

    if (!existing) {
      return NextResponse.json({ error: "案件が見つかりません" }, { status: 404 });
    }

    await prisma.project.update({
      where: { id },
      data: { isDeleted: true },
    });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
