"use client";

import { useState } from "react";
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
  Clock,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";

interface SidebarProps {
  user: { name: string; role: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

interface NavGroup {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
}

type NavEntry = NavItem | NavGroup;

function isGroup(entry: NavEntry): entry is NavGroup {
  return "items" in entry;
}

const navigation: NavEntry[] = [
  {
    label: "ダッシュボード",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "営業",
    icon: Handshake,
    items: [
      { label: "顧客", href: "/sales/customers", icon: Users },
      { label: "商談", href: "/sales/deals", icon: Handshake },
    ],
  },
  {
    label: "案件",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    label: "財務",
    icon: Receipt,
    items: [
      { label: "経費申請", href: "/finance/expenses", icon: Receipt },
      {
        label: "経費承認",
        href: "/finance/approvals",
        icon: CheckSquare,
        roles: ["ADMIN", "MANAGER"],
      },
      {
        label: "収支サマリー",
        href: "/finance/summary",
        icon: BarChart3,
        roles: ["ADMIN", "MANAGER"],
      },
    ],
  },
  {
    label: "人事",
    icon: UserCog,
    items: [
      { label: "従業員", href: "/hr/employees", icon: UserCog },
          {
            label: "勤怠サマリー",
            href: "/hr/attendance",
            icon: Clock,
            roles: ["ADMIN", "MANAGER"],
          },
      {
        label: "部署管理",
        href: "/hr/departments",
        icon: Building2,
        roles: ["ADMIN", "MANAGER"],
      },
    ],
  },
];

function NavLink({
  item,
  pathname,
  onClick,
}: {
  item: NavItem;
  pathname: string;
  onClick?: () => void;
}) {
  const isActive =
    item.href === "/"
      ? pathname === "/"
      : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <item.icon className="size-4 shrink-0" />
      {item.label}
    </Link>
  );
}

function CollapsibleGroup({
  group,
  pathname,
  userRole,
  onLinkClick,
}: {
  group: NavGroup;
  pathname: string;
  userRole: string;
  onLinkClick?: () => void;
}) {
  const visibleItems = group.items.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  );

  const isAnyActive = visibleItems.some((item) =>
    pathname.startsWith(item.href)
  );

  const [open, setOpen] = useState(isAnyActive);

  if (visibleItems.length === 0) return null;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          isAnyActive
            ? "text-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <group.icon className="size-4 shrink-0" />
        <span className="flex-1 text-left">{group.label}</span>
        <ChevronDown
          className={cn(
            "size-4 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <div className="ml-4 mt-1 space-y-1 border-l pl-3">
          {visibleItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              pathname={pathname}
              onClick={onLinkClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SidebarContent({
  user,
  onLinkClick,
}: {
  user: { name: string; role: string };
  onLinkClick?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-4">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight"
          onClick={onLinkClick}
        >
          BizBoard
        </Link>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navigation.map((entry) => {
          if (isGroup(entry)) {
            return (
              <CollapsibleGroup
                key={entry.label}
                group={entry}
                pathname={pathname}
                userRole={user.role}
                onLinkClick={onLinkClick}
              />
            );
          }
          if (entry.roles && !entry.roles.includes(user.role)) {
            return null;
          }
          return (
            <NavLink
              key={entry.href}
              item={entry}
              pathname={pathname}
              onClick={onLinkClick}
            />
          );
        })}
      </nav>
    </div>
  );
}

export function Sidebar({ user, open, onOpenChange }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:bg-background h-screen sticky top-0">
        <SidebarContent user={user} />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">ナビゲーション</SheetTitle>
          <SidebarContent
            user={user}
            onLinkClick={() => onOpenChange(false)}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
