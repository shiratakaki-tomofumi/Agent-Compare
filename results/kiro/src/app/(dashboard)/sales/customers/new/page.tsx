import { requireRole } from "@/lib/auth";
import { createCustomer } from "@/lib/actions/customers";
import { CustomerForm } from "@/components/sales/customer-form";
import { Role } from "@prisma/client";

export default async function NewCustomerPage() {
  await requireRole([Role.MANAGER, Role.ADMIN]);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">顧客新規登録</h1>
      <CustomerForm action={createCustomer} submitLabel="登録する" />
    </div>
  );
}
