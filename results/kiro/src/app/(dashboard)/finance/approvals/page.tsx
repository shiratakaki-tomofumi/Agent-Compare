import { requireRole } from "@/lib/auth";
import { getPendingExpenses } from "@/lib/actions/expenses";
import { ApprovalList } from "@/components/finance/approval-list";
import { Role } from "@prisma/client";

export default async function ApprovalsPage() {
  await requireRole([Role.MANAGER, Role.ADMIN]);
  const expenses = await getPendingExpenses();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">経費承認</h1>
      <ApprovalList expenses={expenses} />
    </div>
  );
}
