import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, handleApiError } from "@/lib/auth-guard";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

const approveSchema = z.object({
  action: z.enum(["approve", "reject"]),
  comment: z.string().optional(),
});

export async function POST(request: NextRequest, context: Params) {
  try {
    const user = await requireRole("MANAGER", "ADMIN");
    const { id } = await context.params;

    const existing = await prisma.expense.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "経費申請が見つかりません" }, { status: 404 });
    }

    if (existing.status !== "PENDING") {
      return NextResponse.json(
        { error: "申請中の経費のみ承認・却下できます" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const result = approveSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "入力内容に誤りがあります", details: result.error.issues },
        { status: 400 }
      );
    }

    const data = await prisma.expense.update({
      where: { id },
      data: {
        status: result.data.action === "approve" ? "APPROVED" : "REJECTED",
        approverId: user.id,
        approverComment: result.data.comment || null,
        approvedAt: new Date(),
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
