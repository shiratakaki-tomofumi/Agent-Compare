import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { getCustomer, updateCustomer } from "@/lib/actions/customers";
import { CustomerForm } from "@/components/sales/customer-form";
import { Role } from "@prisma/client";

interface PageProps {
  params: { id: string };
}

export default async function EditCustomerPage({ params }: PageProps) {
  await requireRole([Role.MANAGER, Role.ADMIN]);
  const customer = await getCustomer(params.id);
  if (!customer) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">顧客編集</h1>
      <CustomerForm
        defaultValues={{
          companyName: customer.companyName,
          contactName: customer.contactName,
          email: customer.email,
          phone: customer.phone ?? undefined,
          status: customer.status,
        }}
        action={(fd) => updateCustomer(params.id, fd)}
        submitLabel="更新する"
      />
    </div>
  );
}
