"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { type ReactNode, useMemo, useState } from "react";

import { canAdmin, canManage } from "@/lib/permissions";
import { cn } from "@/lib/utils";

type AppShellProps = {
  role: "ADMIN" | "MANAGER" | "MEMBER";
  name: string;
  children: ReactNode;
  breadcrumbs: ReactNode;
};

export function AppShell({ role, name, children, breadcrumbs }: AppShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navItems = useMemo(() => {
    const items = [
      { href: "/", label: "Dashboard" },
      { href: "/sales/customers", label: "Sales / 顧客" },
      { href: "/sales/deals", label: "Sales / 商談" },
      { href: "/projects", label: "Projects" },
      { href: "/finance/expenses", label: "Finance / 経費" },
      { href: "/hr/employees", label: "HR / 従業員" }
    ];

    if (canManage(role)) {
      items.push({ href: "/finance/approvals", label: "Finance / 承認" });
      items.push({ href: "/finance/summary", label: "Finance / 収支" });
      items.push({ href: "/hr/departments", label: "HR / 部署" });
    }

    if (canAdmin(role)) {
      items.push({ href: "/hr/employees/new", label: "HR / 新規従業員" });
    }

    return items;
  }, [role]);

  return (
    <div className="min-h-screen bg-sand bg-dashboard-grid bg-[size:28px_28px]">
      <div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[280px_1fr]">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-30 w-[280px] border-r border-white/60 bg-slate-950 px-6 py-8 text-white shadow-2xl transition-transform lg:static lg:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">BizBoard</p>
              <h1 className="mt-3 font-heading text-2xl font-semibold">Operations Cockpit</h1>
            </div>
            <button type="button" className="lg:hidden" onClick={() => setOpen(false)}>
              閉じる
            </button>
          </div>
          <nav className="mt-10 space-y-2">
            {navItems.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block rounded-2xl px-4 py-3 text-sm transition",
                    active
                      ? "bg-white text-slate-950"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto pt-10">
            <div className="rounded-3xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Signed in</p>
              <p className="mt-2 font-medium">{name}</p>
              <p className="text-sm text-slate-300">{role}</p>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="mt-4 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-950"
              >
                Logout
              </button>
            </div>
          </div>
        </aside>

        {open && (
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-20 bg-slate-950/30 lg:hidden"
          />
        )}

        <main className="min-w-0 px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
          <div className="rounded-[32px] border border-white/70 bg-white/70 p-4 shadow-panel backdrop-blur sm:p-6">
            <header className="mb-6 flex flex-col gap-4 border-b border-slate-200/80 pb-6">
              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm lg:hidden"
                >
                  メニュー
                </button>
                <div className="hidden text-sm text-slate-500 lg:block">業務管理ダッシュボード</div>
                <div className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white">
                  {name}
                </div>
              </div>
              {breadcrumbs}
            </header>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
