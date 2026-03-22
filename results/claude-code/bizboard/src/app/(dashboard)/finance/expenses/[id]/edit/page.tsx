import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { format } from "date-fns";
import { ExpenseForm } from "@/components/finance/expense-form";
import type { ExpenseInput } from "@/lib/validations";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditExpensePage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const { id } = await params;

  const expense = await prisma.expense.findUnique({
    where: { id },
  });

  if (!expense) {
    notFound();
  }

  // Only the applicant can edit, and only PENDING expenses
  if (expense.applicantId !== session.user.id) {
    redirect("/finance/expenses");
  }

  if (expense.status !== "PENDING") {
    redirect("/finance/expenses");
  }

  const defaultValues: ExpenseInput = {
    amount: expense.amount,
    category: expense.category,
    description: expense.description,
    expenseDate: format(expense.expenseDate, "yyyy-MM-dd"),
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">経費申請編集</h1>
      <ExpenseForm defaultValues={defaultValues} expenseId={expense.id} />
    </div>
  );
}
