"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { CustomerStatus, Role } from "@prisma/client";
import { PAGE_SIZE } from "@/lib/constants";

const customerSchema = z.object({
  companyName: z.string().min(1, "会社名は必須です"),
  contactName: z.string().min(1, "担当者名は必須です"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  phone: z.string().optional(),
  status: z.nativeEnum(CustomerStatus),
});

export async function getCustomers(
  page: number,
  search: string,
  status: string,
) {
  await requireAuth();
  const where = {
    isDeleted: false,
    ...(search
      ? {
          OR: [
            { companyName: { contains: search, mode: "insensitive" as const } },
            { contactName: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(status && status !== "ALL" ? { status: status as CustomerStatus } : {}),
  };
  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
    }),
    prisma.customer.count({ where }),
  ]);
  return { customers, total, totalPages: Math.ceil(total / PAGE_SIZE) };
}

export async function getCustomer(id: string) {
  await requireAuth();
  const customer = await prisma.customer.findFirst({
    where: { id, isDeleted: false },
    include: {
      deals: {
        include: { assignee: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  return customer;
}

export async function createCustomer(formData: FormData) {
  await requireRole([Role.MANAGER, Role.ADMIN]);
  const parsed = customerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0].message };
  try {
    await prisma.customer.create({ data: parsed.data });
    revalidatePath("/sales/customers");
    return { success: true };
  } catch {
    return { error: "作成に失敗しました" };
  }
}

export async function updateCustomer(id: string, formData: FormData) {
  await requireRole([Role.MANAGER, Role.ADMIN]);
  const parsed = customerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0].message };
  try {
    await prisma.customer.update({ where: { id }, data: parsed.data });
    revalidatePath("/sales/customers");
    revalidatePath(`/sales/customers/${id}`);
    return { success: true };
  } catch {
    return { error: "更新に失敗しました" };
  }
}

export async function deleteCustomer(id: string) {
  await requireRole([Role.MANAGER, Role.ADMIN]);
  try {
    await prisma.customer.update({ where: { id }, data: { isDeleted: true } });
    revalidatePath("/sales/customers");
    return { success: true };
  } catch {
    return { error: "削除に失敗しました" };
  }
}
