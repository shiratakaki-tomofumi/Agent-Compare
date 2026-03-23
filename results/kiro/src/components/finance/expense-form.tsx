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
import { ExpenseCategory } from "@prisma/client";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/constants";

const schema = z.object({
  amount: z.coerce.number().int().min(1, "金額は1円以上で入力してください"),
  category: z.nativeEnum(ExpenseCategory),
  description: z.string().min(1, "説明は必須です"),
  expenseDate: z.string().min(1, "経費発生日は必須です"),
});

type ExpenseFormValues = z.infer<typeof schema>;

interface ExpenseFormProps {
  defaultValues?: Partial<ExpenseFormValues>;
  action: (
    formData: globalThis.FormData,
  ) => Promise<{ success?: boolean; error?: string }>;
  submitLabel?: string;
}

export function ExpenseForm({
  defaultValues,
  action,
  submitLabel = "保存",
}: ExpenseFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { category: ExpenseCategory.OTHER, ...defaultValues },
  });

  const onSubmit = async (data: ExpenseFormValues) => {
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
      router.push("/finance/expenses");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
      <div className="space-y-2">
        <Label htmlFor="description">
          説明 <span className="text-destructive">*</span>
        </Label>
        <Textarea id="description" {...register("description")} rows={2} />
        {errors.description && (
          <p className="text-sm text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">
            金額（円） <span className="text-destructive">*</span>
          </Label>
          <Input id="amount" type="number" min={1} {...register("amount")} />
          {errors.amount && (
            <p className="text-sm text-destructive">{errors.amount.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="expenseDate">
            経費発生日 <span className="text-destructive">*</span>
          </Label>
          <Input id="expenseDate" type="date" {...register("expenseDate")} />
          {errors.expenseDate && (
            <p className="text-sm text-destructive">
              {errors.expenseDate.message}
            </p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label>
          カテゴリ <span className="text-destructive">*</span>
        </Label>
        <Select
          value={watch("category")}
          onValueChange={(v) => setValue("category", v as ExpenseCategory)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(EXPENSE_CATEGORY_LABELS).map(([v, l]) => (
              <SelectItem key={v} value={v}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
