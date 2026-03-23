import { getServerSession } from "next-auth/next";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prismadb";
import AppShell from "@/components/AppShell";

export default async function ExpensesPage() {
  const session = await getServerSession(authOptions);
  if (!session) return <p>ログインしてください</p>;

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  const where = role === "MEMBER" ? { applicantId: userId } : {};
  const expenses = await prisma.expense.findMany({
    where,
    include: { applicant: true, approver: true },
    orderBy: { updatedAt: "desc" },
  });

  const canCreate = true; // メンバー以上は作成可能
  const canApprove = ["MANAGER", "ADMIN"].includes(role);

  return (
    <AppShell>
      <div>
        <div className="mb-4 flex items-center justify-between gap-2">
          <h1 className="text-2xl font-bold">経費申請一覧</h1>
          {canCreate && (
            <Link
              href="/finance/expenses/new"
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
            >
              + 新規申請
            </Link>
          )}
          {canApprove && (
            <Link
              href="/finance/approvals"
              className="rounded-md bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700"
            >
              承認待ち
            </Link>
          )}
        </div>

        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-100 text-zinc-700">
              <tr>
                <th className="px-3 py-2">申請者</th>
                <th className="px-3 py-2">金額</th>
                <th className="px-3 py-2">カテゴリ</th>
                <th className="px-3 py-2">ステータス</th>
                <th className="px-3 py-2">申請日</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr
                  key={expense.id}
                  className="border-t border-zinc-100 hover:bg-zinc-50"
                >
                  <td className="px-3 py-2">
                    <Link
                      href={`/finance/expenses/${expense.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {expense.applicant.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    ¥{expense.amount.toLocaleString()}
                  </td>
                  <td className="px-3 py-2">{expense.category}</td>
                  <td className="px-3 py-2">{expense.status}</td>
                  <td className="px-3 py-2">
                    {expense.expenseDate.toISOString().slice(0, 10)}
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
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
