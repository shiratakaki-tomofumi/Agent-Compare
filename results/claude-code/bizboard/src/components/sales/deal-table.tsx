"use client";

import { useRouter } from "next/navigation";
import { DataTable, type Column } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { DEAL_STATUS_LABELS } from "@/lib/constants";

type Deal = Record<string, unknown> & {
  id: string;
  title: string;
  customer: { companyName: string };
  assignee: { name: string };
  amount: number;
  probability: number;
  status: string;
};

const columns: Column<Deal>[] = [
  { header: "商談名", accessor: "title" },
  {
    header: "顧客名",
    accessor: "customer",
    render: (_value, row) => row.customer.companyName,
  },
  {
    header: "金額",
    accessor: "amount",
    render: (value) => `\u00A5${Number(value).toLocaleString("ja-JP")}`,
  },
  {
    header: "確度",
    accessor: "probability",
    render: (value) => `${value}%`,
  },
  {
    header: "ステータス",
    accessor: "status",
    render: (value) => (
      <StatusBadge
        status={String(value)}
        labels={DEAL_STATUS_LABELS}
      />
    ),
  },
  {
    header: "担当者",
    accessor: "assignee",
    render: (_value, row) => row.assignee.name,
  },
];

interface DealTableProps {
  data: Deal[];
}

export function DealTable({ data }: DealTableProps) {
  const router = useRouter();

  return (
    <DataTable
      columns={columns}
      data={data}
      onRowClick={(row) => router.push(`/sales/deals/${row.id}`)}
    />
  );
}
