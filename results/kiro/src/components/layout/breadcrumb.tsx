"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const pathLabels: Record<string, string> = {
  "": "ダッシュボード",
  sales: "営業",
  customers: "顧客管理",
  deals: "商談管理",
  projects: "案件管理",
  finance: "財務",
  expenses: "経費申請",
  approvals: "経費承認",
  summary: "収支サマリー",
  hr: "人事",
  employees: "従業員管理",
  departments: "部署管理",
  new: "新規作成",
  edit: "編集",
};

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const crumbs = [{ label: "ダッシュボード", href: "/" }];
  let currentPath = "";

  for (const segment of segments) {
    currentPath += `/${segment}`;
    const label = pathLabels[segment] ?? segment;
    // Skip UUID-like segments from label but keep in path
    const isId = /^[0-9a-f-]{36}$/.test(segment);
    if (!isId) {
      crumbs.push({ label, href: currentPath });
    }
  }

  if (crumbs.length <= 1) return null;

  return (
    <nav
      aria-label="パンくずリスト"
      className="flex items-center gap-1 text-sm text-muted-foreground mb-4"
    >
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3 w-3" />}
          {i === crumbs.length - 1 ? (
            <span className="text-foreground font-medium">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="hover:text-foreground transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
