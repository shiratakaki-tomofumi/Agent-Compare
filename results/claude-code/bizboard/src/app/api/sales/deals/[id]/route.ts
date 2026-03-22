import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole, handleApiError } from "@/lib/auth-guard";
import { dealSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Params) {
  try {
    await requireAuth();
    const { id } = await context.params;

    const data = await prisma.deal.findUnique({
      where: { id },
      include: {
        customer: true,
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    if (!data) {
      return NextResponse.json({ error: "商談が見つかりません" }, { status: 404 });
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
    const result = dealSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "入力内容に誤りがあります", details: result.error.issues },
        { status: 400 }
      );
    }

    const existing = await prisma.deal.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "商談が見つかりません" }, { status: 404 });
    }

    const data = await prisma.deal.update({
      where: { id },
      data: result.data,
      include: {
        customer: true,
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
    await requireRole("MANAGER", "ADMIN");
    const { id } = await context.params;

    const existing = await prisma.deal.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "商談が見つかりません" }, { status: 404 });
    }

    await prisma.deal.delete({ where: { id } });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
