import { ProjectForm } from "@/components/forms";
import { upsertProjectAction } from "@/lib/actions";
import { requireRole } from "@/lib/auth";
import { getSelectOptions } from "@/lib/queries";

export default async function NewProjectPage() {
  await requireRole("MANAGER");
  const options = await getSelectOptions();

  return (
    <ProjectForm
      departments={options.departments}
      action={(payload) => upsertProjectAction(null, payload)}
    />
  );
}
