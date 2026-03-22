import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole, handleApiError } from "@/lib/auth-guard";
import { dealSchema } from "@/lib/validations";
import { PAGE_SIZE } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const page = Math.max(1, Number(searchParams.get("page") || "1"));

    const where = {
      ...(search && {
        title: { contains: search, mode: "insensitive" as const },
      }),
      ...(status && {
        status: status as "LEAD" | "PROPOSAL" | "NEGOTIATION" | "WON" | "LOST",
      }),
    };

    const [data, total] = await Promise.all([
      prisma.deal.findMany({
        where,
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          customer: true,
          assignee: { select: { id: true, name: true, email: true } },
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.deal.count({ where }),
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
    const result = dealSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "入力内容に誤りがあります", details: result.error.issues },
        { status: 400 }
      );
    }

    const data = await prisma.deal.create({
      data: result.data,
      include: {
        customer: true,
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
