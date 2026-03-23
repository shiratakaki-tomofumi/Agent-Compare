import { notFound } from "next/navigation";
import Link from "next/link";
import { getProject } from "@/lib/actions/projects";
import { deleteProjectAndRedirect } from "@/lib/actions/delete-actions";
import { getSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/shared/delete-button";
import { TaskPanel } from "@/components/projects/task-panel";
import { PROJECT_STATUS_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { Role } from "@prisma/client";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";

interface PageProps {
  params: { id: string };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const [session, project] = await Promise.all([
    getSession(),
    getProject(params.id),
  ]);
  if (!project) notFound();

  const canEdit =
    session &&
    ([Role.MANAGER, Role.ADMIN] as Role[]).includes(session.user.role as Role);

  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const done = project.tasks.filter(
    (t: { status: string }) => t.status === "DONE",
  ).length;
  const total = project.tasks.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{project.name}</h1>
        {canEdit && (
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href={`/projects/${project.id}/edit`}>
                <Pencil className="h-4 w-4" />
                編集
              </Link>
            </Button>
            <DeleteButton
              onDelete={deleteProjectAndRedirect.bind(null, project.id)}
            />
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-card p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">担当部署</p>
            <p className="font-medium">{project.department.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">ステータス</p>
            <Badge variant="outline">
              {PROJECT_STATUS_LABELS[project.status]}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">開始日</p>
            <p className="font-medium">{formatDate(project.startDate)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">終了予定日</p>
            <p className="font-medium">{formatDate(project.endDate)}</p>
          </div>
          {project.description && (
            <div className="col-span-2">
              <p className="text-sm text-muted-foreground">説明</p>
              <p className="whitespace-pre-wrap">{project.description}</p>
            </div>
          )}
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-1">
            進捗 ({done}/{total}タスク完了)
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-muted rounded-full h-3">
              <div
                className="bg-primary h-3 rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-sm font-medium w-10 text-right">{pct}%</span>
          </div>
        </div>
      </div>

      <TaskPanel
        projectId={project.id}
        tasks={project.tasks}
        users={users}
        canEdit={!!canEdit}
      />
    </div>
  );
}
