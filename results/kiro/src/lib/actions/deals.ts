"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { DealStatus, Role } from "@prisma/client";
import { PAGE_SIZE } from "@/lib/constants";

const dealSchema = z.object({
  title: z.string().min(1, "商談名は必須です"),
  customerId: z.string().min(1, "顧客は必須です"),
  assigneeId: z.string().min(1, "担当者は必須です"),
  amount: z.coerce.number().int().min(0, "金額は0以上で入力してください"),
  probability: z.coerce
    .number()
    .int()
    .min(0)
    .max(100, "確度は0〜100で入力してください"),
  status: z.nativeEnum(DealStatus),
  note: z.string().optional(),
});

export async function getDeals(page: number, search: string, status: string) {
  await requireAuth();
  const where = {
    ...(search
      ? { title: { contains: search, mode: "insensitive" as const } }
      : {}),
    ...(status && status !== "ALL" ? { status: status as DealStatus } : {}),
  };
  const [deals, total] = await Promise.all([
    prisma.deal.findMany({
      where,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { companyName: true } },
        assignee: { select: { name: true } },
      },
    }),
    prisma.deal.count({ where }),
  ]);
  return { deals, total, totalPages: Math.ceil(total / PAGE_SIZE) };
}

export async function getDeal(id: string) {
  await requireAuth();
  return prisma.deal.findUnique({
    where: { id },
    include: { customer: true, assignee: { select: { id: true, name: true } } },
  });
}

export async function createDeal(formData: FormData) {
  await requireRole([Role.MANAGER, Role.ADMIN]);
  const parsed = dealSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0].message };
  try {
    await prisma.deal.create({ data: parsed.data });
    revalidatePath("/sales/deals");
    return { success: true };
  } catch {
    return { error: "作成に失敗しました" };
  }
}

export async function updateDeal(id: string, formData: FormData) {
  await requireRole([Role.MANAGER, Role.ADMIN]);
  const parsed = dealSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0].message };
  try {
    const data = {
      ...parsed.data,
      closedAt: ([DealStatus.WON, DealStatus.LOST] as DealStatus[]).includes(
        parsed.data.status,
      )
        ? new Date()
        : null,
    };
    await prisma.deal.update({ where: { id }, data });
    revalidatePath("/sales/deals");
    revalidatePath(`/sales/deals/${id}`);
    return { success: true };
  } catch {
    return { error: "更新に失敗しました" };
  }
}

export async function deleteDeal(id: string) {
  await requireRole([Role.MANAGER, Role.ADMIN]);
  try {
    await prisma.deal.delete({ where: { id } });
    revalidatePath("/sales/deals");
    return { success: true };
  } catch {
    return { error: "削除に失敗しました" };
  }
}
