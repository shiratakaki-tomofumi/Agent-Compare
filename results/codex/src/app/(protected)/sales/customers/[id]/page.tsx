import Link from "next/link";
import { notFound } from "next/navigation";

import { MutationButton } from "@/components/ui";
import { deleteCustomerAction } from "@/lib/actions";
import { getSession } from "@/lib/auth";
import { canManage } from "@/lib/permissions";
import { getCustomerDetail } from "@/lib/queries";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DescriptionList, PageHeader, Panel, StatusBadge } from "@/components/ui";

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const [session, customer] = await Promise.all([getSession(), getCustomerDetail(params.id)]);
  if (!customer) {
    notFound();
  }

  const editable = session?.user ? canManage(session.user.role) : false;

  return (
    <div className="space-y-8">
      <PageHeader
        title={customer.companyName}
        description="顧客の基本情報と関連商談を確認できます。"
        action={
          editable ? (
            <div className="flex gap-3">
              <Link href={`/sales/customers/${customer.id}/edit`} className="rounded-full border border-slate-300 px-5 py-3 text-sm font-medium">
                編集
              </Link>
              <MutationButton
                label="削除"
                variant="danger"
                confirmMessage="この顧客を削除しますか？"
                action={() => deleteCustomerAction(customer.id)}
              />
            </div>
          ) : undefined
        }
      />

      <Panel title="基本情報">
        <DescriptionList
          items={[
            { label: "担当者", value: customer.contactName },
            { label: "メール", value: customer.email },
            { label: "電話番号", value: customer.phone || "-" },
            { label: "ステータス", value: <StatusBadge value={customer.status} /> },
            { label: "作成日", value: formatDate(customer.createdAt) },
            { label: "更新日", value: formatDate(customer.updatedAt) }
          ]}
        />
      </Panel>

      <Panel title="関連商談">
        <div className="space-y-3">
          {customer.deals.length === 0 ? (
            <p className="text-sm text-slate-500">関連する商談はありません。</p>
          ) : (
            customer.deals.map((deal) => (
              <Link
                href={`/sales/deals/${deal.id}`}
                key={deal.id}
                className="block rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-ocean"
              >
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="font-medium text-slate-900">{deal.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">担当者: {deal.assignee.name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge value={deal.status} />
                    <span className="font-medium text-slate-900">{formatCurrency(deal.amount)}</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </Panel>
    </div>
  );
}
