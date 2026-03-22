import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole, handleApiError } from "@/lib/auth-guard";
import { employeeSchema } from "@/lib/validations";
import { hash } from "bcryptjs";

type Params = { params: Promise<{ id: string }> };

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  position: true,
  hireDate: true,
  isActive: true,
  department: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function GET(request: NextRequest, context: Params) {
  try {
    await requireAuth();
    const { id } = await context.params;

    const data = await prisma.user.findFirst({
      where: { id, isActive: true },
      select: userSelect,
    });

    if (!data) {
      return NextResponse.json({ error: "従業員が見つかりません" }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, context: Params) {
  try {
    await requireRole("ADMIN");
    const { id } = await context.params;

    const existing = await prisma.user.findFirst({
      where: { id, isActive: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "従業員が見つかりません" }, { status: 404 });
    }

    const body = await request.json();
    const result = employeeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "入力内容に誤りがあります", details: result.error.issues },
        { status: 400 }
      );
    }

    const { password, hireDate, ...rest } = result.data;

    // Check email uniqueness if changed
    if (rest.email !== existing.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: rest.email },
      });
      if (emailExists) {
        return NextResponse.json(
          { error: "このメールアドレスは既に使用されています" },
          { status: 409 }
        );
      }
    }

    const updateData: Record<string, unknown> = {
      ...rest,
      ...(hireDate && { hireDate: new Date(hireDate) }),
    };

    if (password) {
      updateData.password = await hash(password, 12);
    }

    const data = await prisma.user.update({
      where: { id },
      data: updateData,
      select: userSelect,
    });

    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, context: Params) {
  try {
    await requireRole("ADMIN");
    const { id } = await context.params;

    const existing = await prisma.user.findFirst({
      where: { id, isActive: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "従業員が見つかりません" }, { status: 404 });
    }

    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
