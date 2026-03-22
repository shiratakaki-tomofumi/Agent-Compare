import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-guard";
import { PAGE_SIZE } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { DealFilter } from "@/components/sales/deal-filter";
import { DealTable } from "@/components/sales/deal-table";
import { DealPagination } from "@/components/sales/deal-pagination";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

interface DealsPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function DealsPage({ searchParams }: DealsPageProps) {
  const params = await searchParams;
  const search = params.search ?? "";
  const status = params.status ?? "";
  const page = Math.max(1, Number(params.page ?? "1"));

  const user = await getSessionUser();
  const canManage =
    user?.role === "ADMIN" || user?.role === "MANAGER";

  const where = {
    ...(search && {
      title: { contains: search, mode: "insensitive" as const },
    }),
    ...(status && {
      status: status as
        | "LEAD"
        | "PROPOSAL"
        | "NEGOTIATION"
        | "WON"
        | "LOST",
    }),
  };

  const [data, total] = await Promise.all([
    prisma.deal.findMany({
      where,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        customer: true,
        assignee: { select: { id: true, name: true, email: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.deal.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">商談一覧</h1>
        {canManage && (
          <Link href="/sales/deals/new">
            <Button size="sm">
              <Plus className="mr-1 size-4" />
              新規
            </Button>
          </Link>
        )}
      </div>

      <Suspense>
        <DealFilter />
      </Suspense>

      <DealTable data={data} />

      <Suspense>
        <DealPagination currentPage={page} totalPages={totalPages} />
      </Suspense>
    </div>
  );
}
