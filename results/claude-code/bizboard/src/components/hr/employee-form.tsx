"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { employeeSchema, type EmployeeInput } from "@/lib/validations";
import { ROLE_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Department {
  id: string;
  name: string;
}

interface EmployeeFormProps {
  mode: "new" | "edit";
  employeeId?: string;
  defaultValues?: EmployeeInput;
}

export function EmployeeForm({ mode, employeeId, defaultValues }: EmployeeFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [departments, setDepartments] = useState<Department[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployeeInput>({
    resolver: zodResolver(employeeSchema),
    defaultValues: defaultValues || {
      name: "",
      email: "",
      password: "",
      role: "MEMBER",
      departmentId: "",
      position: "",
      hireDate: "",
    },
  });

  useEffect(() => {
    fetch("/api/hr/departments")
      .then((res) => res.json())
      .then((json) => setDepartments(json.data || []))
      .catch(() => toast.error("部署の取得に失敗しました"));
  }, []);

  async function onSubmit(data: EmployeeInput) {
    try {
      const url =
        mode === "new"
          ? "/api/hr/employees"
          : `/api/hr/employees/${employeeId}`;
      const method = mode === "new" ? "POST" : "PUT";

      const body = { ...data };
      if (mode === "edit" && !body.password) {
        delete body.password;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const json = await res.json();
        toast.error(json.error || "保存に失敗しました");
        return;
      }

      toast.success(mode === "new" ? "従業員を登録しました" : "従業員を更新しました");
      startTransition(() => {
        router.push("/hr/employees");
        router.refresh();
      });
    } catch {
      toast.error("保存に失敗しました");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/hr/employees">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {mode === "new" ? "従業員の新規登録" : "従業員の編集"}
          </h1>
          <p className="text-muted-foreground">
            {mode === "new" ? "新しい従業員を登録します" : "従業員情報を編集します"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">氏名 *</Label>
                <Input id="name" {...register("name")} />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス *</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  パスワード {mode === "new" ? "*" : "(空欄の場合変更なし)"}
                </Label>
                <Input id="password" type="password" {...register("password")} />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">ロール *</Label>
                <select
                  id="role"
                  {...register("role")}
                  className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {(Object.entries(ROLE_LABELS) as [string, string][]).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                {errors.role && (
                  <p className="text-sm text-destructive">{errors.role.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="departmentId">部署</Label>
                <select
                  id="departmentId"
                  {...register("departmentId")}
                  className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="">未所属</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                {errors.departmentId && (
                  <p className="text-sm text-destructive">{errors.departmentId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">役職</Label>
                <Input id="position" {...register("position")} />
                {errors.position && (
                  <p className="text-sm text-destructive">{errors.position.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="hireDate">入社日</Label>
                <Input id="hireDate" type="date" {...register("hireDate")} />
                {errors.hireDate && (
                  <p className="text-sm text-destructive">{errors.hireDate.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Link href="/hr/employees">
                <Button variant="outline" type="button">
                  キャンセル
                </Button>
              </Link>
              <Button type="submit" disabled={isPending}>
                <Save className="size-4" />
                {isPending ? "保存中..." : "保存"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
