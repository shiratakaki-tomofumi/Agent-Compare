import Link from "next/link";

import { DataTable, EmptyState, MutationButton, PageHeader, Pagination, SearchToolbar, StatusBadge } from "@/components/ui";
import { EXPENSE_STATUS_LABELS } from "@/lib/constants";
import { deleteExpenseAction } from "@/lib/actions";
import { requireSession } from "@/lib/auth";
import { canManage } from "@/lib/permissions";
import { getExpenseList } from "@/lib/queries";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function ExpensesPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const session = await requireSession();
  const data = await getExpenseList(
    {
      page: typeof searchParams.page === "string" ? searchParams.page : undefined,
      query: typeof searchParams.query === "string" ? searchParams.query : undefined,
      status: typeof searchParams.status === "string" ? searchParams.status : undefined,
      scope: typeof searchParams.scope === "string" ? searchParams.scope : undefined
    },
    { id: session.user.id, role: session.user.role }
  );

  return (
    <div className="space-y-8">
      <PageHeader title="経費申請一覧" description="自分の申請、または管理者は全体の申請を確認できます。" />
      <SearchToolbar
        searchPlaceholder="説明で検索"
        statusOptions={Object.entries(EXPENSE_STATUS_LABELS).map(([value, label]) => ({ value, label }))}
        createHref="/finance/expenses/new"
        createLabel="新規申請"
      >
        {canManage(session.user.role) ? (
          <select
            name="scope"
            defaultValue={data.scope}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
          >
            <option value="mine">自分のみ</option>
            <option value="all">全体</option>
          </select>
        ) : null}
      </SearchToolbar>
      {data.items.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <DataTable headers={["申請者", "説明", "金額", "日付", "ステータス", "操作"]}>
            {data.items.map((expense) => (
              <tr key={expense.id}>
                <td className="px-4 py-4 text-slate-600">{expense.applicant.name}</td>
                <td className="px-4 py-4 font-medium text-slate-900">{expense.description}</td>
                <td className="px-4 py-4 text-slate-600">{formatCurrency(expense.amount)}</td>
                <td className="px-4 py-4 text-slate-600">{formatDate(expense.expenseDate)}</td>
                <td className="px-4 py-4">
                  <StatusBadge value={expense.status} />
                </td>
                <td className="px-4 py-4">
                  {expense.applicantId === session.user.id && expense.status === "PENDING" ? (
                    <div className="flex gap-2">
                      <Link href={`/finance/expenses/${expense.id}/edit`} className="rounded-full border border-slate-300 px-4 py-2 text-sm">
                        編集
                      </Link>
                      <MutationButton
                        label="削除"
                        variant="danger"
                        confirmMessage="この申請を削除しますか？"
                        action={() => deleteExpenseAction(expense.id)}
                      />
                    </div>
                  ) : (
                    <span className="text-sm text-slate-400">-</span>
                  )}
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
