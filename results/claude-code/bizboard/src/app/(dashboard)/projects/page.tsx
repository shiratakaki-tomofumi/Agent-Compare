import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PAGE_SIZE, PROJECT_STATUS_LABELS } from "@/lib/constants";
import { notFound } from "next/navigation";
import { ProjectListClient } from "@/components/projects/project-list-client";

interface Props {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}

export default async function ProjectsPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return notFound();

  const params = await searchParams;
  const search = params.search || "";
  const status = params.status || "";
  const page = Math.max(1, Number(params.page || "1"));

  const where = {
    isDeleted: false,
    ...(search && {
      name: { contains: search, mode: "insensitive" as const },
    }),
    ...(status && {
      status: status as "PLANNING" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD",
    }),
  };

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        department: true,
        tasks: {
          select: { status: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.project.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const userRole = session.user.role;
  const canCreate = userRole === "MANAGER" || userRole === "ADMIN";

  const projectsWithProgress = projects.map((project) => {
    const totalTasks = project.tasks.length;
    const doneTasks = project.tasks.filter((t) => t.status === "DONE").length;
    const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
    return {
      id: project.id,
      name: project.name,
      departmentName: project.department.name,
      status: project.status,
      startDate: project.startDate.toISOString(),
      endDate: project.endDate.toISOString(),
      progress,
      totalTasks,
      doneTasks,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">案件管理</h1>
      </div>
      <ProjectListClient
        projects={projectsWithProgress}
        currentPage={page}
        totalPages={totalPages}
        currentSearch={search}
        currentStatus={status}
        canCreate={canCreate}
        statusLabels={PROJECT_STATUS_LABELS}
      />
    </div>
  );
}
