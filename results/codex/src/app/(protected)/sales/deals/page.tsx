import Link from "next/link";

import { PageHeader, DataTable, EmptyState, Pagination, SearchToolbar, StatusBadge } from "@/components/ui";
import { DEAL_STATUS_LABELS } from "@/lib/constants";
import { getSession } from "@/lib/auth";
import { canManage } from "@/lib/permissions";
import { getDealList } from "@/lib/queries";
import { formatCurrency } from "@/lib/utils";

export default async function DealsPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const session = await getSession();
  const data = await getDealList({
    page: typeof searchParams.page === "string" ? searchParams.page : undefined,
    query: typeof searchParams.query === "string" ? searchParams.query : undefined,
    status: typeof searchParams.status === "string" ? searchParams.status : undefined
  });

  return (
    <div className="space-y-8">
      <PageHeader title="商談一覧" description="商談の進捗、金額、担当者を管理します。" />
      <SearchToolbar
        searchPlaceholder="商談名・顧客名で検索"
        statusOptions={Object.entries(DEAL_STATUS_LABELS).map(([value, label]) => ({ value, label }))}
        createHref={session?.user && canManage(session.user.role) ? "/sales/deals/new" : undefined}
        createLabel="新規商談"
      />
      {data.items.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <DataTable headers={["商談名", "顧客", "担当者", "金額", "確度", "ステータス"]}>
            {data.items.map((deal) => (
              <tr key={deal.id} className="hover:bg-slate-50">
                <td className="px-4 py-4">
                  <Link href={`/sales/deals/${deal.id}`} className="font-medium text-slate-900">
                    {deal.title}
                  </Link>
                </td>
                <td className="px-4 py-4 text-slate-600">{deal.customer.companyName}</td>
                <td className="px-4 py-4 text-slate-600">{deal.assignee.name}</td>
                <td className="px-4 py-4 text-slate-600">{formatCurrency(deal.amount)}</td>
                <td className="px-4 py-4 text-slate-600">{deal.probability}%</td>
                <td className="px-4 py-4">
                  <StatusBadge value={deal.status} />
                </td>
              </tr>
            ))}
          </DataTable>
          <Pagination page={data.page} totalPages={data.totalPages} />
        </>
      )}
    </div>
  );
}
