import Link from "next/link";
import { getEmployees } from "@/lib/actions/employees";
import { getSession } from "@/lib/auth";
import { SearchFilter } from "@/components/shared/search-filter";
import { Pagination } from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { ROLE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { Role } from "@prisma/client";

interface PageProps {
  searchParams: { page?: string; search?: string };
}

export default async function EmployeesPage({ searchParams }: PageProps) {
  const session = await getSession();
  const page = Number(searchParams.page ?? 1);
  const { employees, totalPages } = await getEmployees(
    page,
    searchParams.search ?? "",
  );
  const isAdmin = session?.user.role === Role.ADMIN;
  const canViewDetail =
    session &&
    ([Role.MANAGER, Role.ADMIN] as Role[]).includes(session.user.role as Role);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">従業員管理</h1>
        {isAdmin && (
          <Button asChild size="sm">
            <Link href="/hr/employees/new">
              <Plus className="h-4 w-4" />
              従業員追加
            </Link>
          </Button>
        )}
      </div>

      <SearchFilter searchPlaceholder="氏名・メールで検索" />

      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">氏名</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
                メール
              </th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">
                部署
              </th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">
                役職
              </th>
              <th className="text-left px-4 py-3 font-medium">ロール</th>
              <th className="text-left px-4 py-3 font-medium hidden xl:table-cell">
                入社日
              </th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  データがありません
                </td>
              </tr>
            ) : (
              employees.map((e) => (
                <tr key={e.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">
                    {canViewDetail ? (
                      <Link
                        href={`/hr/employees/${e.id}`}
                        className="hover:underline"
                      >
                        {e.name}
                      </Link>
                    ) : (
                      e.name
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                    {e.email}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                    {e.department?.name ?? "-"}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                    {e.position ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        e.role === "ADMIN"
                          ? "default"
                          : e.role === "MANAGER"
                            ? "info"
                            : "secondary"
                      }
                    >
                      {ROLE_LABELS[e.role]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell text-muted-foreground">
                    {formatDate(e.hireDate)}
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
