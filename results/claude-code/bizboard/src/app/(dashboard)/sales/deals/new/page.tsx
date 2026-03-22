"use client";

import { DealForm } from "@/components/sales/deal-form";

export default function NewDealPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">商談登録</h1>
      <DealForm />
    </div>
  );
}
