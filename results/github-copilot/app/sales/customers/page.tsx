import { getServerSession } from "next-auth/next";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prismadb";
import AppShell from "@/components/AppShell";

type Props = {
  searchParams?: { status?: string; q?: string };
};

export default async function CustomersPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return <p>ログインしてください</p>;
  }

  const statusFilter = searchParams?.status as "ACTIVE" | "DORMANT" | undefined;
  const query = searchParams?.q || "";

  const customers = await prisma.customer.findMany({
    where: {
      isDeleted: false,
      status: statusFilter,
      OR: [
        { companyName: { contains: query, mode: "insensitive" } },
        { contactName: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { updatedAt: "desc" },
  });

  const canEdit = ["MANAGER", "ADMIN"].includes(
    (session.user as any).role as string,
  );

  return (
    <AppShell>
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-bold">顧客一覧</h1>
          {canEdit && (
            <Link
              href="/sales/customers/new"
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
            >
              + 新規登録
            </Link>
          )}
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <form className="flex w-full max-w-md gap-2" action="">
            <input
              name="q"
              defaultValue={query}
              placeholder="顧客名/担当者名で検索"
              className="w-full rounded-md border border-zinc-300 px-2 py-1"
            />
            <select
              name="status"
              defaultValue={statusFilter ?? ""}
              className="rounded-md border border-zinc-300 px-2 py-1"
            >
              <option value="">すべて</option>
              <option value="ACTIVE">Active</option>
              <option value="DORMANT">Dormant</option>
            </select>
            <button
              type="submit"
              className="rounded-md bg-blue-500 px-3 py-1 text-white"
            >
              検索
            </button>
          </form>
        </div>

        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-100 text-zinc-700">
              <tr>
                <th className="px-3 py-2">会社名</th>
                <th className="px-3 py-2">担当者</th>
                <th className="px-3 py-2">メール</th>
                <th className="px-3 py-2">電話</th>
                <th className="px-3 py-2">ステータス</th>
                <th className="px-3 py-2">更新日</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-t border-zinc-100 hover:bg-zinc-50"
                >
                  <td className="px-3 py-2">
                    <Link
                      href={`/sales/customers/${customer.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {customer.companyName}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{customer.contactName}</td>
                  <td className="px-3 py-2">{customer.email}</td>
                  <td className="px-3 py-2">{customer.phone || "-"}</td>
                  <td className="px-3 py-2">{customer.status}</td>
                  <td className="px-3 py-2">
                    {customer.updatedAt.toISOString().slice(0, 10)}
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
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
