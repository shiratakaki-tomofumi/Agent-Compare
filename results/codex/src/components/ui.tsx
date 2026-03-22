"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type ReactNode, useMemo, useTransition } from "react";
import { toast } from "sonner";

import {
  CUSTOMER_STATUS_LABELS,
  DEAL_STATUS_LABELS,
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_STATUS_LABELS,
  PROJECT_STATUS_LABELS,
  ROLE_LABELS,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS
} from "@/lib/constants";
import { cn } from "@/lib/utils";

type ActionResult = {
  success: boolean;
  message: string;
  redirectTo?: string;
};

export function Panel({
  title,
  description,
  action,
  children,
  className
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-3xl border border-white/70 bg-white/90 p-6 shadow-panel backdrop-blur",
        className
      )}
    >
      {(title || description || action) && (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {title && <h2 className="font-heading text-xl font-semibold text-ink">{title}</h2>}
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function PageHeader({
  title,
  description,
  action
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-ocean">BizBoard</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold text-ink">{title}</h1>
        {description && <p className="mt-2 max-w-3xl text-sm text-slate-600">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function KPIStat({
  label,
  value,
  helper
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="rounded-3xl border border-white/80 bg-slate-950/95 p-5 text-white shadow-panel">
      <p className="text-sm text-slate-300">{label}</p>
      <p className="mt-4 font-heading text-3xl font-semibold">{value}</p>
      {helper && <p className="mt-2 text-xs text-slate-400">{helper}</p>}
    </div>
  );
}

export function EmptyState({
  title = "データがありません",
  description
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
      <p className="font-medium text-slate-700">{title}</p>
      {description && <p className="mt-2 text-sm text-slate-500">{description}</p>}
    </div>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div>
      <div className="h-2 rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full bg-ocean transition-all"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-slate-500">{value}% 完了</p>
    </div>
  );
}

const badgeMap = {
  ACTIVE: "bg-emerald-50 text-emerald-700",
  DORMANT: "bg-slate-100 text-slate-600",
  LEAD: "bg-sky-50 text-sky-700",
  PROPOSAL: "bg-indigo-50 text-indigo-700",
  NEGOTIATION: "bg-amber-50 text-amber-700",
  WON: "bg-emerald-50 text-emerald-700",
  LOST: "bg-rose-50 text-rose-700",
  PLANNING: "bg-slate-100 text-slate-700",
  IN_PROGRESS: "bg-sky-50 text-sky-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  ON_HOLD: "bg-amber-50 text-amber-700",
  TODO: "bg-slate-100 text-slate-700",
  REVIEW: "bg-violet-50 text-violet-700",
  DONE: "bg-emerald-50 text-emerald-700",
  LOW: "bg-slate-100 text-slate-700",
  MEDIUM: "bg-amber-50 text-amber-700",
  HIGH: "bg-rose-50 text-rose-700",
  PENDING: "bg-amber-50 text-amber-700",
  APPROVED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-rose-50 text-rose-700",
  ADMIN: "bg-rose-50 text-rose-700",
  MANAGER: "bg-sky-50 text-sky-700",
  MEMBER: "bg-slate-100 text-slate-700",
  TRAVEL: "bg-sky-50 text-sky-700",
  ENTERTAINMENT: "bg-orange-50 text-orange-700",
  SUPPLIES: "bg-emerald-50 text-emerald-700",
  OTHER: "bg-slate-100 text-slate-700"
} as const;

export function StatusBadge({ value }: { value: keyof typeof badgeMap }) {
  const label =
    CUSTOMER_STATUS_LABELS[value as keyof typeof CUSTOMER_STATUS_LABELS] ??
    DEAL_STATUS_LABELS[value as keyof typeof DEAL_STATUS_LABELS] ??
    PROJECT_STATUS_LABELS[value as keyof typeof PROJECT_STATUS_LABELS] ??
    TASK_STATUS_LABELS[value as keyof typeof TASK_STATUS_LABELS] ??
    TASK_PRIORITY_LABELS[value as keyof typeof TASK_PRIORITY_LABELS] ??
    EXPENSE_STATUS_LABELS[value as keyof typeof EXPENSE_STATUS_LABELS] ??
    EXPENSE_CATEGORY_LABELS[value as keyof typeof EXPENSE_CATEGORY_LABELS] ??
    ROLE_LABELS[value as keyof typeof ROLE_LABELS] ??
    value;

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-medium",
        badgeMap[value]
      )}
    >
      {label}
    </span>
  );
}

export function DataTable({
  headers,
  children
}: {
  headers: string[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">{children}</tbody>
      </table>
    </div>
  );
}

export function Pagination({
  page,
  totalPages
}: {
  page: number;
  totalPages: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updatePage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={() => updatePage(page - 1)}
        disabled={page <= 1}
        className="rounded-full border border-slate-300 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
      >
        前へ
      </button>
      <span className="text-sm text-slate-600">
        {page} / {totalPages}
      </span>
      <button
        type="button"
        onClick={() => updatePage(page + 1)}
        disabled={page >= totalPages}
        className="rounded-full border border-slate-300 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
      >
        次へ
      </button>
    </div>
  );
}

export function SearchToolbar({
  searchPlaceholder,
  statusOptions,
  createHref,
  createLabel,
  children
}: {
  searchPlaceholder: string;
  statusOptions?: { value: string; label: string }[];
  createHref?: string;
  createLabel?: string;
  children?: ReactNode;
}) {
  const searchParams = useSearchParams();
  return (
    <form className="grid gap-3 lg:grid-cols-[1fr_220px_auto_auto]">
      <input
        name="query"
        placeholder={searchPlaceholder}
        defaultValue={searchParams.get("query") ?? ""}
        className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
      />
      {statusOptions ? (
        <select
          name="status"
          defaultValue={searchParams.get("status") ?? ""}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
        >
          <option value="">すべて</option>
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <div />
      )}
      {children}
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white"
        >
          検索
        </button>
        {createHref && createLabel && (
          <Link
            href={createHref}
            className="rounded-full border border-slate-300 px-5 py-3 text-sm font-medium"
          >
            {createLabel}
          </Link>
        )}
      </div>
    </form>
  );
}

export function DescriptionList({
  items
}: {
  items: { label: string; value: ReactNode }[];
}) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl bg-slate-50 p-4">
          <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">{item.label}</dt>
          <dd className="mt-2 text-sm text-slate-800">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const items = useMemo(() => {
    if (pathname === "/") {
      return [{ href: "/", label: "ダッシュボード" }];
    }

    const segments = pathname.split("/").filter(Boolean);
    return segments.map((segment, index) => {
      const href = `/${segments.slice(0, index + 1).join("/")}`;
      const labelMap: Record<string, string> = {
        sales: "営業",
        customers: "顧客",
        deals: "商談",
        projects: "案件",
        finance: "財務",
        expenses: "経費",
        approvals: "承認",
        summary: "収支サマリー",
        hr: "人事",
        employees: "従業員",
        departments: "部署",
        new: "新規作成",
        edit: "編集"
      };

      const label = labelMap[segment] ?? segment;
      return { href, label };
    });
  }, [pathname]);

  return (
    <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
      <Link href="/" className="text-slate-600">
        ホーム
      </Link>
      {items.map((item) => (
        <span key={item.href} className="flex items-center gap-2">
          <span>/</span>
          <Link href={item.href} className="text-slate-600">
            {item.label}
          </Link>
        </span>
      ))}
    </nav>
  );
}

export function MutationButton({
  label,
  action,
  variant = "primary",
  confirmMessage,
  refreshOnly = false
}: {
  label: string;
  action: () => Promise<ActionResult>;
  variant?: "primary" | "danger" | "secondary";
  confirmMessage?: string;
  refreshOnly?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const styles = {
    primary: "bg-slate-950 text-white",
    danger: "bg-rose-600 text-white",
    secondary: "border border-slate-300 text-slate-700"
  } as const;

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (confirmMessage && !window.confirm(confirmMessage)) {
          return;
        }

        startTransition(async () => {
          const result = await action();
          if (result.success) {
            toast.success(result.message);
            if (result.redirectTo) {
              router.push(result.redirectTo);
            } else if (refreshOnly) {
              router.refresh();
            } else {
              router.refresh();
            }
            return;
          }

          toast.error(result.message);
        });
      }}
      className={cn(
        "rounded-full px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60",
        styles[variant]
      )}
    >
      {isPending ? "処理中..." : label}
    </button>
  );
}
