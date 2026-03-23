import { requireRole } from "@/lib/auth";
import { getFinanceSummary } from "@/lib/actions/expenses";
import { FinanceSummaryView } from "@/components/finance/finance-summary-view";
import { Role } from "@prisma/client";

interface PageProps {
  searchParams: { year?: string; month?: string };
}

export default async function FinanceSummaryPage({ searchParams }: PageProps) {
  await requireRole([Role.MANAGER, Role.ADMIN]);
  const now = new Date();
  const year = Number(searchParams.year ?? now.getFullYear());
  const month = Number(searchParams.month ?? now.getMonth() + 1);
  const data = await getFinanceSummary(year, month);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">収支サマリー</h1>
      <FinanceSummaryView data={data} year={year} month={month} />
    </div>
  );
}
