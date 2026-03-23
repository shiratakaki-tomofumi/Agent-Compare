import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import { DealStatus, ProjectStatus, ExpenseStatus, Role } from "@prisma/client";
import { TrendingUp, FolderKanban, Receipt, Users } from "lucide-react";

async function getDashboardData() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0, 23, 59, 59);

  const [
    revenue,
    deals,
    projects,
    tasks,
    expenses,
    pendingExpenses,
    employees,
    newHires,
  ] = await Promise.all([
    prisma.revenue.findUnique({ where: { year_month: { year, month } } }),
    prisma.deal.groupBy({ by: ["status"], _count: true }),
    prisma.project.groupBy({
      by: ["status"],
      where: { isDeleted: false },
      _count: true,
    }),
    prisma.task.groupBy({ by: ["status"], _count: true }),
    prisma.expense.aggregate({
      where: {
        expenseDate: { gte: monthStart, lte: monthEnd },
        status: ExpenseStatus.APPROVED,
      },
      _sum: { amount: true },
    }),
    prisma.expense.count({ where: { status: ExpenseStatus.PENDING } }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({
      where: { hireDate: { gte: monthStart, lte: monthEnd }, isActive: true },
    }),
  ]);

  const wonDeals = deals.find((d) => d.status === DealStatus.WON)?._count ?? 0;
  const totalDeals = deals.reduce((s, d) => s + d._count, 0);
  const winRate =
    totalDeals > 0 ? Math.round((wonDeals / totalDeals) * 100) : 0;
  const inProgressProjects =
    projects.find((p) => p.status === ProjectStatus.IN_PROGRESS)?._count ?? 0;
  const doneTasks = tasks.find((t) => t.status === "DONE")?._count ?? 0;

  // Overdue projects: endDate < now and status != COMPLETED
  const overdueProjects = await prisma.project.count({
    where: {
      isDeleted: false,
      endDate: { lt: now },
      status: { not: ProjectStatus.COMPLETED },
    },
  });

  return {
    revenue: revenue?.amount ?? 0,
    revenueTarget: revenue?.target ?? 0,
    dealCount: totalDeals,
    winRate,
    inProgressProjects,
    doneTasks,
    overdueProjects,
    monthlyExpense: expenses._sum.amount ?? 0,
    pendingExpenses,
    employeeCount: employees,
    newHires,
  };
}

async function getRecentActivity() {
  const [recentDeals, recentExpenses, recentProjects] = await Promise.all([
    prisma.deal.findMany({
      take: 2,
      orderBy: { createdAt: "desc" },
      include: { customer: { select: { companyName: true } } },
    }),
    prisma.expense.findMany({
      take: 2,
      orderBy: { createdAt: "desc" },
      include: { applicant: { select: { name: true } } },
    }),
    prisma.project.findMany({
      take: 1,
      orderBy: { createdAt: "desc" },
      where: { isDeleted: false },
    }),
  ]);

  type ActivityItem = { id: string; label: string; time: Date };
  const activities: ActivityItem[] = [
    ...recentDeals.map((d) => ({
      id: `deal-${d.id}`,
      label: `商談「${d.title}」(${d.customer.companyName})`,
      time: d.createdAt,
    })),
    ...recentExpenses.map((e) => ({
      id: `exp-${e.id}`,
      label: `経費申請「${e.description}」(${e.applicant.name})`,
      time: e.createdAt,
    })),
    ...recentProjects.map((p) => ({
      id: `proj-${p.id}`,
      label: `案件「${p.name}」`,
      time: p.createdAt,
    })),
  ];

  return activities
    .sort((a, b) => b.time.getTime() - a.time.getTime())
    .slice(0, 5);
}

export default async function DashboardPage() {
  const session = await getSession();
  const [data, activities] = await Promise.all([
    getDashboardData(),
    getRecentActivity(),
  ]);
  const isManagerOrAdmin =
    session &&
    ([Role.MANAGER, Role.ADMIN] as Role[]).includes(session.user.role as Role);

  const kpiCards = [
    {
      title: "営業",
      icon: <TrendingUp className="h-5 w-5 text-blue-500" />,
      items: [
        { label: "当月売上", value: formatCurrency(data.revenue) },
        { label: "商談件数", value: `${data.dealCount}件` },
        { label: "成約率", value: `${data.winRate}%` },
      ],
    },
    {
      title: "案件",
      icon: <FolderKanban className="h-5 w-5 text-green-500" />,
      items: [
        { label: "進行中案件", value: `${data.inProgressProjects}件` },
        { label: "完了タスク", value: `${data.doneTasks}件` },
        { label: "遅延案件", value: `${data.overdueProjects}件` },
      ],
    },
    ...(isManagerOrAdmin
      ? [
          {
            title: "財務",
            icon: <Receipt className="h-5 w-5 text-orange-500" />,
            items: [
              { label: "当月支出", value: formatCurrency(data.monthlyExpense) },
              { label: "承認待ち", value: `${data.pendingExpenses}件` },
            ],
          },
        ]
      : []),
    {
      title: "人事",
      icon: <Users className="h-5 w-5 text-purple-500" />,
      items: [
        { label: "従業員数", value: `${data.employeeCount}名` },
        { label: "当月入社", value: `${data.newHires}名` },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ダッシュボード</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((card) => (
          <div
            key={card.title}
            className="rounded-lg border bg-card p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              {card.icon}
              <h2 className="font-semibold">{card.title}</h2>
            </div>
            <dl className="space-y-2">
              {card.items.map((item) => (
                <div
                  key={item.label}
                  className="flex justify-between items-center"
                >
                  <dt className="text-sm text-muted-foreground">
                    {item.label}
                  </dt>
                  <dd className="text-sm font-semibold">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-card p-5 shadow-sm">
        <h2 className="font-semibold mb-4">最近のアクティビティ</h2>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">データがありません</p>
        ) : (
          <ul className="space-y-3">
            {activities.map((a) => (
              <li key={a.id} className="flex items-start gap-3 text-sm">
                <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <span className="flex-1">{a.label}</span>
                <span className="text-muted-foreground text-xs whitespace-nowrap">
                  {new Intl.DateTimeFormat("ja-JP", {
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(a.time)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
