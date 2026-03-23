"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/shared/delete-button";
import { deleteExpense } from "@/lib/actions/expenses";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";

interface ExpenseRowActionsProps {
  expenseId: string;
}

export function ExpenseRowActions({ expenseId }: ExpenseRowActionsProps) {
  const router = useRouter();
  return (
    <div className="flex gap-1 justify-end">
      <Button asChild variant="ghost" size="icon">
        <Link href={`/finance/expenses/${expenseId}/edit`}>
          <Pencil className="h-3.5 w-3.5" />
        </Link>
      </Button>
      <DeleteButton
        label=""
        onDelete={async () => {
          const result = await deleteExpense(expenseId);
          if (result.success) router.refresh();
          return result;
        }}
      />
    </div>
  );
}
