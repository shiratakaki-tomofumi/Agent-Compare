"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { createTask, updateTask, deleteTask } from "@/lib/actions/projects";
import { TASK_STATUS_LABELS, TASK_PRIORITY_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { TaskPriority, TaskStatus } from "@prisma/client";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

const schema = z.object({
  title: z.string().min(1, "タスク名は必須です"),
  description: z.string().optional(),
  assigneeId: z.string().optional(),
  priority: z.nativeEnum(TaskPriority),
  status: z.nativeEnum(TaskStatus),
  dueDate: z.string().optional(),
});

type TaskFormValues = z.infer<typeof schema>;

interface Task {
  id: string;
  title: string;
  description: string | null;
  assigneeId: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: Date | null;
  assignee: { id: string; name: string } | null;
}

interface TaskPanelProps {
  projectId: string;
  tasks: Task[];
  users: { id: string; name: string }[];
  canEdit: boolean;
}

const priorityVariant: Record<string, "destructive" | "warning" | "secondary"> =
  {
    HIGH: "destructive",
    MEDIUM: "warning" as "destructive",
    LOW: "secondary",
  };

const statusVariant: Record<
  string,
  "secondary" | "info" | "warning" | "success"
> = {
  TODO: "secondary",
  IN_PROGRESS: "info" as "secondary",
  REVIEW: "warning" as "secondary",
  DONE: "success" as "secondary",
};

export function TaskPanel({
  projectId,
  tasks,
  users,
  canEdit,
}: TaskPanelProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { priority: TaskPriority.MEDIUM, status: TaskStatus.TODO },
  });

  const openCreate = () => {
    reset({ priority: TaskPriority.MEDIUM, status: TaskStatus.TODO });
    setEditingTask(null);
    setOpen(true);
  };

  const openEdit = (task: Task) => {
    reset({
      title: task.title,
      description: task.description ?? undefined,
      assigneeId: task.assigneeId ?? undefined,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().split("T")[0]
        : undefined,
    });
    setEditingTask(task);
    setOpen(true);
  };

  const onSubmit = async (data: TaskFormValues) => {
    const fd = new globalThis.FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined && v !== "") fd.append(k, String(v));
    });
    const result = editingTask
      ? await updateTask(editingTask.id, projectId, fd)
      : await createTask(projectId, fd);
    if (result.error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: result.error,
      });
    } else {
      toast({ title: editingTask ? "更新しました" : "作成しました" });
      setOpen(false);
      router.refresh();
    }
  };

  const handleDelete = async (taskId: string) => {
    const result = await deleteTask(taskId, projectId);
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
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">タスク一覧</h2>
        {canEdit && (
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            タスク追加
          </Button>
        )}
      </div>

      {tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">タスクがありません</p>
      ) : (
        <div className="rounded-lg border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">タスク名</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
                  担当者
                </th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">
                  期限
                </th>
                <th className="text-left px-4 py-3 font-medium">優先度</th>
                <th className="text-left px-4 py-3 font-medium">ステータス</th>
                {canEdit && <th className="px-4 py-3" />}
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{t.title}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                    {t.assignee?.name ?? "-"}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                    {formatDate(t.dueDate)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={priorityVariant[t.priority] ?? "outline"}>
                      {TASK_PRIORITY_LABELS[t.priority]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[t.status] ?? "outline"}>
                      {TASK_STATUS_LABELS[t.status]}
                    </Badge>
                  </td>
                  {canEdit && (
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(t)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(t.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTask ? "タスク編集" : "タスク追加"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="task-title">
                タスク名 <span className="text-destructive">*</span>
              </Label>
              <Input id="task-title" {...register("title")} />
              {errors.title && (
                <p className="text-xs text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="task-desc">説明</Label>
              <Textarea id="task-desc" {...register("description")} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>担当者</Label>
                <Select
                  value={watch("assigneeId") ?? ""}
                  onValueChange={(v) =>
                    setValue("assigneeId", v === "none" ? "" : v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="未割当" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">未割当</SelectItem>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="task-due">期限</Label>
                <Input id="task-due" type="date" {...register("dueDate")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>優先度</Label>
                <Select
                  value={watch("priority")}
                  onValueChange={(v) => setValue("priority", v as TaskPriority)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TASK_PRIORITY_LABELS).map(([v, l]) => (
                      <SelectItem key={v} value={v}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>ステータス</Label>
                <Select
                  value={watch("status")}
                  onValueChange={(v) => setValue("status", v as TaskStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TASK_STATUS_LABELS).map(([v, l]) => (
                      <SelectItem key={v} value={v}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                キャンセル
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingTask ? "更新" : "追加"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
