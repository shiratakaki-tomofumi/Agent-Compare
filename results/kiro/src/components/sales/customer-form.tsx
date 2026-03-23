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
import { CustomerStatus } from "@prisma/client";

const schema = z.object({
  companyName: z.string().min(1, "会社名は必須です"),
  contactName: z.string().min(1, "担当者名は必須です"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  phone: z.string().optional(),
  status: z.nativeEnum(CustomerStatus),
});

type CustomerFormValues = z.infer<typeof schema>;

interface CustomerFormProps {
  defaultValues?: Partial<CustomerFormValues>;
  action: (
    formData: globalThis.FormData,
  ) => Promise<{ success?: boolean; error?: string }>;
  submitLabel?: string;
}

export function CustomerForm({
  defaultValues,
  action,
  submitLabel = "保存",
}: CustomerFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: CustomerStatus.ACTIVE, ...defaultValues },
  });

  const onSubmit = async (data: CustomerFormValues) => {
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
      router.push("/sales/customers");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
      <div className="space-y-2">
        <Label htmlFor="companyName">
          会社名 <span className="text-destructive">*</span>
        </Label>
        <Input id="companyName" {...register("companyName")} />
        {errors.companyName && (
          <p className="text-sm text-destructive">
            {errors.companyName.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="contactName">
          担当者名 <span className="text-destructive">*</span>
        </Label>
        <Input id="contactName" {...register("contactName")} />
        {errors.contactName && (
          <p className="text-sm text-destructive">
            {errors.contactName.message}
          </p>
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
      <div className="space-y-2">
        <Label htmlFor="phone">電話番号</Label>
        <Input id="phone" {...register("phone")} />
      </div>
      <div className="space-y-2">
        <Label>
          ステータス <span className="text-destructive">*</span>
        </Label>
        <Select
          value={watch("status")}
          onValueChange={(v) => setValue("status", v as CustomerStatus)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ACTIVE">取引中</SelectItem>
            <SelectItem value="DORMANT">休眠</SelectItem>
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
