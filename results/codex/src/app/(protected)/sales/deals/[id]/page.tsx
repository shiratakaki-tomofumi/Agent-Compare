import Link from "next/link";
import { notFound } from "next/navigation";

import { DealStatusBoard } from "@/components/forms";
import { DescriptionList, MutationButton, PageHeader, Panel, StatusBadge } from "@/components/ui";
import { deleteDealAction, updateDealStatusAction } from "@/lib/actions";
import { getSession } from "@/lib/auth";
import { canManage } from "@/lib/permissions";
import { getDealDetail } from "@/lib/queries";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function DealDetailPage({ params }: { params: { id: string } }) {
  const [session, deal] = await Promise.all([getSession(), getDealDetail(params.id)]);
  if (!deal) {
    notFound();
  }
  const editable = session?.user ? canManage(session.user.role) : false;

  return (
    <div className="space-y-8">
      <PageHeader
        title={deal.title}
        description="商談の詳細とステータス遷移を確認できます。"
        action={
          editable ? (
            <div className="flex gap-3">
              <Link href={`/sales/deals/${deal.id}/edit`} className="rounded-full border border-slate-300 px-5 py-3 text-sm font-medium">
                編集
              </Link>
              <MutationButton
                label="削除"
                variant="danger"
                confirmMessage="この商談を削除しますか？"
                action={() => deleteDealAction(deal.id)}
              />
            </div>
          ) : undefined
        }
      />

      <Panel title="基本情報">
        <DescriptionList
          items={[
            { label: "顧客", value: <Link href={`/sales/customers/${deal.customer.id}`}>{deal.customer.companyName}</Link> },
            { label: "担当者", value: deal.assignee.name },
            { label: "金額", value: formatCurrency(deal.amount) },
            { label: "確度", value: `${deal.probability}%` },
            { label: "ステータス", value: <StatusBadge value={deal.status} /> },
            { label: "クローズ日", value: formatDate(deal.closedAt) },
            { label: "メモ", value: deal.note || "-" }
          ]}
        />
      </Panel>

      <Panel title="ステータス更新" description="リード → 提案 → 交渉 → 成約/失注 の流れで更新します。">
        {editable ? (
          <DealStatusBoard
            currentStatus={deal.status}
            disabled={!editable}
            onChange={(status) => updateDealStatusAction(deal.id, status)}
          />
        ) : (
          <StatusBadge value={deal.status} />
        )}
      </Panel>
    </div>
  );
}
