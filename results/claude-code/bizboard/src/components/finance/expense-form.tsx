"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { expenseSchema, type ExpenseInput } from "@/lib/validations";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/constants";
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
  defaultValues?: ExpenseInput;
  expenseId?: string;
}

export function ExpenseForm({ defaultValues, expenseId }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!expenseId;

  const form = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: defaultValues ?? {
      amount: 0,
      category: "TRAVEL" as const,
      description: "",
      expenseDate: "",
    },
  });

  async function onSubmit(data: Record<string, unknown>) {
    const typedData = data as ExpenseInput;
    setSubmitting(true);
    try {
      const url = isEdit
        ? `/api/finance/expenses/${expenseId}`
        : "/api/finance/expenses";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(typedData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "保存に失敗しました");
      }

      toast.success(isEdit ? "経費申請を更新しました" : "経費申請を作成しました");
      router.push("/finance/expenses");
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
        <CardTitle>{isEdit ? "経費申請編集" : "新規経費申請"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">金額 (円) *</Label>
            <Input
              id="amount"
              type="number"
              {...form.register("amount", { valueAsNumber: true })}
            />
            {form.formState.errors.amount && (
              <p className="text-xs text-destructive">
                {form.formState.errors.amount.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>カテゴリ *</Label>
            <Select
              value={form.watch("category")}
              onValueChange={(val) =>
                form.setValue("category", val as ExpenseInput["category"])
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="カテゴリを選択" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(EXPENSE_CATEGORY_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">説明 *</Label>
            <Textarea id="description" {...form.register("description")} />
            {form.formState.errors.description && (
              <p className="text-xs text-destructive">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="expenseDate">経費発生日 *</Label>
            <Input
              id="expenseDate"
              type="date"
              {...form.register("expenseDate")}
            />
            {form.formState.errors.expenseDate && (
              <p className="text-xs text-destructive">
                {form.formState.errors.expenseDate.message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 pt-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? "保存中..." : isEdit ? "更新する" : "申請する"}
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
