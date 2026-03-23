import Link from "next/link";
import { getProjects } from "@/lib/actions/projects";
import { getSession } from "@/lib/auth";
import { SearchFilter } from "@/components/shared/search-filter";
import { Pagination } from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { PROJECT_STATUS_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { Role } from "@prisma/client";

type ProjectRow = Awaited<ReturnType<typeof getProjects>>["projects"][number];

interface PageProps {
  searchParams: { page?: string; search?: string; status?: string };
}

const statusVariant: Record<
  string,
  "default" | "success" | "warning" | "secondary" | "outline"
> = {
  PLANNING: "secondary",
  IN_PROGRESS: "info" as "default",
  COMPLETED: "success",
  ON_HOLD: "warning",
};

export default async function ProjectsPage({ searchParams }: PageProps) {
  const session = await getSession();
  const page = Number(searchParams.page ?? 1);
  const { projects, totalPages } = await getProjects(
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
        <h1 className="text-2xl font-bold">案件管理</h1>
        {canEdit && (
          <Button asChild size="sm">
            <Link href="/projects/new">
              <Plus className="h-4 w-4" />
              新規案件
            </Link>
          </Button>
        )}
      </div>

      <SearchFilter
        searchPlaceholder="案件名で検索"
        filterOptions={Object.entries(PROJECT_STATUS_LABELS).map(
          ([value, label]) => ({ value, label }),
        )}
      />

      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">案件名</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
                部署
              </th>
              <th className="text-left px-4 py-3 font-medium">ステータス</th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">
                終了予定日
              </th>
              <th className="text-left px-4 py-3 font-medium">進捗</th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  データがありません
                </td>
              </tr>
            ) : (
              projects.map((p: ProjectRow) => {
                const done = p.tasks.filter(
                  (t: { status: string }) => t.status === "DONE",
                ).length;
                const total = p.tasks.length;
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                return (
                  <tr key={p.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Link
                        href={`/projects/${p.id}`}
                        className="font-medium hover:underline"
                      >
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                      {p.department.name}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant[p.status] ?? "outline"}>
                        {PROJECT_STATUS_LABELS[p.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                      {formatDate(p.endDate)}
                    </td>
                    <td className="px-4 py-3 min-w-[120px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-8 text-right">
                          {pct}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} />
    </div>
  );
}
