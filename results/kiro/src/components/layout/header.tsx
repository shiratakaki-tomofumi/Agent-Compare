"use client";

import { signOut } from "next-auth/react";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS } from "@/lib/constants";
import { Role } from "@prisma/client";

interface HeaderProps {
  userName: string;
  userRole: Role;
}

export function Header({ userName, userRole }: HeaderProps) {
  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="md:hidden w-10" /> {/* spacer for mobile menu button */}
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{userName}</span>
          <span className="text-muted-foreground text-xs">
            ({ROLE_LABELS[userRole]})
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          ログアウト
        </Button>
      </div>
    </header>
  );
}
