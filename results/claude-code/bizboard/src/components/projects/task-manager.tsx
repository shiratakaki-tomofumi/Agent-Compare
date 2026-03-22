"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { taskSchema, type TaskInput } from "@/lib/validations";
import {
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";

interface TaskItem {
  id: string;
  title: string;
  description: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
  priority: string;
  status: string;
  dueDate: string | null;
}

interface Props {
  projectId: string;
  initialTasks: TaskItem[];
  members: { id: string; name: string }[];
}

export function TaskManager({ projectId, initialTasks, members }: Props) {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [showDialog, setShowDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<TaskInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      assigneeId: "",
      priority: "MEDIUM",
      status: "TODO",
      dueDate: "",
    },
  });

  function openCreateDialog() {
    setEditingTask(null);
    form.reset({
      title: "",
      description: "",
      assigneeId: "",
      priority: "MEDIUM",
      status: "TODO",
      dueDate: "",
    });
    setShowDialog(true);
  }

  function openEditDialog(task: TaskItem) {
    setEditingTask(task);
    form.reset({
      title: task.title,
      description: task.description ?? "",
      assigneeId: task.assigneeId ?? "",
      priority: task.priority as TaskInput["priority"],
      status: task.status as TaskInput["status"],
      dueDate: task.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd") : "",
    });
    setShowDialog(true);
  }

  async function onSubmit(data: TaskInput) {
    setSubmitting(true);
    try {
      if (editingTask) {
        const res = await fetch(
          `/api/projects/${projectId}/tasks/${editingTask.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          }
        );
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "更新に失敗しました");
        }
        const { data: updated } = await res.json();
        setTasks((prev) =>
          prev.map((t) =>
            t.id === editingTask.id
              ? {
                  id: updated.id,
                  title: updated.title,
                  description: updated.description,
                  assigneeId: updated.assigneeId,
                  assigneeName: updated.assignee?.name ?? null,
                  priority: updated.priority,
                  status: updated.status,
                  dueDate: updated.dueDate,
                }
              : t
          )
        );
        toast.success("タスクを更新しました");
      } else {
        const res = await fetch(`/api/projects/${projectId}/tasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "作成に失敗しました");
        }
        const { data: created } = await res.json();
        setTasks((prev) => [
          {
            id: created.id,
            title: created.title,
            description: created.description,
            assigneeId: created.assigneeId,
            assigneeName: created.assignee?.name ?? null,
            priority: created.priority,
            status: created.status,
            dueDate: created.dueDate,
          },
          ...prev,
        ]);
        toast.success("タスクを作成しました");
      }
      setShowDialog(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "エラーが発生しました");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deletingTaskId) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/projects/${projectId}/tasks/${deletingTaskId}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "削除に失敗しました");
      }
      setTasks((prev) => prev.filter((t) => t.id !== deletingTaskId));
      toast.success("タスクを削除しました");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "削除に失敗しました");
    } finally {
      setSubmitting(false);
      setShowDeleteDialog(false);
      setDeletingTaskId(null);
    }
  }

  async function handleStatusChange(taskId: string, newStatus: string) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    try {
      const res = await fetch(
        `/api/projects/${projectId}/tasks/${taskId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: task.title,
            description: task.description ?? "",
            assigneeId: task.assigneeId ?? "",
            priority: task.priority,
            status: newStatus,
            dueDate: task.dueDate
              ? format(new Date(task.dueDate), "yyyy-MM-dd")
              : "",
          }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "更新に失敗しました");
      }
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
      toast.success("ステータスを更新しました");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "更新に失敗しました");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">タスク一覧</h2>
        <Button onClick={openCreateDialog}>
          <Plus className="size-4" />
          タスク追加
        </Button>
      </div>

      {tasks.length === 0 ? (
        <EmptyState message="タスクがありません" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>タスク名</TableHead>
              <TableHead>担当者</TableHead>
              <TableHead>期限</TableHead>
              <TableHead>優先度</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.title}</TableCell>
                <TableCell>{task.assigneeName ?? "-"}</TableCell>
                <TableCell>
                  {task.dueDate
                    ? format(new Date(task.dueDate), "yyyy/MM/dd")
                    : "-"}
                </TableCell>
                <TableCell>
                  <StatusBadge
                    status={task.priority}
                    labels={TASK_PRIORITY_LABELS}
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={task.status}
                    onValueChange={(val) =>
                      handleStatusChange(task.id, val as string)
                    }
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TASK_STATUS_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openEditDialog(task)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        setDeletingTaskId(task.id);
                        setShowDeleteDialog(true);
                      }}
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

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTask ? "タスク編集" : "タスク追加"}
            </DialogTitle>
            <DialogDescription>
              {editingTask ? "タスクの情報を更新します。" : "新しいタスクを追加します。"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">タスク名 *</Label>
              <Input id="title" {...form.register("title")} />
              {form.formState.errors.title && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">説明</Label>
              <Textarea id="description" {...form.register("description")} />
            </div>

            <div className="space-y-2">
              <Label>担当者</Label>
              <Select
                value={form.watch("assigneeId") ?? ""}
                onValueChange={(val) => form.setValue("assigneeId", val as string)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="担当者を選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">未割り当て</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>優先度</Label>
                <Select
                  value={form.watch("priority")}
                  onValueChange={(val) =>
                    form.setValue("priority", val as TaskInput["priority"])
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TASK_PRIORITY_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>ステータス</Label>
                <Select
                  value={form.watch("status")}
                  onValueChange={(val) =>
                    form.setValue("status", val as TaskInput["status"])
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TASK_STATUS_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">期限</Label>
              <Input id="dueDate" type="date" {...form.register("dueDate")} />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
              >
                キャンセル
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting
                  ? "保存中..."
                  : editingTask
                  ? "更新する"
                  : "追加する"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>タスクの削除</DialogTitle>
            <DialogDescription>
              このタスクを削除してもよろしいですか？この操作は取り消せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setDeletingTaskId(null);
              }}
            >
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={submitting}
            >
              {submitting ? "削除中..." : "削除する"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
