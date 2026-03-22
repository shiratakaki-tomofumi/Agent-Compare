import { EmployeeForm } from "@/components/forms";
import { upsertEmployeeAction } from "@/lib/actions";
import { requireRole } from "@/lib/auth";
import { getSelectOptions } from "@/lib/queries";

export default async function NewEmployeePage() {
  await requireRole("ADMIN");
  const options = await getSelectOptions();

  return (
    <EmployeeForm
      departments={options.departments}
      action={(payload) => upsertEmployeeAction(null, payload)}
    />
  );
}
