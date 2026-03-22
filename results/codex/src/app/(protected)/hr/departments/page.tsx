import { DepartmentManager } from "@/components/forms";
import { PageHeader } from "@/components/ui";
import { deleteDepartmentAction, upsertDepartmentAction } from "@/lib/actions";
import { requireRole } from "@/lib/auth";
import { getDepartmentList } from "@/lib/queries";

export default async function DepartmentsPage() {
  await requireRole("MANAGER");
  const departments = await getDepartmentList();

  return (
    <div className="space-y-8">
      <PageHeader title="部署管理" description="部署の追加、編集、削除と所属人数の確認を行います。" />
      <DepartmentManager
        departments={departments}
        onCreate={(payload) => upsertDepartmentAction(null, payload)}
        onUpdate={(departmentId, payload) => upsertDepartmentAction(departmentId, payload)}
        onDelete={deleteDepartmentAction}
      />
    </div>
  );
}
