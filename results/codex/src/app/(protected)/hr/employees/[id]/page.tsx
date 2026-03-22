import Link from "next/link";
import { notFound } from "next/navigation";

import { DescriptionList, MutationButton, PageHeader, Panel, StatusBadge } from "@/components/ui";
import { deleteEmployeeAction } from "@/lib/actions";
import { requireRole } from "@/lib/auth";
import { getEmployeeDetail } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export default async function EmployeeDetailPage({ params }: { params: { id: string } }) {
  await requireRole("MANAGER");
  const detail = await getEmployeeDetail(params.id);
  if (!detail) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={detail.employee.name}
        description="従業員の基本情報と月次勤怠サマリーを確認できます。"
        action={
          <div className="flex gap-3">
            <Link href={`/hr/employees/${detail.employee.id}/edit`} className="rounded-full border border-slate-300 px-5 py-3 text-sm font-medium">
              編集
            </Link>
            <MutationButton
              label="無効化"
              variant="danger"
              confirmMessage="この従業員を無効化しますか？"
              action={() => deleteEmployeeAction(detail.employee.id)}
            />
          </div>
        }
      />

      <Panel title="基本情報">
        <DescriptionList
          items={[
            { label: "メール", value: detail.employee.email },
            { label: "部署", value: detail.employee.department?.name ?? "-" },
            { label: "役職", value: detail.employee.position ?? "-" },
            { label: "ロール", value: <StatusBadge value={detail.employee.role} /> },
            { label: "入社日", value: formatDate(detail.employee.hireDate) }
          ]}
        />
      </Panel>

      <Panel title="月次勤怠サマリー">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">出勤日数</p>
            <p className="mt-2 font-heading text-3xl font-semibold text-ink">
              {detail.attendanceSummary.workingDays} 日
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-sm text-slate-500">残業時間</p>
            <p className="mt-2 font-heading text-3xl font-semibold text-ink">
              {detail.attendanceSummary.overtimeHours.toFixed(1)} h
            </p>
          </div>
        </div>
        <div className="mt-5 space-y-3">
          {detail.attendanceSummary.records.map((record) => (
            <div key={record.id} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
              <span className="text-sm text-slate-700">{formatDate(record.date)}</span>
              <span className="text-sm text-slate-500">残業 {record.overtimeHours.toFixed(1)} h</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
