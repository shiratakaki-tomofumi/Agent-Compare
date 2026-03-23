import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const deal = await prisma.deal.findUnique({
    where: { id: params.id },
    include: { customer: true, assignee: true },
  });
  if (!deal)
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(deal);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const body = await request.json();
  const updated = await prisma.deal.update({
    where: { id: params.id },
    data: {
      title: body.title,
      customerId: body.customerId,
      assigneeId: body.assigneeId,
      amount: Number(body.amount),
      probability: Number(body.probability),
      status: body.status,
      note: body.note,
      closedAt:
        body.status === "WON" || body.status === "LOST" ? new Date() : null,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  await prisma.deal.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
