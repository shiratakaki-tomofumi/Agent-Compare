import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CustomerEditClient } from "./client";

interface EditCustomerPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCustomerPage({
  params,
}: EditCustomerPageProps) {
  const { id } = await params;

  const customer = await prisma.customer.findFirst({
    where: { id, isDeleted: false },
  });

  if (!customer) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">顧客編集</h1>
      <CustomerEditClient
        customerId={customer.id}
        defaultValues={{
          companyName: customer.companyName,
          contactName: customer.contactName,
          email: customer.email,
          phone: customer.phone ?? "",
          status: customer.status,
        }}
      />
    </div>
  );
}
