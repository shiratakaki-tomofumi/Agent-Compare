"use client";

import { useState } from "react";
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
import { Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DeleteButtonProps {
  onDelete: () => Promise<{ success?: boolean; error?: string }>;
  label?: string;
}

export function DeleteButton({ onDelete, label = "削除" }: DeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setLoading(true);
    try {
      const result = await onDelete();
      setLoading(false);
      if (result && result.error) {
        toast({
          variant: "destructive",
          title: "エラー",
          description: result.error,
        });
      } else {
        toast({ title: "削除しました" });
        setOpen(false);
      }
    } catch {
      // redirect() throws internally — this is expected behavior
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4" />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>削除の確認</DialogTitle>
          <DialogDescription>
            この操作は取り消せません。本当に削除しますか？
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            キャンセル
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            削除する
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
