"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface EmployeeSearchProps {
  defaultValue: string;
}

export function EmployeeSearch({ defaultValue }: EmployeeSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [value, setValue] = useState(defaultValue);

  function handleSearch(term: string) {
    setValue(term);
    const params = new URLSearchParams(searchParams.toString());
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    params.delete("page");
    startTransition(() => {
      router.push(`/hr/employees?${params.toString()}`);
    });
  }

  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="氏名またはメールで検索..."
        value={value}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-8"
      />
    </div>
  );
}
