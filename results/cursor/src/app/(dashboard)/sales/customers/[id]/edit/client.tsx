"use client";

import { CustomerForm } from "@/components/sales/customer-form";
import type { CustomerInput } from "@/lib/validations";

interface CustomerEditClientProps {
  customerId: string;
  defaultValues: CustomerInput;
}

export function CustomerEditClient({
  customerId,
  defaultValues,
}: CustomerEditClientProps) {
  return <CustomerForm customerId={customerId} defaultValues={defaultValues} />;
}
