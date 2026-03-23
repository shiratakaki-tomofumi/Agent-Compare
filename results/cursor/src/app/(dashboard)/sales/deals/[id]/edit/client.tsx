"use client";

import { DealForm } from "@/components/sales/deal-form";
import type { DealInput } from "@/lib/validations";

interface DealEditClientProps {
  dealId: string;
  defaultValues: DealInput;
}

export function DealEditClient({
  dealId,
  defaultValues,
}: DealEditClientProps) {
  return <DealForm dealId={dealId} defaultValues={defaultValues} />;
}
