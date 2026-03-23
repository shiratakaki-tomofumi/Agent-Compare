"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Handshake,
  FolderKanban,
  Receipt,
  CheckSquare,
  BarChart3,
  UserCog,
  Building2,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Role } from "@prisma/client";
import React, { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: Role[];
}

const navItems: NavItem[] = [
  {
    label: "ダッシュボード",
    href: "/",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    label: "顧客管理",
    href: "/sales/customers",
    icon: <Users className="h-4 w-4" />,
  },
  {
    label: "商談管理",
    href: "/sales/deals",
    icon: <Handshake className="h-4 w-4" />,
  },
  {
    label: "案件管理",
    href: "/projects",
    icon: <FolderKanban className="h-4 w-4" />,
  },
  {
    label: "経費申請",
    href: "/finance/expenses",
    icon: <Receipt className="h-4 w-4" />,
  },
  {
    label: "経費承認",
    href: "/finance/approvals",
    icon: <CheckSquare className="h-4 w-4" />,
    roles: [Role.MANAGER, Role.ADMIN],
  },
  {
    label: "収支サマリー",
    href: "/finance/summary",
    icon: <BarChart3 className="h-4 w-4" />,
    roles: [Role.MANAGER, Role.ADMIN],
  },
  {
    label: "従業員管理",
    href: "/hr/employees",
    icon: <UserCog className="h-4 w-4" />,
  },
  {
    label: "部署管理",
    href: "/hr/departments",
    icon: <Building2 className="h-4 w-4" />,
    roles: [Role.MANAGER, Role.ADMIN],
  },
];

interface SidebarProps {
  userRole: Role;
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(userRole),
  );

  const NavLinks = () => (
    <nav className="flex flex-col gap-1 p-4">
      {visibleItems.map((item) => {
        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed left-4 top-4 z-50 rounded-md p-2 bg-background border md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="メニューを開く"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-full w-64 bg-background border-r transform transition-transform md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center px-4 border-b">
          <span className="text-lg font-bold">BizBoard</span>
        </div>
        <NavLinks />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 border-r bg-background h-screen sticky top-0">
        <div className="flex h-16 items-center px-4 border-b">
          <span className="text-lg font-bold">BizBoard</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          <NavLinks />
        </div>
      </aside>
    </>
  );
}
