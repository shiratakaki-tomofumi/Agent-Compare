import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getEmployee, updateEmployee } from "@/lib/actions/employees";
import { prisma } from "@/lib/prisma";
import { EmployeeForm } from "@/components/hr/employee-form";
import { Role } from "@prisma/client";

interface PageProps {
  params: { id: string };
}

export default async function EditEmployeePage({ params }: PageProps) {
  await requireRole([Role.ADMIN]);
  const [employee, departments] = await Promise.all([
    getEmployee(params.id),
    prisma.department.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);
  if (!employee) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">従業員編集</h1>
      <EmployeeForm
        defaultValues={{
          name: employee.name,
          email: employee.email,
          role: employee.role,
          departmentId: employee.departmentId ?? undefined,
          position: employee.position ?? undefined,
          hireDate: employee.hireDate
            ? new Date(employee.hireDate).toISOString().split("T")[0]
            : undefined,
        }}
        departments={departments}
        action={(fd) => updateEmployee(params.id, fd)}
        submitLabel="更新する"
      />
    </div>
  );
}
