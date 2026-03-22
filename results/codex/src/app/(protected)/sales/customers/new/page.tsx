import { CustomerForm } from "@/components/forms";
import { upsertCustomerAction } from "@/lib/actions";
import { requireRole } from "@/lib/auth";

export default async function NewCustomerPage() {
  await requireRole("MANAGER");
  return <CustomerForm action={(payload) => upsertCustomerAction(null, payload)} />;
}
