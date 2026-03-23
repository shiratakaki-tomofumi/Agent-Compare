import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole, handleApiError } from "@/lib/auth-guard";
import { customerSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Params) {
  try {
    await requireAuth();
    const { id } = await context.params;

    const data = await prisma.customer.findFirst({
      where: { id, isDeleted: false },
      include: { deals: true },
    });

    if (!data) {
      return NextResponse.json({ error: "顧客が見つかりません" }, { status: 404 });
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
    const result = customerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "入力内容に誤りがあります", details: result.error.issues },
        { status: 400 }
      );
    }

    const existing = await prisma.customer.findFirst({
      where: { id, isDeleted: false },
    });

    if (!existing) {
      return NextResponse.json({ error: "顧客が見つかりません" }, { status: 404 });
    }

    const data = await prisma.customer.update({
      where: { id },
      data: result.data,
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

    const existing = await prisma.customer.findFirst({
      where: { id, isDeleted: false },
    });

    if (!existing) {
      return NextResponse.json({ error: "顧客が見つかりません" }, { status: 404 });
    }

    await prisma.customer.update({
      where: { id },
      data: { isDeleted: true },
    });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
