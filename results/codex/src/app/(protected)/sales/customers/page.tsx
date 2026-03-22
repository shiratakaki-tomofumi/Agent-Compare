import Link from "next/link";

import { PageHeader, DataTable, EmptyState, Pagination, SearchToolbar, StatusBadge } from "@/components/ui";
import { CUSTOMER_STATUS_LABELS } from "@/lib/constants";
import { getSession } from "@/lib/auth";
import { canManage } from "@/lib/permissions";
import { getCustomerList } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export default async function CustomersPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const session = await getSession();
  const data = await getCustomerList({
    page: typeof searchParams.page === "string" ? searchParams.page : undefined,
    query: typeof searchParams.query === "string" ? searchParams.query : undefined,
    status: typeof searchParams.status === "string" ? searchParams.status : undefined
  });

  return (
    <div className="space-y-8">
      <PageHeader title="顧客一覧" description="顧客情報の検索、詳細確認、編集を行います。" />
      <SearchToolbar
        searchPlaceholder="会社名・担当者・メールで検索"
        statusOptions={Object.entries(CUSTOMER_STATUS_LABELS).map(([value, label]) => ({ value, label }))}
        createHref={session?.user && canManage(session.user.role) ? "/sales/customers/new" : undefined}
        createLabel="新規顧客"
      />
      {data.items.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <DataTable headers={["会社名", "担当者", "ステータス", "商談数", "作成日"]}>
            {data.items.map((customer) => (
              <tr key={customer.id} className="hover:bg-slate-50">
                <td className="px-4 py-4">
                  <Link href={`/sales/customers/${customer.id}`} className="font-medium text-slate-900">
                    {customer.companyName}
                  </Link>
                </td>
                <td className="px-4 py-4 text-slate-600">{customer.contactName}</td>
                <td className="px-4 py-4">
                  <StatusBadge value={customer.status} />
                </td>
                <td className="px-4 py-4 text-slate-600">{customer._count.deals}</td>
                <td className="px-4 py-4 text-slate-600">{formatDate(customer.createdAt)}</td>
              </tr>
            ))}
          </DataTable>
          <Pagination page={data.page} totalPages={data.totalPages} />
        </>
      )}
    </div>
  );
}
