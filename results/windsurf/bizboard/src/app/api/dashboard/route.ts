import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1

    const [
      totalUsers,
      activeDeals,
      monthlyRevenue,
      pendingExpenses,
      activeProjects,
      completedTasks,
      dealsByStatus,
      projectsByStatus,
      expensesByCategory,
    ] = await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.deal.count({ 
        where: { status: { in: ['LEAD', 'PROPOSAL', 'NEGOTIATION'] } } 
      }),
      prisma.revenue.findUnique({
        where: { year_month: { year: currentYear, month: currentMonth } },
      }),
      prisma.expense.count({ where: { status: 'PENDING' } }),
      prisma.project.count({ 
        where: { status: 'IN_PROGRESS', isDeleted: false } 
      }),
      prisma.task.count({ where: { status: 'DONE' } }),
      prisma.deal.groupBy({
        by: ['status'],
        _count: true,
      }),
      prisma.project.groupBy({
        by: ['status'],
        where: { isDeleted: false },
        _count: true,
      }),
      prisma.expense.groupBy({
        by: ['category'],
        _sum: { amount: true },
      }),
    ])

    const monthlySalesData = await prisma.revenue.findMany({
      where: { year: currentYear },
      orderBy: { month: 'asc' },
    })

    return NextResponse.json({
      kpis: {
        totalUsers,
        activeDeals,
        monthlyRevenue: monthlyRevenue?.amount || 0,
        monthlyTarget: monthlyRevenue?.target || 0,
        pendingExpenses,
        activeProjects,
        completedTasks,
      },
      charts: {
        dealsByStatus,
        projectsByStatus,
        expensesByCategory,
        monthlySalesData,
      },
    })
  } catch (error) {
    console.error('Dashboard data fetch error:', error)
    return NextResponse.json(
      { error: 'ダッシュボードデータの取得に失敗しました' },
      { status: 500 }
    )
  }
}
