"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const pathNameMap: Record<string, string> = {
  sales: "営業",
  customers: "顧客",
  deals: "商談",
  projects: "案件",
  finance: "財務",
  expenses: "経費申請",
  approvals: "経費承認",
  summary: "収支サマリー",
  hr: "人事",
  employees: "従業員",
  departments: "部署",
  new: "新規作成",
  edit: "編集",
};

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return null;
  }

  const crumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label = pathNameMap[segment] ?? segment;
    const isLast = index === segments.length - 1;

    return { href, label, isLast };
  });

  return (
    <nav aria-label="パンくずリスト" className="flex items-center gap-1 text-sm text-muted-foreground">
      <Link href="/" className="hover:text-foreground transition-colors">
        ホーム
      </Link>
      {crumbs.map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-1">
          <ChevronRight className="size-3.5" />
          {crumb.isLast ? (
            <span className="text-foreground font-medium">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-foreground transition-colors">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
