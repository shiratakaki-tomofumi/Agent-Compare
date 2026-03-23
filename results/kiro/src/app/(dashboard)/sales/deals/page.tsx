import Link from "next/link";
import { getDeals } from "@/lib/actions/deals";
import { getSession } from "@/lib/auth";
import { SearchFilter } from "@/components/shared/search-filter";
import { Pagination } from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { DEAL_STATUS_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { Role } from "@prisma/client";

interface PageProps {
  searchParams: { page?: string; search?: string; status?: string };
}

const statusVariant: Record<
  string,
  | "default"
  | "success"
  | "destructive"
  | "warning"
  | "info"
  | "secondary"
  | "outline"
> = {
  LEAD: "secondary",
  PROPOSAL: "info",
  NEGOTIATION: "warning",
  WON: "success",
  LOST: "destructive",
};

export default async function DealsPage({ searchParams }: PageProps) {
  const session = await getSession();
  const page = Number(searchParams.page ?? 1);
  const { deals, totalPages } = await getDeals(
    page,
    searchParams.search ?? "",
    searchParams.status ?? "",
  );
  const canEdit =
    session &&
    ([Role.MANAGER, Role.ADMIN] as Role[]).includes(session.user.role as Role);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">商談管理</h1>
        {canEdit && (
          <Button asChild size="sm">
            <Link href="/sales/deals/new">
              <Plus className="h-4 w-4" />
              新規商談
            </Link>
          </Button>
        )}
      </div>

      <SearchFilter
        searchPlaceholder="商談名で検索"
        filterOptions={Object.entries(DEAL_STATUS_LABELS).map(
          ([value, label]) => ({ value, label }),
        )}
      />

      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">商談名</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
                顧客
              </th>
              <th className="text-left px-4 py-3 font-medium">金額</th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">
                確度
              </th>
              <th className="text-left px-4 py-3 font-medium">ステータス</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
                担当者
              </th>
            </tr>
          </thead>
          <tbody>
            {deals.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  データがありません
                </td>
              </tr>
            ) : (
              deals.map((d) => (
                <tr key={d.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link
                      href={`/sales/deals/${d.id}`}
                      className="font-medium hover:underline"
                    >
                      {d.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                    {d.customer.companyName}
                  </td>
                  <td className="px-4 py-3">{formatCurrency(d.amount)}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {d.probability}%
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[d.status] ?? "outline"}>
                      {DEAL_STATUS_LABELS[d.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                    {d.assignee.name}
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
