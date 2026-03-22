"use client";

import { useSession } from "next-auth/react";
import { redirect, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { EmployeeForm } from "@/components/hr/employee-form";
import type { EmployeeInput } from "@/lib/validations";
import { toast } from "sonner";
import { format } from "date-fns";

export default function EditEmployeePage() {
  const { data: session, status } = useSession();
  const params = useParams<{ id: string }>();
  const [defaultValues, setDefaultValues] = useState<EmployeeInput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params.id) return;

    fetch(`/api/hr/employees/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((json) => {
        const emp = json.data;
        setDefaultValues({
          name: emp.name,
          email: emp.email,
          password: "",
          role: emp.role,
          departmentId: emp.department?.id || "",
          position: emp.position || "",
          hireDate: emp.hireDate
            ? format(new Date(emp.hireDate), "yyyy-MM-dd")
            : "",
        });
        setLoading(false);
      })
      .catch(() => {
        toast.error("従業員の取得に失敗しました");
        setLoading(false);
      });
  }, [params.id]);

  if (status === "loading" || loading) return null;
  if (!session?.user) redirect("/login");

  const role = (session.user as { role: string }).role;
  if (role !== "ADMIN") redirect("/hr/employees");

  if (!defaultValues) {
    redirect("/hr/employees");
  }

  return (
    <EmployeeForm
      mode="edit"
      employeeId={params.id}
      defaultValues={defaultValues}
    />
  );
}
