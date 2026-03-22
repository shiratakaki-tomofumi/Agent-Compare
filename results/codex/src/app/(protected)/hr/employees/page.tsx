import Link from "next/link";

import { DataTable, EmptyState, PageHeader, Pagination, SearchToolbar, StatusBadge } from "@/components/ui";
import { getSession } from "@/lib/auth";
import { canAdmin, canManage } from "@/lib/permissions";
import { getEmployeeList } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export default async function EmployeesPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const session = await getSession();
  const data = await getEmployeeList({
    page: typeof searchParams.page === "string" ? searchParams.page : undefined,
    query: typeof searchParams.query === "string" ? searchParams.query : undefined
  });

  return (
    <div className="space-y-8">
      <PageHeader title="従業員一覧" description="従業員の一覧、検索、詳細確認を行います。" />
      <SearchToolbar
        searchPlaceholder="氏名・メール・役職で検索"
        createHref={session?.user && canAdmin(session.user.role) ? "/hr/employees/new" : undefined}
        createLabel="新規従業員"
      />
      {data.items.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <DataTable headers={["氏名", "部署", "役職", "ロール", "入社日"]}>
            {data.items.map((employee) => (
              <tr key={employee.id}>
                <td className="px-4 py-4">
                  {session?.user && canManage(session.user.role) ? (
                    <Link href={`/hr/employees/${employee.id}`} className="font-medium text-slate-900">
                      {employee.name}
                    </Link>
                  ) : (
                    <span className="font-medium text-slate-900">{employee.name}</span>
                  )}
                </td>
                <td className="px-4 py-4 text-slate-600">{employee.department?.name ?? "-"}</td>
                <td className="px-4 py-4 text-slate-600">{employee.position ?? "-"}</td>
                <td className="px-4 py-4">
                  <StatusBadge value={employee.role} />
                </td>
                <td className="px-4 py-4 text-slate-600">{formatDate(employee.hireDate)}</td>
              </tr>
            ))}
          </DataTable>
          <Pagination page={data.page} totalPages={data.totalPages} />
        </>
      )}
    </div>
  );
}
