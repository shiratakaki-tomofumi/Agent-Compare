import { requireAuth } from "@/lib/auth";
import { createExpense } from "@/lib/actions/expenses";
import { ExpenseForm } from "@/components/finance/expense-form";

export default async function NewExpensePage() {
  await requireAuth();
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">経費申請</h1>
      <ExpenseForm
        defaultValues={{ expenseDate: today }}
        action={createExpense}
        submitLabel="申請する"
      />
    </div>
  );
}
