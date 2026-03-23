import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") || "";
  const status = url.searchParams.get("status") as string | null;
  const page = Number(url.searchParams.get("page") || "1");
  const limit = 10;

  const where: any = {
    OR: [
      { title: { contains: q, mode: "insensitive" } },
      { note: { contains: q, mode: "insensitive" } },
    ],
  };
  if (status) where.status = status;

  const [items, total] = await Promise.all([
    prisma.deal.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: { customer: true, assignee: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.deal.count({ where }),
  ]);

  return NextResponse.json({ items, total });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const created = await prisma.deal.create({
    data: {
      title: body.title,
      customerId: body.customerId,
      assigneeId: body.assigneeId,
      amount: Number(body.amount),
      probability: Number(body.probability),
      status: body.status || "LEAD",
      note: body.note,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
