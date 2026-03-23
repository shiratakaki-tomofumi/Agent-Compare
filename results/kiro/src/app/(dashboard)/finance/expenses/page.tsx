import Link from "next/link";
import { getExpenses } from "@/lib/actions/expenses";
import { getSession } from "@/lib/auth";
import { SearchFilter } from "@/components/shared/search-filter";
import { Pagination } from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import {
  EXPENSE_STATUS_LABELS,
  EXPENSE_CATEGORY_LABELS,
} from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Role } from "@prisma/client";
import { ExpenseRowActions } from "@/components/finance/expense-row-actions";

interface PageProps {
  searchParams: {
    page?: string;
    search?: string;
    status?: string;
    all?: string;
  };
}

const statusVariant: Record<string, "warning" | "success" | "destructive"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "destructive",
};

export default async function ExpensesPage({ searchParams }: PageProps) {
  const session = await getSession();
  const page = Number(searchParams.page ?? 1);
  const isManagerOrAdmin =
    session &&
    ([Role.MANAGER, Role.ADMIN] as Role[]).includes(session.user.role as Role);
  const showAll = isManagerOrAdmin && searchParams.all === "1";
  const userId = showAll ? undefined : session?.user.id;

  const { expenses, totalPages } = await getExpenses(
    page,
    searchParams.search ?? "",
    searchParams.status ?? "",
    userId,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">経費申請</h1>
        <div className="flex gap-2">
          {isManagerOrAdmin && (
            <Button asChild variant="outline" size="sm">
              <Link
                href={showAll ? "/finance/expenses" : "/finance/expenses?all=1"}
              >
                {showAll ? "自分の申請のみ" : "全員の申請を表示"}
              </Link>
            </Button>
          )}
          <Button asChild size="sm">
            <Link href="/finance/expenses/new">
              <Plus className="h-4 w-4" />
              新規申請
            </Link>
          </Button>
        </div>
      </div>

      <SearchFilter
        searchPlaceholder="説明で検索"
        filterOptions={Object.entries(EXPENSE_STATUS_LABELS).map(
          ([value, label]) => ({ value, label }),
        )}
      />

      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">説明</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
                カテゴリ
              </th>
              <th className="text-left px-4 py-3 font-medium">金額</th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">
                申請日
              </th>
              {showAll && (
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
                  申請者
                </th>
              )}
              <th className="text-left px-4 py-3 font-medium">ステータス</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  データがありません
                </td>
              </tr>
            ) : (
              expenses.map((e) => (
                <tr key={e.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{e.description}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                    {EXPENSE_CATEGORY_LABELS[e.category]}
                  </td>
                  <td className="px-4 py-3">{formatCurrency(e.amount)}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                    {formatDate(e.expenseDate)}
                  </td>
                  {showAll && (
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                      {e.applicant.name}
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[e.status] ?? "outline"}>
                      {EXPENSE_STATUS_LABELS[e.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {e.status === "PENDING" &&
                      e.applicantId === session?.user.id && (
                        <ExpenseRowActions expenseId={e.id} />
                      )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} />
    </div>
  );
}
