"use client";

import { CustomerForm } from "@/components/sales/customer-form";

export default function NewCustomerPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">顧客登録</h1>
      <CustomerForm />
    </div>
  );
}
