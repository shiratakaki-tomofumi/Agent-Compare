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
import { DealStatus } from "@prisma/client";
import { DEAL_STATUS_LABELS } from "@/lib/constants";

const schema = z.object({
  title: z.string().min(1, "商談名は必須です"),
  customerId: z.string().min(1, "顧客は必須です"),
  assigneeId: z.string().min(1, "担当者は必須です"),
  amount: z.coerce.number().int().min(0, "金額は0以上で入力してください"),
  probability: z.coerce.number().int().min(0).max(100),
  status: z.nativeEnum(DealStatus),
  note: z.string().optional(),
});

type DealFormValues = z.infer<typeof schema>;

interface DealFormProps {
  defaultValues?: Partial<DealFormValues>;
  customers: { id: string; companyName: string }[];
  users: { id: string; name: string }[];
  action: (
    formData: globalThis.FormData,
  ) => Promise<{ success?: boolean; error?: string }>;
  submitLabel?: string;
}

export function DealForm({
  defaultValues,
  customers,
  users,
  action,
  submitLabel = "保存",
}: DealFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DealFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: DealStatus.LEAD,
      probability: 0,
      amount: 0,
      ...defaultValues,
    },
  });

  const onSubmit = async (data: DealFormValues) => {
    const fd = new globalThis.FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined && v !== null) fd.append(k, String(v));
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
      router.push("/sales/deals");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
      <div className="space-y-2">
        <Label htmlFor="title">
          商談名 <span className="text-destructive">*</span>
        </Label>
        <Input id="title" {...register("title")} />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label>
          顧客 <span className="text-destructive">*</span>
        </Label>
        <Select
          value={watch("customerId") ?? ""}
          onValueChange={(v) => setValue("customerId", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="顧客を選択" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.companyName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.customerId && (
          <p className="text-sm text-destructive">
            {errors.customerId.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label>
          担当者 <span className="text-destructive">*</span>
        </Label>
        <Select
          value={watch("assigneeId") ?? ""}
          onValueChange={(v) => setValue("assigneeId", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="担当者を選択" />
          </SelectTrigger>
          <SelectContent>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.assigneeId && (
          <p className="text-sm text-destructive">
            {errors.assigneeId.message}
          </p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">
            金額（円） <span className="text-destructive">*</span>
          </Label>
          <Input id="amount" type="number" min={0} {...register("amount")} />
          {errors.amount && (
            <p className="text-sm text-destructive">{errors.amount.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="probability">確度（%）</Label>
          <Input
            id="probability"
            type="number"
            min={0}
            max={100}
            {...register("probability")}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>
          ステータス <span className="text-destructive">*</span>
        </Label>
        <Select
          value={watch("status")}
          onValueChange={(v) => setValue("status", v as DealStatus)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DEAL_STATUS_LABELS).map(([v, l]) => (
              <SelectItem key={v} value={v}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="note">メモ</Label>
        <Textarea id="note" {...register("note")} rows={3} />
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
