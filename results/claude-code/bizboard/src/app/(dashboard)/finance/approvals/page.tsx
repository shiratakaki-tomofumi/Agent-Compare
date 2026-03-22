import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { EXPENSE_STATUS_LABELS, EXPENSE_CATEGORY_LABELS } from "@/lib/constants";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ApprovalActions } from "@/components/finance/approval-actions";

export default async function ApprovalsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const role = session.user.role;
  if (role !== "MANAGER" && role !== "ADMIN") {
    redirect("/");
  }

  const pendingExpenses = await prisma.expense.findMany({
    where: { status: "PENDING" },
    include: {
      applicant: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">経費承認</h1>

      {pendingExpenses.length === 0 ? (
        <EmptyState message="承認待ちの経費申請はありません" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>申請者</TableHead>
              <TableHead>金額</TableHead>
              <TableHead>カテゴリ</TableHead>
              <TableHead>説明</TableHead>
              <TableHead>日付</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingExpenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>{expense.applicant.name}</TableCell>
                <TableCell className="font-medium">
                  ¥{expense.amount.toLocaleString("ja-JP")}
                </TableCell>
                <TableCell>
                  {EXPENSE_CATEGORY_LABELS[expense.category] ?? expense.category}
                </TableCell>
                <TableCell className="max-w-48 truncate">
                  {expense.description}
                </TableCell>
                <TableCell>
                  {format(expense.expenseDate, "yyyy/MM/dd")}
                </TableCell>
                <TableCell>
                  <StatusBadge
                    status={expense.status}
                    labels={EXPENSE_STATUS_LABELS}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <ApprovalActions expenseId={expense.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
