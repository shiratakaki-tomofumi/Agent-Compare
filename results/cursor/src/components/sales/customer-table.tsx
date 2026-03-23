"use client";

import { useRouter } from "next/navigation";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { CUSTOMER_STATUS_LABELS } from "@/lib/constants";

type Customer = Record<string, unknown> & {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  status: string;
};

const columns: Column<Customer>[] = [
  { header: "会社名", accessor: "companyName" },
  { header: "担当者名", accessor: "contactName" },
  { header: "メール", accessor: "email" },
  {
    header: "ステータス",
    accessor: "status",
    render: (value) => (
      <StatusBadge
        status={String(value)}
        labels={CUSTOMER_STATUS_LABELS}
      />
    ),
  },
];

interface CustomerTableProps {
  data: Customer[];
}

export function CustomerTable({ data }: CustomerTableProps) {
  const router = useRouter();

  return (
    <DataTable
      columns={columns}
      data={data}
      onRowClick={(row) => router.push(`/sales/customers/${row.id}`)}
    />
  );
}
