import { DealForm } from "@/components/forms";
import { upsertDealAction } from "@/lib/actions";
import { requireRole } from "@/lib/auth";
import { getSelectOptions } from "@/lib/queries";

export default async function NewDealPage() {
  await requireRole("MANAGER");
  const options = await getSelectOptions();

  return (
    <DealForm
      customers={options.customers}
      users={options.users.map((user) => ({ id: user.id, name: user.name }))}
      action={(payload) => upsertDealAction(null, payload)}
    />
  );
}
