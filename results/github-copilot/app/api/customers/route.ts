import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const status = searchParams.get("status") as "ACTIVE" | "DORMANT" | undefined;
  const page = Number(searchParams.get("page") || "1");
  const limit = 10;

  const where = {
    isDeleted: false,
    status,
    OR: [
      { companyName: { contains: q, mode: "insensitive" } },
      { contactName: { contains: q, mode: "insensitive" } },
    ],
  };

  const [items, total] = await Promise.all([
    prisma.customer.findMany({
      where: status ? where : { ...where, status: undefined },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.customer.count({
      where: status ? where : { ...where, status: undefined },
    }),
  ]);

  return NextResponse.json({ items, total });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const created = await prisma.customer.create({
    data: {
      companyName: body.companyName,
      contactName: body.contactName,
      email: body.email,
      phone: body.phone,
      status: body.status ?? "ACTIVE",
    },
  });

  return NextResponse.json(created, { status: 201 });
}
