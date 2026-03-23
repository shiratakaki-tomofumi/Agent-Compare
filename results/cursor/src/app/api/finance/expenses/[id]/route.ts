import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleApiError, AuthError } from "@/lib/auth-guard";
import { expenseSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: Params) {
  try {
    await requireAuth();
    const { id } = await context.params;

    const data = await prisma.expense.findUnique({
      where: { id },
      include: {
        applicant: { select: { id: true, name: true, email: true } },
        approver: { select: { id: true, name: true, email: true } },
      },
    });

    if (!data) {
      return NextResponse.json({ error: "経費申請が見つかりません" }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, context: Params) {
  try {
    const user = await requireAuth();
    const { id } = await context.params;

    const existing = await prisma.expense.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "経費申請が見つかりません" }, { status: 404 });
    }

    if (existing.applicantId !== user.id) {
      throw new AuthError("自分の申請のみ編集できます", 403);
    }

    if (existing.status !== "PENDING") {
      return NextResponse.json(
        { error: "申請中の経費のみ編集できます" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const result = expenseSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "入力内容に誤りがあります", details: result.error.issues },
        { status: 400 }
      );
    }

    const { expenseDate, ...rest } = result.data;

    const data = await prisma.expense.update({
      where: { id },
      data: {
        ...rest,
        expenseDate: new Date(expenseDate),
      },
      include: {
        applicant: { select: { id: true, name: true, email: true } },
        approver: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, context: Params) {
  try {
    const user = await requireAuth();
    const { id } = await context.params;

    const existing = await prisma.expense.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "経費申請が見つかりません" }, { status: 404 });
    }

    if (existing.applicantId !== user.id) {
      throw new AuthError("自分の申請のみ削除できます", 403);
    }

    if (existing.status !== "PENDING") {
      return NextResponse.json(
        { error: "申請中の経費のみ削除できます" },
        { status: 400 }
      );
    }

    await prisma.expense.delete({ where: { id } });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
