import { notFound } from "next/navigation";

import { ProjectForm } from "@/components/forms";
import { upsertProjectAction } from "@/lib/actions";
import { requireRole } from "@/lib/auth";
import { getProjectDetail, getSelectOptions } from "@/lib/queries";

export default async function EditProjectPage({ params }: { params: { id: string } }) {
  await requireRole("MANAGER");
  const [project, options] = await Promise.all([getProjectDetail(params.id), getSelectOptions()]);
  if (!project) {
    notFound();
  }

  return (
    <ProjectForm
      initialValues={{
        name: project.name,
        description: project.description,
        departmentId: project.departmentId,
        status: project.status,
        startDate: project.startDate,
        endDate: project.endDate
      }}
      departments={options.departments}
      action={(payload) => upsertProjectAction(project.id, payload)}
    />
  );
}
