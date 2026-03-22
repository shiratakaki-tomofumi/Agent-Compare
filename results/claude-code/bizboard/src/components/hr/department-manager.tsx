"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { departmentSchema, type DepartmentInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Building2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Department {
  id: string;
  name: string;
  description: string | null;
  _count: { users: number };
}

interface DepartmentManagerProps {
  initialDepartments: Department[];
}

export function DepartmentManager({ initialDepartments }: DepartmentManagerProps) {
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addForm = useForm<DepartmentInput>({
    resolver: zodResolver(departmentSchema),
    defaultValues: { name: "", description: "" },
  });

  const editForm = useForm<DepartmentInput>({
    resolver: zodResolver(departmentSchema),
  });

  async function handleAdd(data: DepartmentInput) {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/hr/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error || "部署の追加に失敗しました");
        return;
      }

      const json = await res.json();
      setDepartments((prev) => [...prev, json.data].sort((a, b) => a.name.localeCompare(b.name)));
      setAddOpen(false);
      addForm.reset();
      toast.success("部署を追加しました");
    } catch {
      toast.error("部署の追加に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  }

  function openEdit(dept: Department) {
    setSelectedDept(dept);
    editForm.reset({ name: dept.name, description: dept.description || "" });
    setEditOpen(true);
  }

  async function handleEdit(data: DepartmentInput) {
    if (!selectedDept) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/hr/departments/${selectedDept.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error || "部署の更新に失敗しました");
        return;
      }

      const json = await res.json();
      setDepartments((prev) =>
        prev
          .map((d) => (d.id === selectedDept.id ? json.data : d))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      setEditOpen(false);
      toast.success("部署を更新しました");
    } catch {
      toast.error("部署の更新に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  }

  function openDelete(dept: Department) {
    setSelectedDept(dept);
    setDeleteOpen(true);
  }

  async function handleDelete() {
    if (!selectedDept) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/hr/departments/${selectedDept.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error || "部署の削除に失敗しました");
        return;
      }

      setDepartments((prev) => prev.filter((d) => d.id !== selectedDept.id));
      setDeleteOpen(false);
      toast.success("部署を削除しました");
    } catch {
      toast.error("部署の削除に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Building2 className="size-5 text-muted-foreground" />
              <CardTitle>部署一覧 ({departments.length}件)</CardTitle>
            </div>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger
                render={
                  <Button>
                    <Plus className="size-4" />
                    新規追加
                  </Button>
                }
              />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>部署の追加</DialogTitle>
                  <DialogDescription>新しい部署を追加します</DialogDescription>
                </DialogHeader>
                <form onSubmit={addForm.handleSubmit(handleAdd)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="add-name">部署名 *</Label>
                    <Input id="add-name" {...addForm.register("name")} />
                    {addForm.formState.errors.name && (
                      <p className="text-sm text-destructive">
                        {addForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-description">説明</Label>
                    <Textarea id="add-description" {...addForm.register("description")} />
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => setAddOpen(false)}
                      disabled={isSubmitting}
                    >
                      キャンセル
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "追加中..." : "追加"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {departments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="size-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">部署が登録されていません</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>部署名</TableHead>
                  <TableHead>説明</TableHead>
                  <TableHead className="text-right">所属人数</TableHead>
                  <TableHead className="w-24">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell className="font-medium">{dept.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {dept.description || "-"}
                    </TableCell>
                    <TableCell className="text-right">{dept._count.users}名</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEdit(dept)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openDelete(dept)}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>部署の編集</DialogTitle>
            <DialogDescription>部署情報を編集します</DialogDescription>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(handleEdit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">部署名 *</Label>
              <Input id="edit-name" {...editForm.register("name")} />
              {editForm.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {editForm.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">説明</Label>
              <Textarea id="edit-description" {...editForm.register("description")} />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setEditOpen(false)}
                disabled={isSubmitting}
              >
                キャンセル
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "更新中..." : "更新"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>部署の削除</DialogTitle>
            <DialogDescription>
              {selectedDept?.name} を削除してもよろしいですか？
              {selectedDept && selectedDept._count.users > 0 && (
                <span className="block mt-2 text-destructive font-medium">
                  この部署には {selectedDept._count.users}名の従業員が所属しています。
                  所属する従業員がいる部署は削除できません。
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting || (selectedDept?._count.users ?? 0) > 0}
            >
              {isSubmitting ? "削除中..." : "削除する"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
