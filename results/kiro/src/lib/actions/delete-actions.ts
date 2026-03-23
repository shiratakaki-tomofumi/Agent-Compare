"use server";

import { deleteCustomer } from "@/lib/actions/customers";
import { deleteDeal } from "@/lib/actions/deals";
import { deleteProject } from "@/lib/actions/projects";
import { deleteEmployee } from "@/lib/actions/employees";
import { redirect } from "next/navigation";

export async function deleteCustomerAndRedirect(
  id: string,
): Promise<{ error: string }> {
  const result = await deleteCustomer(id);
  if (result.success) redirect("/sales/customers");
  return { error: result.error ?? "削除に失敗しました" };
}

export async function deleteDealAndRedirect(
  id: string,
): Promise<{ error: string }> {
  const result = await deleteDeal(id);
  if (result.success) redirect("/sales/deals");
  return { error: result.error ?? "削除に失敗しました" };
}

export async function deleteProjectAndRedirect(
  id: string,
): Promise<{ error: string }> {
  const result = await deleteProject(id);
  if (result.success) redirect("/projects");
  return { error: result.error ?? "削除に失敗しました" };
}

export async function deleteEmployeeAndRedirect(
  id: string,
): Promise<{ error: string }> {
  const result = await deleteEmployee(id);
  if (result.success) redirect("/hr/employees");
  return { error: result.error ?? "削除に失敗しました" };
}
