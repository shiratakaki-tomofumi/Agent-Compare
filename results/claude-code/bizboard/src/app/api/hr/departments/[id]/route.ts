import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, handleApiError } from "@/lib/auth-guard";
import { departmentSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: Params) {
  try {
    await requireRole("MANAGER", "ADMIN");
    const { id } = await context.params;

    const existing = await prisma.department.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "部署が見つかりません" }, { status: 404 });
    }

    const body = await request.json();
    const result = departmentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "入力内容に誤りがあります", details: result.error.issues },
        { status: 400 }
      );
    }

    const data = await prisma.department.update({
      where: { id },
      data: result.data,
      include: {
        _count: { select: { users: true } },
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

    const existing = await prisma.department.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "部署が見つかりません" }, { status: 404 });
    }

    if (existing._count.users > 0) {
      return NextResponse.json(
        { error: "所属する従業員がいるため削除できません" },
        { status: 400 }
      );
    }

    await prisma.department.delete({ where: { id } });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
