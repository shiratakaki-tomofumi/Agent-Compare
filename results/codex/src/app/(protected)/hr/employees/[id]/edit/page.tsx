import { notFound } from "next/navigation";

import { EmployeeForm } from "@/components/forms";
import { upsertEmployeeAction } from "@/lib/actions";
import { requireRole } from "@/lib/auth";
import { getEmployeeDetail, getSelectOptions } from "@/lib/queries";

export default async function EditEmployeePage({ params }: { params: { id: string } }) {
  await requireRole("ADMIN");
  const [detail, options] = await Promise.all([getEmployeeDetail(params.id), getSelectOptions()]);
  if (!detail) {
    notFound();
  }

  return (
    <EmployeeForm
      initialValues={{
        name: detail.employee.name,
        email: detail.employee.email,
        role: detail.employee.role,
        departmentId: detail.employee.departmentId,
        position: detail.employee.position,
        hireDate: detail.employee.hireDate,
        isActive: detail.employee.isActive
      }}
      departments={options.departments}
      action={(payload) => upsertEmployeeAction(detail.employee.id, payload)}
    />
  );
}
