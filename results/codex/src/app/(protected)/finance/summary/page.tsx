import { ExpenseBreakdownChart } from "@/components/charts";
import { DataTable, EmptyState, KPIStat, PageHeader, Panel } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { getFinanceSummary } from "@/lib/queries";
import { formatCurrency } from "@/lib/utils";

export default async function FinanceSummaryPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  await requireRole("MANAGER");
  const data = await getFinanceSummary({
    month: typeof searchParams.month === "string" ? searchParams.month : undefined
  });

  return (
    <div className="space-y-8">
      <PageHeader title="収支サマリー" description="月次の収入、支出、差額、部門別予算実績を確認します。" />
      <form className="flex justify-end">
        <input
          type="month"
          name="month"
          defaultValue={data.selectedMonth}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
        />
        <button type="submit" className="ml-3 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white">
          表示
        </button>
      </form>

      <div className="grid gap-4 xl:grid-cols-3">
        <KPIStat label="収入" value={formatCurrency(data.cards.income)} />
        <KPIStat label="支出" value={formatCurrency(data.cards.expense)} />
        <KPIStat label="差額" value={formatCurrency(data.cards.balance)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title="部門別 予算 vs 実績">
          {data.budgetRows.length === 0 ? (
            <EmptyState title="予算データがありません" />
          ) : (
            <DataTable headers={["部署", "予算", "実績", "差額"]}>
              {data.budgetRows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-4 font-medium text-slate-900">{row.departmentName}</td>
                  <td className="px-4 py-4 text-slate-600">{formatCurrency(row.budget)}</td>
                  <td className="px-4 py-4 text-slate-600">{formatCurrency(row.actual)}</td>
                  <td className="px-4 py-4 text-slate-600">{formatCurrency(row.budget - row.actual)}</td>
                </tr>
              ))}
            </DataTable>
          )}
        </Panel>
        <Panel title="カテゴリ別支出">
          <ExpenseBreakdownChart data={data.categoryBreakdown} />
        </Panel>
      </div>
    </div>
  );
}
