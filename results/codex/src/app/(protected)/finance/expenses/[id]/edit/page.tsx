import { redirect } from "next/navigation";

import { ExpenseForm } from "@/components/forms";
import { upsertExpenseAction } from "@/lib/actions";
import { requireSession } from "@/lib/auth";
import { getExpenseDetail } from "@/lib/queries";

export default async function EditExpensePage({ params }: { params: { id: string } }) {
  const session = await requireSession();
  const expense = await getExpenseDetail(params.id);
  if (!expense || expense.applicantId !== session.user.id || expense.status !== "PENDING") {
    redirect("/finance/expenses");
  }

  return (
    <ExpenseForm
      initialValues={{
        amount: expense.amount,
        category: expense.category,
        description: expense.description,
        expenseDate: expense.expenseDate
      }}
      action={(payload) => upsertExpenseAction(expense.id, payload)}
    />
  );
}
