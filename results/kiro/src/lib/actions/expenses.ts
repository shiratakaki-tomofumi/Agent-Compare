"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ExpenseCategory, ExpenseStatus, Role } from "@prisma/client";
import { PAGE_SIZE } from "@/lib/constants";

const expenseSchema = z.object({
  amount: z.coerce.number().int().min(1, "金額は1円以上で入力してください"),
  category: z.nativeEnum(ExpenseCategory),
  description: z.string().min(1, "説明は必須です"),
  expenseDate: z.string().min(1, "経費発生日は必須です"),
});

export async function getExpenses(
  page: number,
  search: string,
  status: string,
  userId?: string,
) {
  await requireAuth();
  const where = {
    ...(userId ? { applicantId: userId } : {}),
    ...(search
      ? { description: { contains: search, mode: "insensitive" as const } }
      : {}),
    ...(status && status !== "ALL" ? { status: status as ExpenseStatus } : {}),
  };
  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      include: {
        applicant: { select: { name: true } },
        approver: { select: { name: true } },
      },
    }),
    prisma.expense.count({ where }),
  ]);
  return { expenses, total, totalPages: Math.ceil(total / PAGE_SIZE) };
}

export async function getPendingExpenses() {
  await requireRole([Role.MANAGER, Role.ADMIN]);
  return prisma.expense.findMany({
    where: { status: ExpenseStatus.PENDING },
    orderBy: { createdAt: "asc" },
    include: { applicant: { select: { name: true, departmentId: true } } },
  });
}

export async function createExpense(formData: FormData) {
  const session = await requireAuth();
  const parsed = expenseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0].message };
  try {
    await prisma.expense.create({
      data: {
        ...parsed.data,
        expenseDate: new Date(parsed.data.expenseDate),
        applicantId: session.user.id,
      },
    });
    revalidatePath("/finance/expenses");
    return { success: true };
  } catch {
    return { error: "作成に失敗しました" };
  }
}

export async function updateExpense(id: string, formData: FormData) {
  const session = await requireAuth();
  const expense = await prisma.expense.findUnique({ where: { id } });
  if (!expense) return { error: "経費が見つかりません" };
  if (expense.applicantId !== session.user.id)
    return { error: "権限がありません" };
  if (expense.status !== ExpenseStatus.PENDING)
    return { error: "承認済みまたは却下済みの経費は編集できません" };

  const parsed = expenseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0].message };
  try {
    await prisma.expense.update({
      where: { id },
      data: { ...parsed.data, expenseDate: new Date(parsed.data.expenseDate) },
    });
    revalidatePath("/finance/expenses");
    return { success: true };
  } catch {
    return { error: "更新に失敗しました" };
  }
}

export async function deleteExpense(id: string) {
  const session = await requireAuth();
  const expense = await prisma.expense.findUnique({ where: { id } });
  if (!expense) return { error: "経費が見つかりません" };
  if (expense.applicantId !== session.user.id)
    return { error: "権限がありません" };
  if (expense.status !== ExpenseStatus.PENDING)
    return { error: "承認済みまたは却下済みの経費は削除できません" };
  try {
    await prisma.expense.delete({ where: { id } });
    revalidatePath("/finance/expenses");
    return { success: true };
  } catch {
    return { error: "削除に失敗しました" };
  }
}

export async function approveExpense(id: string, comment: string) {
  const session = await requireRole([Role.MANAGER, Role.ADMIN]);
  try {
    await prisma.expense.update({
      where: { id },
      data: {
        status: ExpenseStatus.APPROVED,
        approverId: session.user.id,
        approverComment: comment,
        approvedAt: new Date(),
      },
    });
    revalidatePath("/finance/approvals");
    revalidatePath("/finance/expenses");
    return { success: true };
  } catch {
    return { error: "承認に失敗しました" };
  }
}

export async function rejectExpense(id: string, comment: string) {
  const session = await requireRole([Role.MANAGER, Role.ADMIN]);
  if (!comment.trim()) return { error: "却下理由を入力してください" };
  try {
    await prisma.expense.update({
      where: { id },
      data: {
        status: ExpenseStatus.REJECTED,
        approverId: session.user.id,
        approverComment: comment,
        approvedAt: new Date(),
      },
    });
    revalidatePath("/finance/approvals");
    revalidatePath("/finance/expenses");
    return { success: true };
  } catch {
    return { error: "却下に失敗しました" };
  }
}

export async function getFinanceSummary(year: number, month: number) {
  await requireRole([Role.MANAGER, Role.ADMIN]);
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0, 23, 59, 59);

  const [revenue, expenses, budgets, categoryBreakdown] = await Promise.all([
    prisma.revenue.findUnique({ where: { year_month: { year, month } } }),
    prisma.expense.aggregate({
      where: {
        expenseDate: { gte: monthStart, lte: monthEnd },
        status: ExpenseStatus.APPROVED,
      },
      _sum: { amount: true },
    }),
    prisma.budget.findMany({
      where: { year, month },
      include: { department: { select: { name: true } } },
    }),
    prisma.expense.groupBy({
      by: ["category"],
      where: {
        expenseDate: { gte: monthStart, lte: monthEnd },
        status: ExpenseStatus.APPROVED,
      },
      _sum: { amount: true },
    }),
  ]);

  // Actual expenses per department
  const deptExpenses = await prisma.expense.groupBy({
    by: ["applicantId"],
    where: {
      expenseDate: { gte: monthStart, lte: monthEnd },
      status: ExpenseStatus.APPROVED,
    },
    _sum: { amount: true },
  });

  const applicantIds = deptExpenses.map((e) => e.applicantId);
  const applicants = await prisma.user.findMany({
    where: { id: { in: applicantIds } },
    select: { id: true, departmentId: true },
  });

  const deptActualMap: Record<string, number> = {};
  for (const e of deptExpenses) {
    const applicant = applicants.find((a) => a.id === e.applicantId);
    if (applicant?.departmentId) {
      deptActualMap[applicant.departmentId] =
        (deptActualMap[applicant.departmentId] ?? 0) + (e._sum.amount ?? 0);
    }
  }

  const totalExpense = expenses._sum.amount ?? 0;
  const totalRevenue = revenue?.amount ?? 0;

  return {
    revenue: totalRevenue,
    revenueTarget: revenue?.target ?? 0,
    expense: totalExpense,
    balance: totalRevenue - totalExpense,
    budgets: budgets.map((b) => ({
      ...b,
      actual: deptActualMap[b.departmentId] ?? 0,
    })),
    categoryBreakdown: categoryBreakdown.map((c) => ({
      category: c.category,
      amount: c._sum.amount ?? 0,
    })),
  };
}
