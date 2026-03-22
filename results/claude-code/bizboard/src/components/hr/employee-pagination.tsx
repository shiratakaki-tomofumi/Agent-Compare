"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface EmployeePaginationProps {
  currentPage: number;
  totalPages: number;
  search: string;
}

export function EmployeePagination({
  currentPage,
  totalPages,
  search,
}: EmployeePaginationProps) {
  function buildHref(page: number) {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return `/hr/employees${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        ページ {currentPage} / {totalPages}
      </p>
      <div className="flex items-center gap-2">
        {currentPage > 1 ? (
          <Link href={buildHref(currentPage - 1)}>
            <Button variant="outline" size="sm">
              <ChevronLeft className="size-4" />
              前へ
            </Button>
          </Link>
        ) : (
          <Button variant="outline" size="sm" disabled>
            <ChevronLeft className="size-4" />
            前へ
          </Button>
        )}
        {currentPage < totalPages ? (
          <Link href={buildHref(currentPage + 1)}>
            <Button variant="outline" size="sm">
              次へ
              <ChevronRight className="size-4" />
            </Button>
          </Link>
        ) : (
          <Button variant="outline" size="sm" disabled>
            次へ
            <ChevronRight className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
