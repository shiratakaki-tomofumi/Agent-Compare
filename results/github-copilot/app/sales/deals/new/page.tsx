import { prisma } from "@/lib/prismadb";
import AppShell from "@/components/AppShell";
import DealForm from "@/components/sales/DealForm";

export default async function DealNewPage() {
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
      <DealForm customers={customers} assignees={assignees} />
    </AppShell>
  );
}
