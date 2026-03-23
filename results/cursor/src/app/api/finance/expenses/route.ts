import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleApiError } from "@/lib/auth-guard";
import { expenseSchema } from "@/lib/validations";
import { PAGE_SIZE } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const mine = searchParams.get("mine") === "true";

    const where = {
      ...(mine && { applicantId: user.id }),
      ...(search && {
        description: { contains: search, mode: "insensitive" as const },
      }),
      ...(status && {
        status: status as "PENDING" | "APPROVED" | "REJECTED",
      }),
    };

    const [data, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          applicant: { select: { id: true, name: true, email: true } },
          approver: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.expense.count({ where }),
    ]);

    return NextResponse.json({ data, total });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const result = expenseSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "入力内容に誤りがあります", details: result.error.issues },
        { status: 400 }
      );
    }

    const { expenseDate, ...rest } = result.data;

    const data = await prisma.expense.create({
      data: {
        ...rest,
        expenseDate: new Date(expenseDate),
        applicantId: user.id,
      },
      include: {
        applicant: { select: { id: true, name: true, email: true } },
        approver: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
