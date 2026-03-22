import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ExpenseForm } from "@/components/finance/expense-form";

export default async function NewExpensePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">新規経費申請</h1>
      <ExpenseForm />
    </div>
  );
}
