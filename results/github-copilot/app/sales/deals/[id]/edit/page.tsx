import { prisma } from "@/lib/prismadb";
import AppShell from "@/components/AppShell";
import DealForm from "@/components/sales/DealForm";

type Params = { params: { id: string } };

export default async function DealEditPage({ params }: Params) {
  const deal = await prisma.deal.findUnique({
    where: { id: params.id },
    include: { customer: true, assignee: true },
  });

  if (!deal) {
    return (
      <AppShell>
        <div>商談が見つかりません</div>
      </AppShell>
    );
  }

  const customers = await prisma.customer.findMany({
    where: { isDeleted: false },
    orderBy: { companyName: "asc" },
  });
  const assignees = await prisma.user.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <AppShell>
      <DealForm
        customers={customers}
        assignees={assignees}
        initial={{
          title: deal.title,
          customerId: deal.customerId,
          assigneeId: deal.assigneeId,
          amount: deal.amount,
          probability: deal.probability,
          status: deal.status,
          note: deal.note ?? "",
        }}
        id={deal.id}
      />
    </AppShell>
  );
}
