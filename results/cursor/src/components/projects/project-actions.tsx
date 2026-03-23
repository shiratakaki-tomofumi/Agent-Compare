"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  projectId: string;
}

export function ProjectActions({ projectId }: Props) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "削除に失敗しました");
      }
      toast.success("案件を削除しました");
      router.push("/projects");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "削除に失敗しました");
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => router.push(`/projects/${projectId}/edit`)}>
          <Pencil className="size-4" />
          編集
        </Button>
        <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
          <Trash2 className="size-4" />
          削除
        </Button>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>案件の削除</DialogTitle>
            <DialogDescription>
              この案件を削除してもよろしいですか？この操作は取り消せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              キャンセル
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "削除中..." : "削除する"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
