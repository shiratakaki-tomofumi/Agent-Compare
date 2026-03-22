import Link from "next/link";

import { DataTable, EmptyState, PageHeader, Pagination, ProgressBar, SearchToolbar, StatusBadge } from "@/components/ui";
import { PROJECT_STATUS_LABELS } from "@/lib/constants";
import { getSession } from "@/lib/auth";
import { canManage } from "@/lib/permissions";
import { getProjectList } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export default async function ProjectsPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const session = await getSession();
  const data = await getProjectList({
    page: typeof searchParams.page === "string" ? searchParams.page : undefined,
    query: typeof searchParams.query === "string" ? searchParams.query : undefined,
    status: typeof searchParams.status === "string" ? searchParams.status : undefined
  });

  return (
    <div className="space-y-8">
      <PageHeader title="案件一覧" description="案件ごとの進捗率と担当部署を確認します。" />
      <SearchToolbar
        searchPlaceholder="案件名・説明で検索"
        statusOptions={Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => ({ value, label }))}
        createHref={session?.user && canManage(session.user.role) ? "/projects/new" : undefined}
        createLabel="新規案件"
      />
      {data.items.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <DataTable headers={["案件名", "部署", "ステータス", "進捗", "期間"]}>
            {data.items.map((project) => (
              <tr key={project.id} className="hover:bg-slate-50">
                <td className="px-4 py-4">
                  <Link href={`/projects/${project.id}`} className="font-medium text-slate-900">
                    {project.name}
                  </Link>
                </td>
                <td className="px-4 py-4 text-slate-600">{project.department.name}</td>
                <td className="px-4 py-4">
                  <StatusBadge value={project.status} />
                </td>
                <td className="min-w-56 px-4 py-4">
                  <ProgressBar value={project.progress} />
                </td>
                <td className="px-4 py-4 text-slate-600">
                  {formatDate(project.startDate)} - {formatDate(project.endDate)}
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
