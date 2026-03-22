import { ExpenseForm } from "@/components/forms";
import { upsertExpenseAction } from "@/lib/actions";
import { requireSession } from "@/lib/auth";

export default async function NewExpensePage() {
  await requireSession();
  return <ExpenseForm action={(payload) => upsertExpenseAction(null, payload)} />;
}
