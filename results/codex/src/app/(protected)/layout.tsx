import { redirect } from "next/navigation";

import { AppShell } from "@/components/shell";
import { Breadcrumbs } from "@/components/ui";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <AppShell role={session.user.role} name={session.user.name ?? session.user.email ?? "User"} breadcrumbs={<Breadcrumbs />}>
      {children}
    </AppShell>
  );
}
