import { notFound } from "next/navigation";

import { DealForm } from "@/components/forms";
import { upsertDealAction } from "@/lib/actions";
import { requireRole } from "@/lib/auth";
import { getDealDetail, getSelectOptions } from "@/lib/queries";

export default async function EditDealPage({ params }: { params: { id: string } }) {
  await requireRole("MANAGER");
  const [deal, options] = await Promise.all([getDealDetail(params.id), getSelectOptions()]);
  if (!deal) {
    notFound();
  }

  return (
    <DealForm
      initialValues={{
        title: deal.title,
        customerId: deal.customerId,
        assigneeId: deal.assigneeId,
        amount: deal.amount,
        probability: deal.probability,
        status: deal.status,
        note: deal.note,
        closedAt: deal.closedAt
      }}
      customers={options.customers}
      users={options.users.map((user) => ({ id: user.id, name: user.name }))}
      action={(payload) => upsertDealAction(deal.id, payload)}
    />
  );
}
