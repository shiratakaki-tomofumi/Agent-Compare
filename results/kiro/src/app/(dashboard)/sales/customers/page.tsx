import Link from "next/link";
import { getCustomers } from "@/lib/actions/customers";
import { getSession } from "@/lib/auth";
import { SearchFilter } from "@/components/shared/search-filter";
import { Pagination } from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { CUSTOMER_STATUS_LABELS } from "@/lib/constants";
import { Role } from "@prisma/client";

interface PageProps {
  searchParams: { page?: string; search?: string; status?: string };
}

export default async function CustomersPage({ searchParams }: PageProps) {
  const session = await getSession();
  const page = Number(searchParams.page ?? 1);
  const search = searchParams.search ?? "";
  const status = searchParams.status ?? "";
  const { customers, totalPages } = await getCustomers(page, search, status);
  const canEdit =
    session &&
    ([Role.MANAGER, Role.ADMIN] as Role[]).includes(session.user.role as Role);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">顧客管理</h1>
        {canEdit && (
          <Button asChild size="sm">
            <Link href="/sales/customers/new">
              <Plus className="h-4 w-4" />
              新規顧客
            </Link>
          </Button>
        )}
      </div>

      <SearchFilter
        searchPlaceholder="会社名・担当者名で検索"
        filterOptions={[
          { value: "ACTIVE", label: "取引中" },
          { value: "DORMANT", label: "休眠" },
        ]}
      />

      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">会社名</th>
              <th className="text-left px-4 py-3 font-medium">担当者</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
                メール
              </th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">
                電話
              </th>
              <th className="text-left px-4 py-3 font-medium">ステータス</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  データがありません
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr
                  key={c.id}
                  className="border-t hover:bg-muted/30 cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/sales/customers/${c.id}`}
                      className="font-medium hover:underline"
                    >
                      {c.companyName}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{c.contactName}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                    {c.email}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                    {c.phone ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={c.status === "ACTIVE" ? "success" : "secondary"}
                    >
                      {CUSTOMER_STATUS_LABELS[c.status]}
                    </Badge>
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
