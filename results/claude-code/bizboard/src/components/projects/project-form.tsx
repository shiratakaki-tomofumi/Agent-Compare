"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { projectSchema, type ProjectInput } from "@/lib/validations";
import { PROJECT_STATUS_LABELS } from "@/lib/constants";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  departments: { id: string; name: string }[];
  defaultValues?: ProjectInput;
  projectId?: string;
}

export function ProjectForm({ departments, defaultValues, projectId }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!projectId;

  const form = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: defaultValues ?? {
      name: "",
      description: "",
      departmentId: "",
      status: "PLANNING",
      startDate: "",
      endDate: "",
    },
  });

  async function onSubmit(data: ProjectInput) {
    setSubmitting(true);
    try {
      const url = isEdit ? `/api/projects/${projectId}` : "/api/projects";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "保存に失敗しました");
      }

      const { data: saved } = await res.json();
      toast.success(isEdit ? "案件を更新しました" : "案件を作成しました");
      router.push(`/projects/${saved.id}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "保存に失敗しました");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "案件編集" : "新規案件"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">案件名 *</Label>
            <Input id="name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">説明</Label>
            <Textarea id="description" {...form.register("description")} />
          </div>

          <div className="space-y-2">
            <Label>担当部署 *</Label>
            <Select
              value={form.watch("departmentId")}
              onValueChange={(val) => form.setValue("departmentId", val as string)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="部署を選択" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.departmentId && (
              <p className="text-xs text-destructive">
                {form.formState.errors.departmentId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>ステータス *</Label>
            <Select
              value={form.watch("status")}
              onValueChange={(val) =>
                form.setValue("status", val as ProjectInput["status"])
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PROJECT_STATUS_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">開始日 *</Label>
              <Input
                id="startDate"
                type="date"
                {...form.register("startDate")}
              />
              {form.formState.errors.startDate && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.startDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">終了予定日 *</Label>
              <Input id="endDate" type="date" {...form.register("endDate")} />
              {form.formState.errors.endDate && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.endDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? "保存中..." : isEdit ? "更新する" : "作成する"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              キャンセル
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
