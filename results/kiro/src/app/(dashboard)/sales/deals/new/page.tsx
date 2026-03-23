import { requireRole } from "@/lib/auth";
import { createDeal } from "@/lib/actions/deals";
import { prisma } from "@/lib/prisma";
import { DealForm } from "@/components/sales/deal-form";
import { Role } from "@prisma/client";

export default async function NewDealPage() {
  await requireRole([Role.MANAGER, Role.ADMIN]);
  const [customers, users] = await Promise.all([
    prisma.customer.findMany({
      where: { isDeleted: false, status: "ACTIVE" },
      select: { id: true, companyName: true },
      orderBy: { companyName: "asc" },
    }),
    prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">商談新規作成</h1>
      <DealForm
        customers={customers}
        users={users}
        action={createDeal}
        submitLabel="作成する"
      />
    </div>
  );
}
