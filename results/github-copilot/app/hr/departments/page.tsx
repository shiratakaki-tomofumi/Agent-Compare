import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prismadb";
import AppShell from "@/components/AppShell";

export default async function DepartmentsPage() {
  const session = await getServerSession(authOptions);
  if (!session) return <p>ログインしてください</p>;

  const role = (session.user as any).role;
  const canEdit = ["MANAGER", "ADMIN"].includes(role);

  const departments = await prisma.department.findMany({
    include: { _count: { select: { users: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <AppShell>
      <div>
        <div className="mb-4 flex items-center justify-between gap-2">
          <h1 className="text-2xl font-bold">部署管理</h1>
          {canEdit && (
            <button className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700">
              + 新規部署
            </button>
          )}
        </div>

        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-100 text-zinc-700">
              <tr>
                <th className="px-3 py-2">部署名</th>
                <th className="px-3 py-2">説明</th>
                <th className="px-3 py-2">所属人数</th>
                {canEdit && <th className="px-3 py-2">操作</th>}
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr
                  key={dept.id}
                  className="border-t border-zinc-100 hover:bg-zinc-50"
                >
                  <td className="px-3 py-2">{dept.name}</td>
                  <td className="px-3 py-2">{dept.description || "-"}</td>
                  <td className="px-3 py-2">{dept._count.users}</td>
                  {canEdit && (
                    <td className="px-3 py-2">
                      <button className="text-blue-600 hover:underline">
                        編集
                      </button>
                      <button className="ml-2 text-red-600 hover:underline">
                        削除
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {departments.length === 0 && (
                <tr>
                  <td
                    colSpan={canEdit ? 4 : 3}
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
