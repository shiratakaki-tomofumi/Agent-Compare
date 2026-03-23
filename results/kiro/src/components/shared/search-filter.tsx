"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCallback } from "react";

interface FilterOption {
  value: string;
  label: string;
}

interface SearchFilterProps {
  searchPlaceholder?: string;
  filterOptions?: FilterOption[];
  filterParamName?: string;
}

export function SearchFilter({
  searchPlaceholder = "検索...",
  filterOptions,
  filterParamName = "status",
}: SearchFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  return (
    <div className="flex gap-3 flex-wrap">
      <Input
        placeholder={searchPlaceholder}
        defaultValue={searchParams.get("search") ?? ""}
        onChange={(e) => updateParam("search", e.target.value)}
        className="max-w-xs"
      />
      {filterOptions && (
        <Select
          defaultValue={searchParams.get(filterParamName) ?? "ALL"}
          onValueChange={(v) =>
            updateParam(filterParamName, v === "ALL" ? "" : v)
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="すべて" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">すべて</SelectItem>
            {filterOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
