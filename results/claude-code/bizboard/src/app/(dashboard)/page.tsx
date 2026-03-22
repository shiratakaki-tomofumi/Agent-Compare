import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DollarSign,
  Briefcase,
  TrendingUp,
  FolderOpen,
  CheckCircle,
  AlertTriangle,
  Receipt,
  Clock,
  Users,
  UserPlus,
} from "lucide-react";
import { format } from "date-fns";

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

function KpiCard({ icon, label, value }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

async function getDashboardData() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);

  const [
    revenue,
    dealCount,
    wonDealCount,
    activeProjectCount,
    completedTaskCount,
    delayedProjectCount,
    monthlyExpenseResult,
    pendingExpenseCount,
    employeeCount,
    newHireCount,
    recentDeals,
    recentProjects,
    recentExpenses,
  ] = await Promise.all([
    prisma.revenue.findUnique({
      where: { year_month: { year, month } },
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
      },
    }),
    prisma.deal.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { title: true, updatedAt: true },
    }),
    prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      where: { isDeleted: false },
      select: { name: true, updatedAt: true },
    }),
    prisma.expense.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { description: true, updatedAt: true },
    }),
  ]);

  const winRate =
    dealCount > 0 ? Math.round((wonDealCount / dealCount) * 100) : 0;
  const monthlyExpense = monthlyExpenseResult._sum.amount ?? 0;

  const activities = [
    ...recentDeals.map((d) => ({
      type: "商談" as const,
      title: d.title,
      updatedAt: d.updatedAt,
    })),
    ...recentProjects.map((p) => ({
      type: "案件" as const,
      title: p.name,
      updatedAt: p.updatedAt,
    })),
    ...recentExpenses.map((e) => ({
      type: "経費" as const,
      title: e.description,
      updatedAt: e.updatedAt,
    })),
  ]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 5);

  return {
    revenue: revenue?.amount ?? 0,
    dealCount,
    winRate,
    activeProjectCount,
    completedTaskCount,
    delayedProjectCount,
    monthlyExpense,
    pendingExpenseCount,
    employeeCount,
    newHireCount,
    activities,
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ダッシュボード</h1>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-muted-foreground">
          営業
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            icon={<DollarSign className="size-5" />}
            label="当月売上"
            value={`\u00A5${data.revenue.toLocaleString("ja-JP")}`}
          />
          <KpiCard
            icon={<Briefcase className="size-5" />}
            label="商談件数"
            value={`${data.dealCount}件`}
          />
          <KpiCard
            icon={<TrendingUp className="size-5" />}
            label="成約率"
            value={`${data.winRate}%`}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-muted-foreground">
          案件管理
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            icon={<FolderOpen className="size-5" />}
            label="進行中案件数"
            value={`${data.activeProjectCount}件`}
          />
          <KpiCard
            icon={<CheckCircle className="size-5" />}
            label="完了タスク数"
            value={`${data.completedTaskCount}件`}
          />
          <KpiCard
            icon={<AlertTriangle className="size-5" />}
            label="遅延案件数"
            value={`${data.delayedProjectCount}件`}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-muted-foreground">
          経費
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            icon={<Receipt className="size-5" />}
            label="当月支出"
            value={`\u00A5${data.monthlyExpense.toLocaleString("ja-JP")}`}
          />
          <KpiCard
            icon={<Clock className="size-5" />}
            label="承認待ち件数"
            value={`${data.pendingExpenseCount}件`}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-muted-foreground">
          人事
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            icon={<Users className="size-5" />}
            label="従業員数"
            value={`${data.employeeCount}名`}
          />
          <KpiCard
            icon={<UserPlus className="size-5" />}
            label="当月入社者数"
            value={`${data.newHireCount}名`}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-muted-foreground">
          最近の更新
        </h2>
        <Card>
          <CardContent className="divide-y">
            {data.activities.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                更新はありません
              </p>
            ) : (
              data.activities.map((activity, index) => (
                <div
                  key={`${activity.type}-${index}`}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium">
                      {activity.type}
                    </span>
                    <span className="text-sm">{activity.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(activity.updatedAt, "yyyy/MM/dd HH:mm")}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
