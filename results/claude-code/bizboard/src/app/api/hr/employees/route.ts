import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole, handleApiError } from "@/lib/auth-guard";
import { employeeSchema } from "@/lib/validations";
import { PAGE_SIZE } from "@/lib/constants";
import { hash } from "bcryptjs";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search") || "";
    const page = Math.max(1, Number(searchParams.get("page") || "1"));

    const where = {
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          position: true,
          hireDate: true,
          isActive: true,
          department: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({ data, total });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole("ADMIN");

    const body = await request.json();
    const result = employeeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "入力内容に誤りがあります", details: result.error.issues },
        { status: 400 }
      );
    }

    const { password, hireDate, ...rest } = result.data;

    if (!password) {
      return NextResponse.json(
        { error: "新規作成時はパスワードが必須です" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: rest.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "このメールアドレスは既に使用されています" },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 12);

    const data = await prisma.user.create({
      data: {
        ...rest,
        password: hashedPassword,
        ...(hireDate && { hireDate: new Date(hireDate) }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        position: true,
        hireDate: true,
        isActive: true,
        department: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
