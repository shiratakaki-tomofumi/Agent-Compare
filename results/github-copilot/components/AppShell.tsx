"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

const menu = [
  { label: "Dashboard", href: "/" },
  { label: "顧客", href: "/sales/customers" },
  { label: "商談", href: "/sales/deals" },
  { label: "案件", href: "/projects" },
  { label: "経費", href: "/finance/expenses" },
  { label: "承認", href: "/finance/approvals" },
  { label: "従業員", href: "/hr/employees" },
  { label: "部署", href: "/hr/departments" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const activeRole = (session?.user as any)?.role as string | undefined;

  const filteredMenu = useMemo(() => {
    if (!activeRole) return menu;
    if (activeRole === "MEMBER") {
      return menu.filter((item) => !["部署", "承認"].includes(item.label));
    }
    if (activeRole === "MANAGER") {
      return menu.filter((item) => item.label !== "部署");
    }
    return menu;
  }, [activeRole]);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 shadow-sm">
        <div className="text-lg font-bold">BizBoard</div>
        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              <span>{session.user.name}</span>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="rounded-md border border-zinc-300 px-2 py-1 text-sm hover:bg-zinc-100"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm text-blue-600 hover:underline"
            >
              Login
            </Link>
          )}
        </div>
      </header>
      <div className="flex">
        <aside className="w-64 border-r border-zinc-200 bg-white p-4">
          <nav className="space-y-2">
            {filteredMenu.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-md px-3 py-2 text-sm ${pathname === item.href ? "bg-blue-500 text-white" : "text-zinc-700 hover:bg-zinc-100"}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
