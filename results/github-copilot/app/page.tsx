import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prismadb";
import AppShell from "@/components/AppShell";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const [deals, customers, projects, tasks, expenses, employees, revenues] =
    await Promise.all([
      prisma.deal.findMany(),
      prisma.customer.findMany({ where: { isDeleted: false } }),
      prisma.project.findMany({ where: { isDeleted: false } }),
      prisma.task.findMany(),
      prisma.expense.findMany(),
      prisma.user.findMany({ where: { isActive: true } }),
      prisma.revenue.findMany({ where: { year, month } }),
    ]);

  const totalDeals = deals.length;
  const wonDeals = deals.filter((d) => d.status === "WON").length;
  const closeRate =
    totalDeals > 0 ? Math.round((wonDeals / totalDeals) * 100) : 0;
  const thisMonthRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);
  const salesTarget = revenues.reduce((sum, r) => sum + r.target, 0) || 1;

  const ongoingProjects = projects.filter(
    (p) => p.status === "IN_PROGRESS",
  ).length;
  const delayedProjects = projects.filter(
    (p) => p.endDate < now && p.status !== "COMPLETED",
  ).length;
  const currentEmployees = employees.length;
  const newHiresThisMonth = employees.filter(
    (u) =>
      u.hireDate &&
      u.hireDate.getFullYear() === year &&
      u.hireDate.getMonth() + 1 === month,
  ).length;
  const pendingApprovals = expenses.filter(
    (e) => e.status === "PENDING",
  ).length;
  const totalSpend = expenses
    .filter(
      (e) =>
        e.expenseDate.getMonth() + 1 === month &&
        e.expenseDate.getFullYear() === year,
    )
    .reduce((sum, e) => sum + e.amount, 0);

  const activity = [
    {
      id: "1",
      label: "新規顧客登録",
      description: "Acme Corp が追加されました。",
    },
    {
      id: "2",
      label: "見積もり送付",
      description: "FooBar Inc に商談が作成されました。",
    },
    {
      id: "3",
      label: "経費申請",
      description: "Member User が経費申請を提出しました。",
    },
    {
      id: "4",
      label: "案件進捗",
      description: "Website Revamp が進行中です。",
    },
    { id: "5", label: "従業員入社", description: "John Doe が入社しました。" },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">ダッシュボード</h1>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card
            title="当月売上"
            value={`¥${thisMonthRevenue.toLocaleString()}`}
            badge={`目標: ¥${salesTarget.toLocaleString()}`}
          />
          <Card
            title="商談件数"
            value={`${totalDeals}`}
            badge={`成約率: ${closeRate}%`}
          />
          <Card
            title="進行中案件"
            value={`${ongoingProjects}`}
            badge={`遅延案件: ${delayedProjects}`}
          />
          <Card
            title="従業員"
            value={`${currentEmployees}`}
            badge={`今月入社: ${newHiresThisMonth}`}
          />
          <Card
            title="支出"
            value={`¥${totalSpend.toLocaleString()}`}
            badge={`承認待ち: ${pendingApprovals}`}
          />
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold">アクティビティフィード</h2>
          <ul className="space-y-2 rounded-lg border border-zinc-200 p-4 bg-white">
            {activity.map((item) => (
              <li
                key={item.id}
                className="rounded-md border border-zinc-100 p-3"
              >
                <strong>{item.label}</strong>
                <p className="text-sm text-zinc-600">{item.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppShell>
  );
}

function Card({
  title,
  value,
  badge,
}: {
  title: string;
  value: string;
  badge: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <p className="text-sm text-zinc-500">{title}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{badge}</p>
    </div>
  );
}
