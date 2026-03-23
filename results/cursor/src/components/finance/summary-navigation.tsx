"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  year: number;
  month: number;
}

export function SummaryNavigation({ year, month }: Props) {
  const router = useRouter();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  function navigate(newYear: number, newMonth: number) {
    router.push(`/finance/summary?year=${newYear}&month=${newMonth}`);
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={String(year)}
        onValueChange={(val) => navigate(Number(val), month)}
      >
        <SelectTrigger className="w-24">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}年
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={String(month)}
        onValueChange={(val) => navigate(year, Number(val))}
      >
        <SelectTrigger className="w-20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {months.map((m) => (
            <SelectItem key={m} value={String(m)}>
              {m}月
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
