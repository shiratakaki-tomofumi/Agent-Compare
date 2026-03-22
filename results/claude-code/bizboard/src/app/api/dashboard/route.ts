import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, handleApiError } from "@/lib/auth-guard";

export async function GET() {
  try {
    await requireAuth();

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

    // Split into two batches to stay within TypeScript's Promise.all overload limit
    const [
      monthlyRevenue,
      totalDeals,
      wonDeals,
      activeProjects,
      completedTasks,
      delayedProjects,
      monthlyExpenses,
      pendingExpenses,
      activeUsers,
      newHires,
    ] = await Promise.all([
      prisma.revenue.findUnique({
        where: {
          year_month: { year: currentYear, month: currentMonth + 1 },
        },
      }),
      prisma.deal.count(),
      prisma.deal.count({ where: { status: "WON" } }),
      prisma.project.count({
        where: { status: "IN_PROGRESS", isDeleted: false },
      }),
      prisma.task.count({ where: { status: "DONE" } }),
      prisma.project.count({
        where: {
          endDate: { lt: now },
          status: { not: "COMPLETED" },
          isDeleted: false,
        },
      }),
      prisma.expense.aggregate({
        _sum: { amount: true },
        where: {
          status: "APPROVED",
          expenseDate: { gte: monthStart, lte: monthEnd },
        },
      }),
      prisma.expense.count({ where: { status: "PENDING" } }),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({
        where: {
          hireDate: { gte: monthStart, lte: monthEnd },
          isActive: true,
        },
      }),
    ]);

    const [recentDeals, recentExpenses, recentProjects] = await Promise.all([
      prisma.deal.findMany({
        take: 5,
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          title: true,
          status: true,
          updatedAt: true,
        },
      }),
      prisma.expense.findMany({
        take: 5,
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          description: true,
          status: true,
          updatedAt: true,
        },
      }),
      prisma.project.findMany({
        take: 5,
        where: { isDeleted: false },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          name: true,
          status: true,
          updatedAt: true,
        },
      }),
    ]);

    // Merge and sort recent activities
    const recentActivities = [
      ...recentDeals.map((d) => ({
        type: "deal" as const,
        id: d.id,
        title: d.title,
        status: d.status,
        updatedAt: d.updatedAt,
      })),
      ...recentExpenses.map((e) => ({
        type: "expense" as const,
        id: e.id,
        title: e.description,
        status: e.status,
        updatedAt: e.updatedAt,
      })),
      ...recentProjects.map((p) => ({
        type: "project" as const,
        id: p.id,
        title: p.name,
        status: p.status,
        updatedAt: p.updatedAt,
      })),
    ]
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 5);

    const winRate = totalDeals > 0 ? Math.round((wonDeals / totalDeals) * 100) : 0;

    const data = {
      sales: {
        monthlyRevenue: monthlyRevenue?.amount ?? 0,
        dealCount: totalDeals,
        winRate,
      },
      projects: {
        activeCount: activeProjects,
        completedTasks,
        delayedCount: delayedProjects,
      },
      finance: {
        monthlyExpenses: monthlyExpenses._sum.amount ?? 0,
        pendingCount: pendingExpenses,
      },
      hr: {
        employeeCount: activeUsers,
        newHiresThisMonth: newHires,
      },
      recentActivities,
    };

    return NextResponse.json({ data });
  } catch (error) {
    return handleApiError(error);
  }
}
