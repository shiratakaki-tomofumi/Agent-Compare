import { getServerSession } from "next-auth/next";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prismadb";
import AppShell from "@/components/AppShell";

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);
  if (!session) return <p>ログインしてください</p>;

  const projects = await prisma.project.findMany({
    where: { isDeleted: false },
    include: { department: true, _count: { select: { tasks: true } } },
    orderBy: { updatedAt: "desc" },
  });

  const canEdit = ["MANAGER", "ADMIN"].includes(
    (session.user as any).role as string,
  );

  return (
    <AppShell>
      <div>
        <div className="mb-4 flex items-center justify-between gap-2">
          <h1 className="text-2xl font-bold">案件一覧</h1>
          {canEdit && (
            <Link
              href="/projects/new"
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
            >
              + 新規
            </Link>
          )}
        </div>

        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-100 text-zinc-700">
              <tr>
                <th className="px-3 py-2">案件名</th>
                <th className="px-3 py-2">部署</th>
                <th className="px-3 py-2">ステータス</th>
                <th className="px-3 py-2">進捗</th>
                <th className="px-3 py-2">開始日</th>
                <th className="px-3 py-2">終了予定日</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(async (project) => {
                const doneTasks = await prisma.task.count({
                  where: { projectId: project.id, status: "DONE" },
                });
                const totalTasks = project._count.tasks;
                const progress =
                  totalTasks > 0
                    ? Math.round((doneTasks / totalTasks) * 100)
                    : 0;

                return (
                  <tr
                    key={project.id}
                    className="border-t border-zinc-100 hover:bg-zinc-50"
                  >
                    <td className="px-3 py-2">
                      <Link
                        href={`/projects/${project.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {project.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{project.department.name}</td>
                    <td className="px-3 py-2">{project.status}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-zinc-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs">{progress}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      {project.startDate.toISOString().slice(0, 10)}
                    </td>
                    <td className="px-3 py-2">
                      {project.endDate.toISOString().slice(0, 10)}
                    </td>
                  </tr>
                );
              })}
              {projects.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-3 text-center text-zinc-500"
                  >
                    データがありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
