import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
  });
  if (!customer || customer.isDeleted) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
  return NextResponse.json(customer);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const body = await request.json();
  const customer = await prisma.customer.update({
    where: { id: params.id },
    data: {
      companyName: body.companyName,
      contactName: body.contactName,
      email: body.email,
      phone: body.phone,
      status: body.status,
    },
  });
  return NextResponse.json(customer);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const customer = await prisma.customer.update({
    where: { id: params.id },
    data: { isDeleted: true },
  });
  return NextResponse.json(customer);
}
