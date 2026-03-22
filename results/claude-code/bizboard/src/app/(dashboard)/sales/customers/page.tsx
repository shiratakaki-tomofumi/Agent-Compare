import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-guard";
import { PAGE_SIZE } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { CustomerFilter } from "@/components/sales/customer-filter";
import { CustomerTable } from "@/components/sales/customer-table";
import { CustomerPagination } from "@/components/sales/customer-pagination";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

interface CustomersPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function CustomersPage({
  searchParams,
}: CustomersPageProps) {
  const params = await searchParams;
  const search = params.search ?? "";
  const status = params.status ?? "";
  const page = Math.max(1, Number(params.page ?? "1"));

  const user = await getSessionUser();
  const canManage =
    user?.role === "ADMIN" || user?.role === "MANAGER";

  const where = {
    isDeleted: false,
    ...(search && {
      OR: [
        { companyName: { contains: search, mode: "insensitive" as const } },
        { contactName: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    ...(status && { status: status as "ACTIVE" | "DORMANT" }),
  };

  const [data, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.customer.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">顧客一覧</h1>
        {canManage && (
          <Link href="/sales/customers/new">
            <Button size="sm">
              <Plus className="mr-1 size-4" />
              新規
            </Button>
          </Link>
        )}
      </div>

      <Suspense>
        <CustomerFilter />
      </Suspense>

      <CustomerTable data={data} />

      <Suspense>
        <CustomerPagination currentPage={page} totalPages={totalPages} />
      </Suspense>
    </div>
  );
}
