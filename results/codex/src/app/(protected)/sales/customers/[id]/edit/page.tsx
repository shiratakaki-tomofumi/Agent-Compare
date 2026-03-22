import { notFound } from "next/navigation";

import { CustomerForm } from "@/components/forms";
import { upsertCustomerAction } from "@/lib/actions";
import { requireRole } from "@/lib/auth";
import { getCustomerDetail } from "@/lib/queries";

export default async function EditCustomerPage({ params }: { params: { id: string } }) {
  await requireRole("MANAGER");
  const customer = await getCustomerDetail(params.id);
  if (!customer) {
    notFound();
  }

  return (
    <CustomerForm
      initialValues={{
        companyName: customer.companyName,
        contactName: customer.contactName,
        email: customer.email,
        phone: customer.phone,
        status: customer.status
      }}
      action={(payload) => upsertCustomerAction(customer.id, payload)}
    />
  );
}
