import { notFound, redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateExpense } from "@/lib/actions/expenses";
import { ExpenseForm } from "@/components/finance/expense-form";
import { ExpenseStatus } from "@prisma/client";

interface PageProps {
  params: { id: string };
}

export default async function EditExpensePage({ params }: PageProps) {
  const session = await requireAuth();
  const expense = await prisma.expense.findUnique({ where: { id: params.id } });

  if (!expense) notFound();
  // Only the applicant can edit, and only if pending
  if (expense.applicantId !== session.user.id) redirect("/finance/expenses");
  if (expense.status !== ExpenseStatus.PENDING) redirect("/finance/expenses");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">経費申請編集</h1>
      <ExpenseForm
        defaultValues={{
          amount: expense.amount,
          category: expense.category,
          description: expense.description,
          expenseDate: new Date(expense.expenseDate)
            .toISOString()
            .split("T")[0],
        }}
        action={(fd) => updateExpense(params.id, fd)}
        submitLabel="更新する"
      />
    </div>
  );
}
