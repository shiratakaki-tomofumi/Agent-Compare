"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

interface DashboardShellProps {
  user: { name: string; role: string };
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        user={user}
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
      />
      <div className="flex flex-1 flex-col">
        <Header
          userName={user.name}
          onToggleSidebar={() => setSidebarOpen(true)}
        />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
