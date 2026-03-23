import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Role } from "@prisma/client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar userRole={session.user.role as Role} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header
          userName={session.user.name}
          userRole={session.user.role as Role}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <Breadcrumb />
          {children}
        </main>
      </div>
    </div>
  );
}
