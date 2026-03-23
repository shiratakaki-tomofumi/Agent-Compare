import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getDeal, updateDeal } from "@/lib/actions/deals";
import { prisma } from "@/lib/prisma";
import { DealForm } from "@/components/sales/deal-form";
import { Role } from "@prisma/client";

interface PageProps {
  params: { id: string };
}

export default async function EditDealPage({ params }: PageProps) {
  await requireRole([Role.MANAGER, Role.ADMIN]);
  const [deal, customers, users] = await Promise.all([
    getDeal(params.id),
    prisma.customer.findMany({
      where: { isDeleted: false },
      select: { id: true, companyName: true },
      orderBy: { companyName: "asc" },
    }),
    prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);
  if (!deal) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">商談編集</h1>
      <DealForm
        defaultValues={{
          title: deal.title,
          customerId: deal.customerId,
          assigneeId: deal.assigneeId,
          amount: deal.amount,
          probability: deal.probability,
          status: deal.status,
          note: deal.note ?? undefined,
        }}
        customers={customers}
        users={users}
        action={(fd) => updateDeal(params.id, fd)}
        submitLabel="更新する"
      />
    </div>
  );
}
