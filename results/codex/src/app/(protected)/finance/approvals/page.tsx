import { ExpenseApprovalList } from "@/components/forms";
import { decideExpenseAction } from "@/lib/actions";
import { requireRole } from "@/lib/auth";
import { getApprovalList } from "@/lib/queries";
import { EmptyState, PageHeader } from "@/components/ui";

export default async function ApprovalsPage() {
  await requireRole("MANAGER");
  const items = await getApprovalList();

  return (
    <div className="space-y-8">
      <PageHeader title="承認待ち一覧" description="Manager/Admin が経費を承認または却下します。" />
      {items.length === 0 ? (
        <EmptyState title="承認待ちの経費はありません" />
      ) : (
        <ExpenseApprovalList
          items={items.map((item) => ({
            id: item.id,
            applicant: item.applicant,
            amount: item.amount,
            category: item.category,
            description: item.description,
            expenseDate: item.expenseDate
          }))}
          approve={(expenseId, comment) =>
            decideExpenseAction({
              expenseId,
              decision: "APPROVED",
              approverComment: comment
            })
          }
          reject={(expenseId, comment) =>
            decideExpenseAction({
              expenseId,
              decision: "REJECTED",
              approverComment: comment
            })
          }
        />
      )}
    </div>
  );
}
