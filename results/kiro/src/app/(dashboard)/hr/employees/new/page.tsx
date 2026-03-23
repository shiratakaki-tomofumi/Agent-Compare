import { requireRole } from "@/lib/auth";
import { createEmployee } from "@/lib/actions/employees";
import { prisma } from "@/lib/prisma";
import { EmployeeForm } from "@/components/hr/employee-form";
import { Role } from "@prisma/client";

export default async function NewEmployeePage() {
  await requireRole([Role.ADMIN]);
  const departments = await prisma.department.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">従業員追加</h1>
      <EmployeeForm
        departments={departments}
        action={createEmployee}
        isCreate
        submitLabel="追加する"
      />
    </div>
  );
}
