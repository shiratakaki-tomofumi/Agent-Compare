"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Role } from "@prisma/client";
import { ROLE_LABELS } from "@/lib/constants";

const baseSchema = z.object({
  name: z.string().min(1, "氏名は必須です"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  role: z.nativeEnum(Role),
  departmentId: z.string().optional(),
  position: z.string().optional(),
  hireDate: z.string().optional(),
});

const createSchema = baseSchema.extend({
  password: z.string().min(8, "パスワードは8文字以上で入力してください"),
});

type BaseFormData = z.infer<typeof baseSchema>;
type CreateFormData = z.infer<typeof createSchema>;

interface EmployeeFormProps {
  defaultValues?: Partial<BaseFormData>;
  departments: { id: string; name: string }[];
  action: (
    formData: globalThis.FormData,
  ) => Promise<{ success?: boolean; error?: string }>;
  isCreate?: boolean;
  submitLabel?: string;
}

export function EmployeeForm({
  defaultValues,
  departments,
  action,
  isCreate = false,
  submitLabel = "保存",
}: EmployeeFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const schema = isCreate ? createSchema : baseSchema;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateFormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: Role.MEMBER, ...defaultValues },
  });

  const onSubmit = async (data: CreateFormData) => {
    const fd = new globalThis.FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined && v !== "") fd.append(k, String(v));
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
      router.push("/hr/employees");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
      <div className="space-y-2">
        <Label htmlFor="name">
          氏名 <span className="text-destructive">*</span>
        </Label>
        <Input id="name" {...register("name")} />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">
          メールアドレス <span className="text-destructive">*</span>
        </Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>
      {isCreate && (
        <div className="space-y-2">
          <Label htmlFor="password">
            パスワード <span className="text-destructive">*</span>
          </Label>
          <Input id="password" type="password" {...register("password")} />
          {errors.password && (
            <p className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>
      )}
      <div className="space-y-2">
        <Label>
          ロール <span className="text-destructive">*</span>
        </Label>
        <Select
          value={watch("role")}
          onValueChange={(v) => setValue("role", v as Role)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ROLE_LABELS).map(([v, l]) => (
              <SelectItem key={v} value={v}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>部署</Label>
        <Select
          value={watch("departmentId") ?? "none"}
          onValueChange={(v) => setValue("departmentId", v === "none" ? "" : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="未所属" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">未所属</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="position">役職</Label>
          <Input id="position" {...register("position")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hireDate">入社日</Label>
          <Input id="hireDate" type="date" {...register("hireDate")} />
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
