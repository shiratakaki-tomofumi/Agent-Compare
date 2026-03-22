import Link from "next/link";
import { notFound } from "next/navigation";

import { TaskManager } from "@/components/forms";
import { DescriptionList, MutationButton, PageHeader, Panel, ProgressBar, StatusBadge } from "@/components/ui";
import { deleteProjectAction, deleteTaskAction, upsertTaskAction } from "@/lib/actions";
import { getSession } from "@/lib/auth";
import { canManage } from "@/lib/permissions";
import { getProjectDetail, getSelectOptions } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const [session, project, options] = await Promise.all([
    getSession(),
    getProjectDetail(params.id),
    getSelectOptions()
  ]);
  if (!project) {
    notFound();
  }

  const editable = session?.user ? canManage(session.user.role) : false;

  return (
    <div className="space-y-8">
      <PageHeader
        title={project.name}
        description="案件の基本情報、進捗率、タスクを管理します。"
        action={
          editable ? (
            <div className="flex gap-3">
              <Link href={`/projects/${project.id}/edit`} className="rounded-full border border-slate-300 px-5 py-3 text-sm font-medium">
                編集
              </Link>
              <MutationButton
                label="削除"
                variant="danger"
                confirmMessage="この案件を削除しますか？"
                action={() => deleteProjectAction(project.id)}
              />
            </div>
          ) : undefined
        }
      />

      <Panel title="基本情報">
        <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
          <DescriptionList
            items={[
              { label: "担当部署", value: project.department.name },
              { label: "ステータス", value: <StatusBadge value={project.status} /> },
              { label: "開始日", value: formatDate(project.startDate) },
              { label: "終了予定日", value: formatDate(project.endDate) },
              { label: "説明", value: project.description || "-" }
            ]}
          />
          <Panel title="進捗率">
            <ProgressBar value={project.progress} />
          </Panel>
        </div>
      </Panel>

      <Panel title="タスク一覧" description="案件単位でタスクの追加、更新、削除を行います。">
        <TaskManager
          projectId={project.id}
          role={session?.user.role ?? "MEMBER"}
          users={options.users.map((user) => ({ id: user.id, name: user.name }))}
          tasks={project.tasks.map((task) => ({
            id: task.id,
            title: task.title,
            description: task.description,
            assigneeId: task.assigneeId,
            assignee: task.assignee,
            priority: task.priority,
            status: task.status,
            dueDate: task.dueDate
          }))}
          onCreate={(payload) => upsertTaskAction(null, payload)}
          onUpdate={(taskId, payload) => upsertTaskAction(taskId, payload)}
          onDelete={(taskId) => deleteTaskAction(taskId, project.id)}
        />
      </Panel>
    </div>
  );
}
