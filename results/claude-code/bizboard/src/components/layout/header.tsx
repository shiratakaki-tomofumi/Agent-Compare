"use client";

import { signOut } from "next-auth/react";
import { LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "./breadcrumb";

interface HeaderProps {
  userName: string;
  onToggleSidebar: () => void;
}

export function Header({ userName, onToggleSidebar }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onToggleSidebar}
        aria-label="メニューを開く"
      >
        <Menu className="size-5" />
      </Button>

      <div className="flex-1">
        <Breadcrumb />
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground hidden sm:inline">
          {userName}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => signOut({ callbackUrl: "/login" })}
          aria-label="ログアウト"
        >
          <LogOut className="size-4" />
        </Button>
      </div>
    </header>
  );
}
