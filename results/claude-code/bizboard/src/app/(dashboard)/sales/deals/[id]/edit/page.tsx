import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { DealEditClient } from "./client";

interface EditDealPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditDealPage({ params }: EditDealPageProps) {
  const { id } = await params;

  const deal = await prisma.deal.findUnique({
    where: { id },
  });

  if (!deal) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">商談編集</h1>
      <DealEditClient
        dealId={deal.id}
        defaultValues={{
          title: deal.title,
          customerId: deal.customerId,
          assigneeId: deal.assigneeId,
          amount: deal.amount,
          probability: deal.probability,
          status: deal.status,
          note: deal.note ?? "",
        }}
      />
    </div>
  );
}
