"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { customerSchema, type CustomerInput } from "@/lib/validations";
import { CUSTOMER_STATUS_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CustomerFormProps {
  defaultValues?: CustomerInput;
  customerId?: string;
}

export function CustomerForm({ defaultValues, customerId }: CustomerFormProps) {
  const router = useRouter();
  const isEdit = !!customerId;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: defaultValues ?? {
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      status: "ACTIVE",
    },
  });

  const onSubmit = async (data: CustomerInput) => {
    try {
      const url = isEdit
        ? `/api/sales/customers/${customerId}`
        : "/api/sales/customers";
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

      toast.success(isEdit ? "顧客を更新しました" : "顧客を登録しました");
      router.push("/sales/customers");
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
        <CardTitle>{isEdit ? "顧客編集" : "顧客登録"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">会社名</Label>
            <Input id="companyName" {...register("companyName")} />
            {errors.companyName && (
              <p className="text-xs text-destructive">
                {errors.companyName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactName">担当者名</Label>
            <Input id="contactName" {...register("contactName")} />
            {errors.contactName && (
              <p className="text-xs text-destructive">
                {errors.contactName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-xs text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">電話番号</Label>
            <Input id="phone" {...register("phone")} />
            {errors.phone && (
              <p className="text-xs text-destructive">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">ステータス</Label>
            <select
              id="status"
              {...register("status")}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {Object.entries(CUSTOMER_STATUS_LABELS).map(([value, label]) => (
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
