import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { format } from "date-fns";
import { ProjectForm } from "@/components/projects/project-form";
import type { ProjectInput } from "@/lib/validations";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProjectPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const role = session.user.role;
  if (role !== "MANAGER" && role !== "ADMIN") {
    redirect("/projects");
  }

  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: { id, isDeleted: false },
  });

  if (!project) {
    notFound();
  }

  const departments = await prisma.department.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const defaultValues: ProjectInput = {
    name: project.name,
    description: project.description ?? "",
    departmentId: project.departmentId,
    status: project.status,
    startDate: format(project.startDate, "yyyy-MM-dd"),
    endDate: format(project.endDate, "yyyy-MM-dd"),
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">案件編集</h1>
      <ProjectForm
        departments={departments}
        defaultValues={defaultValues}
        projectId={project.id}
      />
    </div>
  );
}
