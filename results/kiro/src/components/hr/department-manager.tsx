"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "@/lib/actions/employees";
import { Plus, Pencil, Trash2, Loader2, Users } from "lucide-react";

interface Department {
  id: string;
  name: string;
  description: string | null;
  _count: { users: number };
}

interface DepartmentManagerProps {
  departments: Department[];
}

type DialogMode = "create" | "edit";

export function DepartmentManager({ departments }: DepartmentManagerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<DialogMode>("create");
  const [editTarget, setEditTarget] = useState<Department | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const openCreate = () => {
    setMode("create");
    setName("");
    setDescription("");
    setEditTarget(null);
    setOpen(true);
  };

  const openEdit = (dept: Department) => {
    setMode("edit");
    setName(dept.name);
    setDescription(dept.description ?? "");
    setEditTarget(dept);
    setOpen(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const result =
      mode === "create"
        ? await createDepartment(name, description)
        : await updateDepartment(editTarget!.id, name, description);
    setLoading(false);
    if (result.error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: result.error,
      });
    } else {
      toast({ title: mode === "create" ? "作成しました" : "更新しました" });
      setOpen(false);
      router.refresh();
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deleteDepartment(id);
    if (result.error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: result.error,
      });
    } else {
      toast({ title: "削除しました" });
      router.refresh();
    }
  };

  return (
    <>
      <div className="flex justify-end">
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          部署追加
        </Button>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">部署名</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
                説明
              </th>
              <th className="text-left px-4 py-3 font-medium">所属人数</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {departments.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="text-center py-8 text-muted-foreground"
                >
                  データがありません
                </td>
              </tr>
            ) : (
              departments.map((d) => (
                <tr key={d.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{d.name}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                    {d.description ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      {d._count.users}名
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(d)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(d.id)}
                        disabled={d._count.users > 0}
                        title={
                          d._count.users > 0
                            ? "所属ユーザーがいるため削除できません"
                            : "削除"
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "部署追加" : "部署編集"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">
                部署名 <span className="text-destructive">*</span>
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: 営業部"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">説明</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="部署の説明（任意）"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleSubmit} disabled={loading || !name.trim()}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "create" ? "追加" : "更新"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
