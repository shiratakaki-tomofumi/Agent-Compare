import { getServerSession } from "next-auth/next";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prismadb";
import AppShell from "@/components/AppShell";

type Props = { searchParams?: { status?: string; q?: string } };

export default async function DealsPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) return <p>ログインしてください</p>;

  const statusFilter = searchParams?.status;
  const query = searchParams?.q || "";

  const deals = await prisma.deal.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { note: { contains: query, mode: "insensitive" } },
      ],
      status: statusFilter as any,
    },
    include: { customer: true, assignee: true },
    orderBy: { updatedAt: "desc" },
  });

  const canEdit = ["MANAGER", "ADMIN"].includes(
    (session.user as any).role as string,
  );

  return (
    <AppShell>
      <div>
        <div className="mb-4 flex items-center justify-between gap-2">
          <h1 className="text-2xl font-bold">商談一覧</h1>
          {canEdit && (
            <Link
              href="/sales/deals/new"
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
            >
              + 新規
            </Link>
          )}
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          <form className="flex w-full max-w-lg gap-2" action="">
            <input
              name="q"
              defaultValue={query}
              placeholder="商談名/メモで検索"
              className="w-full rounded-md border border-zinc-300 px-2 py-1"
            />
            <select
              name="status"
              defaultValue={statusFilter ?? ""}
              className="rounded-md border border-zinc-300 px-2 py-1"
            >
              <option value="">すべて</option>
              <option value="LEAD">LEAD</option>
              <option value="PROPOSAL">PROPOSAL</option>
              <option value="NEGOTIATION">NEGOTIATION</option>
              <option value="WON">WON</option>
              <option value="LOST">LOST</option>
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
                <th className="px-3 py-2">商談名</th>
                <th className="px-3 py-2">顧客</th>
                <th className="px-3 py-2">担当者</th>
                <th className="px-3 py-2">金額</th>
                <th className="px-3 py-2">ステータス</th>
                <th className="px-3 py-2">進捗</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((deal) => (
                <tr
                  key={deal.id}
                  className="border-t border-zinc-100 hover:bg-zinc-50"
                >
                  <td className="px-3 py-2">
                    <Link
                      href={`/sales/deals/${deal.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {deal.title}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{deal.customer.companyName}</td>
                  <td className="px-3 py-2">{deal.assignee?.name}</td>
                  <td className="px-3 py-2">¥{deal.amount.toLocaleString()}</td>
                  <td className="px-3 py-2">{deal.status}</td>
                  <td className="px-3 py-2">{deal.probability}%</td>
                </tr>
              ))}
              {deals.length === 0 && (
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
