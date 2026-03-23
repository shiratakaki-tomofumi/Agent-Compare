"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  expenseId: string;
}

export function ApprovalActions({ expenseId }: Props) {
  const router = useRouter();
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!action) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/finance/expenses/${expenseId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, comment: comment || undefined }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "処理に失敗しました");
      }

      toast.success(action === "approve" ? "承認しました" : "却下しました");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "処理に失敗しました");
    } finally {
      setSubmitting(false);
      setAction(null);
      setComment("");
    }
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setAction("approve")}
          className="text-green-600 hover:text-green-700"
        >
          <Check className="size-4" />
          承認
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setAction("reject")}
          className="text-destructive"
        >
          <X className="size-4" />
          却下
        </Button>
      </div>

      <Dialog
        open={!!action}
        onOpenChange={(open) => {
          if (!open) {
            setAction(null);
            setComment("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === "approve" ? "経費申請の承認" : "経費申請の却下"}
            </DialogTitle>
            <DialogDescription>
              {action === "approve"
                ? "この経費申請を承認します。"
                : "この経費申請を却下します。"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="comment">コメント（任意）</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="コメントを入力..."
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAction(null);
                setComment("");
              }}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              variant={action === "reject" ? "destructive" : "default"}
            >
              {submitting
                ? "処理中..."
                : action === "approve"
                ? "承認する"
                : "却下する"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
