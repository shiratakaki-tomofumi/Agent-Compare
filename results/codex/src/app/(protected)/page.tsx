import { SalesChart } from "@/components/charts";
import { KPIStat, PageHeader, Panel, StatusBadge } from "@/components/ui";
import { getDashboardData } from "@/lib/queries";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-8">
      <PageHeader
        title="ダッシュボード"
        description="営業、案件、財務、人事の主要指標を横断して確認できます。"
      />

      <div className="grid gap-4 xl:grid-cols-4">
        <KPIStat
          label="営業"
          value={formatCurrency(data.kpis.sales.monthlyRevenue)}
          helper={`商談 ${data.kpis.sales.dealsCount} 件 / 成約率 ${data.kpis.sales.winRate}%`}
        />
        <KPIStat
          label="案件"
          value={`${data.kpis.projects.activeProjectsCount} 件`}
          helper={`完了タスク ${data.kpis.projects.completedTasksCount} 件 / 遅延 ${data.kpis.projects.delayedProjectsCount} 件`}
        />
        <KPIStat
          label="財務"
          value={formatCurrency(data.kpis.finance.monthlyExpense)}
          helper={`承認待ち ${data.kpis.finance.pendingExpenseCount} 件`}
        />
        <KPIStat
          label="人事"
          value={`${data.kpis.hr.employeesCount} 名`}
          helper={`当月入社 ${data.kpis.hr.hiresThisMonth} 名`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Panel
          title="月次売上"
          description={`今月の目標 ${formatCurrency(data.revenueSummary?.target ?? 0)} / 実績 ${formatCurrency(
            data.revenueSummary?.amount ?? 0
          )}`}
        >
          <SalesChart data={data.salesChart} />
        </Panel>
        <Panel title="商談ステータス別件数">
          <div className="space-y-3">
            {data.dealStatuses.map((row) => (
              <div key={row.status} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <StatusBadge value={row.status} />
                <span className="font-medium text-slate-900">{row._count._all} 件</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="アクティビティ">
        <div className="space-y-3">
          {data.activityFeed.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <span className="text-sm text-slate-700">{item.label}</span>
              <span className="text-xs text-slate-500">{formatDate(item.createdAt)}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
