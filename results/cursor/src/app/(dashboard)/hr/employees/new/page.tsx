"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { EmployeeForm } from "@/components/hr/employee-form";

export default function NewEmployeePage() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;
  if (!session?.user) redirect("/login");

  const role = (session.user as { role: string }).role;
  if (role !== "ADMIN") redirect("/hr/employees");

  return <EmployeeForm mode="new" />;
}
