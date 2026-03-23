"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { approveExpense, rejectExpense } from "@/lib/actions/expenses";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { ExpenseCategory } from "@prisma/client";

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  expenseDate: Date;
  applicant: { name: string };
}

interface ApprovalListProps {
  expenses: Expense[];
}

export function ApprovalList({ expenses }: ApprovalListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    type: "approve" | "reject";
    expenseId: string;
  } | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    if (!dialogState) return;
    setLoading(true);
    const result =
      dialogState.type === "approve"
        ? await approveExpense(dialogState.expenseId, comment)
        : await rejectExpense(dialogState.expenseId, comment);
    setLoading(false);
    if (result.error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: result.error,
      });
    } else {
      toast({
        title: dialogState.type === "approve" ? "承認しました" : "却下しました",
      });
      setDialogState(null);
      setComment("");
      router.refresh();
    }
  };

  if (expenses.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        承認待ちの経費申請はありません
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">説明</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
                申請者
              </th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
                カテゴリ
              </th>
              <th className="text-left px-4 py-3 font-medium">金額</th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">
                申請日
              </th>
              <th className="px-4 py-3 font-medium text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e.id} className="border-t hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{e.description}</td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                  {e.applicant.name}
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                  {EXPENSE_CATEGORY_LABELS[e.category]}
                </td>
                <td className="px-4 py-3 font-medium">
                  {formatCurrency(e.amount)}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                  {formatDate(e.expenseDate)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 border-green-200 hover:bg-green-50"
                      onClick={() => {
                        setDialogState({
                          open: true,
                          type: "approve",
                          expenseId: e.id,
                        });
                        setComment("");
                      }}
                    >
                      <CheckCircle className="h-4 w-4" />
                      承認
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive border-destructive/20 hover:bg-destructive/10"
                      onClick={() => {
                        setDialogState({
                          open: true,
                          type: "reject",
                          expenseId: e.id,
                        });
                        setComment("");
                      }}
                    >
                      <XCircle className="h-4 w-4" />
                      却下
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog
        open={!!dialogState?.open}
        onOpenChange={(isOpen) => {
          if (!isOpen) setDialogState(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogState?.type === "approve" ? "経費を承認" : "経費を却下"}
            </DialogTitle>
            <DialogDescription>
              {dialogState?.type === "reject"
                ? "却下理由を入力してください（必須）"
                : "コメントを入力してください（任意）"}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder={
              dialogState?.type === "reject"
                ? "却下理由を入力..."
                : "コメントを入力（任意）"
            }
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogState(null)}>
              キャンセル
            </Button>
            <Button
              variant={
                dialogState?.type === "approve" ? "default" : "destructive"
              }
              onClick={handleAction}
              disabled={loading}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {dialogState?.type === "approve" ? "承認する" : "却下する"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
