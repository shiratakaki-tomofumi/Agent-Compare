"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Pagination } from "@/components/shared/pagination";

interface CustomerPaginationProps {
  currentPage: number;
  totalPages: number;
}

export function CustomerPagination({
  currentPage,
  totalPages,
}: CustomerPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
    />
  );
}
