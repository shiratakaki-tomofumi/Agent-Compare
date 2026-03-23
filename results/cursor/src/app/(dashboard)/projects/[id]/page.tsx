import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { PROJECT_STATUS_LABELS } from "@/lib/constants";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TaskManager } from "@/components/projects/task-manager";
import { ProjectActions } from "@/components/projects/project-actions";

interface Props {
  params: Promise<{ id: string }>;
}

type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  assigneeId: string | null;
  assignee: { name: string } | null;
  priority: string;
  status: string;
  dueDate: Date | null;
};

export default async function ProjectDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return notFound();

  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: { id, isDeleted: false },
    include: {
      department: true,
      tasks: {
        include: {
          assignee: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!project) {
    notFound();
  }

  const userRole = session.user.role;
  const canEdit = userRole === "MANAGER" || userRole === "ADMIN";

  const members = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const tasks = project.tasks as TaskRow[];
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "DONE").length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const serializedTasks = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    assigneeId: task.assigneeId,
    assigneeName: task.assignee?.name ?? null,
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{project.name}</h1>
        {canEdit && <ProjectActions projectId={project.id} />}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-sm text-muted-foreground">担当部署</dt>
              <dd className="mt-1 font-medium">{project.department.name}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">ステータス</dt>
              <dd className="mt-1">
                <StatusBadge status={project.status} labels={PROJECT_STATUS_LABELS} />
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">開始日</dt>
              <dd className="mt-1 font-medium">
                {format(project.startDate, "yyyy/MM/dd")}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">終了予定日</dt>
              <dd className="mt-1 font-medium">
                {format(project.endDate, "yyyy/MM/dd")}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">進捗率</dt>
              <dd className="mt-1">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-sm">
                    {progress}% ({doneTasks}/{totalTasks})
                  </span>
                </div>
              </dd>
            </div>
            {project.description && (
              <div className="sm:col-span-2 lg:col-span-3">
                <dt className="text-sm text-muted-foreground">説明</dt>
                <dd className="mt-1">{project.description}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      <Separator />

      <TaskManager
        projectId={project.id}
        initialTasks={serializedTasks}
        members={members}
      />
    </div>
  );
}
