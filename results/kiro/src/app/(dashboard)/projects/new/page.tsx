import { requireRole } from "@/lib/auth";
import { createProject } from "@/lib/actions/projects";
import { prisma } from "@/lib/prisma";
import { ProjectForm } from "@/components/projects/project-form";
import { Role } from "@prisma/client";

export default async function NewProjectPage() {
  await requireRole([Role.MANAGER, Role.ADMIN]);
  const departments = await prisma.department.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">案件新規作成</h1>
      <ProjectForm
        departments={departments}
        action={createProject}
        submitLabel="作成する"
      />
    </div>
  );
}
