import { requireRole } from "@/lib/auth";
import { getDepartments } from "@/lib/actions/employees";
import { DepartmentManager } from "@/components/hr/department-manager";
import { Role } from "@prisma/client";

export default async function DepartmentsPage() {
  await requireRole([Role.MANAGER, Role.ADMIN]);
  const departments = await getDepartments();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">部署管理</h1>
      <DepartmentManager departments={departments} />
    </div>
  );
}
