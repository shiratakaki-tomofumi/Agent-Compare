import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getProject, updateProject } from "@/lib/actions/projects";
import { prisma } from "@/lib/prisma";
import { ProjectForm } from "@/components/projects/project-form";
import { Role } from "@prisma/client";

interface PageProps {
  params: { id: string };
}

export default async function EditProjectPage({ params }: PageProps) {
  await requireRole([Role.MANAGER, Role.ADMIN]);
  const [project, departments] = await Promise.all([
    getProject(params.id),
    prisma.department.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);
  if (!project) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">案件編集</h1>
      <ProjectForm
        defaultValues={{
          name: project.name,
          description: project.description ?? undefined,
          departmentId: project.departmentId,
          status: project.status,
          startDate: new Date(project.startDate).toISOString().split("T")[0],
          endDate: new Date(project.endDate).toISOString().split("T")[0],
        }}
        departments={departments}
        action={(fd) => updateProject(params.id, fd)}
        submitLabel="更新する"
      />
    </div>
  );
}
