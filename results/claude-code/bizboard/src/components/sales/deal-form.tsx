"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { dealSchema, type DealInput } from "@/lib/validations";
import { DEAL_STATUS_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DealFormProps {
  defaultValues?: DealInput;
  dealId?: string;
}

interface CustomerOption {
  id: string;
  companyName: string;
}

interface UserOption {
  id: string;
  name: string;
}

export function DealForm({ defaultValues, dealId }: DealFormProps) {
  const router = useRouter();
  const isEdit = !!dealId;

  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DealInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(dealSchema) as any,
    defaultValues: defaultValues ?? {
      title: "",
      customerId: "",
      assigneeId: "",
      amount: 0,
      probability: 0,
      status: "LEAD",
      note: "",
    },
  });

  useEffect(() => {
    async function loadOptions() {
      try {
        const [customersRes, usersRes] = await Promise.all([
          fetch("/api/sales/customers?page=1&search="),
          fetch("/api/users"),
        ]);

        if (customersRes.ok) {
          const customersData = await customersRes.json();
          setCustomers(
            customersData.data.map((c: CustomerOption) => ({
              id: c.id,
              companyName: c.companyName,
            }))
          );
        }

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(
            usersData.data.map((u: UserOption) => ({
              id: u.id,
              name: u.name,
            }))
          );
        }
      } catch {
        toast.error("選択肢の読み込みに失敗しました");
      } finally {
        setLoadingOptions(false);
      }
    }
    loadOptions();
  }, []);

  const onSubmit = async (data: DealInput) => {
    try {
      const url = isEdit
        ? `/api/sales/deals/${dealId}`
        : "/api/sales/deals";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "保存に失敗しました");
      }

      toast.success(isEdit ? "商談を更新しました" : "商談を登録しました");
      router.push("/sales/deals");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "保存に失敗しました"
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "商談編集" : "商談登録"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">商談名</Label>
            <Input id="title" {...register("title")} />
            {errors.title && (
              <p className="text-xs text-destructive">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerId">顧客</Label>
            <select
              id="customerId"
              {...register("customerId")}
              disabled={loadingOptions}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
            >
              <option value="">選択してください</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName}
                </option>
              ))}
            </select>
            {errors.customerId && (
              <p className="text-xs text-destructive">
                {errors.customerId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="assigneeId">担当者</Label>
            <select
              id="assigneeId"
              {...register("assigneeId")}
              disabled={loadingOptions}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
            >
              <option value="">選択してください</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
            {errors.assigneeId && (
              <p className="text-xs text-destructive">
                {errors.assigneeId.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">金額</Label>
              <Input
                id="amount"
                type="number"
                min={0}
                {...register("amount")}
              />
              {errors.amount && (
                <p className="text-xs text-destructive">
                  {errors.amount.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="probability">確度 (%)</Label>
              <Input
                id="probability"
                type="number"
                min={0}
                max={100}
                {...register("probability")}
              />
              {errors.probability && (
                <p className="text-xs text-destructive">
                  {errors.probability.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">ステータス</Label>
            <select
              id="status"
              {...register("status")}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {Object.entries(DEAL_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {errors.status && (
              <p className="text-xs text-destructive">
                {errors.status.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">備考</Label>
            <Textarea id="note" {...register("note")} />
            {errors.note && (
              <p className="text-xs text-destructive">
                {errors.note.message}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "保存中..." : isEdit ? "更新" : "登録"}
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
