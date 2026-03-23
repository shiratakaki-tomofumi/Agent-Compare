"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
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
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { ProjectStatus } from "@prisma/client";
import { PROJECT_STATUS_LABELS } from "@/lib/constants";

const schema = z.object({
  name: z.string().min(1, "案件名は必須です"),
  description: z.string().optional(),
  departmentId: z.string().min(1, "担当部署は必須です"),
  status: z.nativeEnum(ProjectStatus),
  startDate: z.string().min(1, "開始日は必須です"),
  endDate: z.string().min(1, "終了予定日は必須です"),
});

type ProjectFormValues = z.infer<typeof schema>;

interface ProjectFormProps {
  defaultValues?: Partial<ProjectFormValues>;
  departments: { id: string; name: string }[];
  action: (
    formData: globalThis.FormData,
  ) => Promise<{ success?: boolean; error?: string }>;
  submitLabel?: string;
}

export function ProjectForm({
  defaultValues,
  departments,
  action,
  submitLabel = "保存",
}: ProjectFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: ProjectStatus.PLANNING, ...defaultValues },
  });

  const onSubmit = async (data: ProjectFormValues) => {
    const fd = new globalThis.FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined) fd.append(k, String(v));
    });
    const result = await action(fd);
    if (result.error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: result.error,
      });
    } else {
      toast({ title: "保存しました" });
      router.push("/projects");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
      <div className="space-y-2">
        <Label htmlFor="name">
          案件名 <span className="text-destructive">*</span>
        </Label>
        <Input id="name" {...register("name")} />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">説明</Label>
        <Textarea id="description" {...register("description")} rows={3} />
      </div>
      <div className="space-y-2">
        <Label>
          担当部署 <span className="text-destructive">*</span>
        </Label>
        <Select
          value={watch("departmentId") ?? ""}
          onValueChange={(v) => setValue("departmentId", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="部署を選択" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.departmentId && (
          <p className="text-sm text-destructive">
            {errors.departmentId.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label>
          ステータス <span className="text-destructive">*</span>
        </Label>
        <Select
          value={watch("status")}
          onValueChange={(v) => setValue("status", v as ProjectStatus)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(PROJECT_STATUS_LABELS).map(([v, l]) => (
              <SelectItem key={v} value={v}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">
            開始日 <span className="text-destructive">*</span>
          </Label>
          <Input id="startDate" type="date" {...register("startDate")} />
          {errors.startDate && (
            <p className="text-sm text-destructive">
              {errors.startDate.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">
            終了予定日 <span className="text-destructive">*</span>
          </Label>
          <Input id="endDate" type="date" {...register("endDate")} />
          {errors.endDate && (
            <p className="text-sm text-destructive">{errors.endDate.message}</p>
          )}
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          キャンセル
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
