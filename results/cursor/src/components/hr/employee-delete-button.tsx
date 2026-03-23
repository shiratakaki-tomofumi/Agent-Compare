"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface EmployeeDeleteButtonProps {
  employeeId: string;
  employeeName: string;
}

export function EmployeeDeleteButton({
  employeeId,
  employeeName,
}: EmployeeDeleteButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleDelete() {
    try {
      const res = await fetch(`/api/hr/employees/${employeeId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "削除に失敗しました");
        return;
      }

      toast.success("従業員を削除しました");
      setOpen(false);
      startTransition(() => {
        router.push("/hr/employees");
        router.refresh();
      });
    } catch {
      toast.error("削除に失敗しました");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="destructive">
            <Trash2 className="size-4" />
            削除
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>従業員の削除</DialogTitle>
          <DialogDescription>
            {employeeName} を削除してもよろしいですか？この操作は取り消せません。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            キャンセル
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? "削除中..." : "削除する"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
