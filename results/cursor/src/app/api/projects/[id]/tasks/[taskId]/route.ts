import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleApiError } from "@/lib/auth-guard";
import { taskSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string; taskId: string }> };

export async function PUT(request: NextRequest, context: Params) {
  try {
    await requireAuth();
    const { id, taskId } = await context.params;

    const existing = await prisma.task.findFirst({
      where: { id: taskId, projectId: id },
    });

    if (!existing) {
      return NextResponse.json({ error: "タスクが見つかりません" }, { status: 404 });
    }

    const body = await request.json();
    const result = taskSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "入力内容に誤りがあります", details: result.error.issues },
        { status: 400 }
      );
    }

    const { dueDate, ...rest } = result.data;

    const data = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...rest,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, context: Params) {
  try {
    await requireAuth();
    const { id, taskId } = await context.params;

    const existing = await prisma.task.findFirst({
      where: { id: taskId, projectId: id },
    });

    if (!existing) {
      return NextResponse.json({ error: "タスクが見つかりません" }, { status: 404 });
    }

    await prisma.task.delete({ where: { id: taskId } });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
