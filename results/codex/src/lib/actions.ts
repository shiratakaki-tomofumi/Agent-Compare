"use server";

import { hash } from "bcryptjs";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole, requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  customerSchema,
  dealSchema,
  departmentSchema,
  employeeSchema,
  expenseDecisionSchema,
  expenseSchema,
  projectSchema,
  taskSchema
} from "@/lib/validators";

type ActionResult = {
  success: boolean;
  message: string;
  redirectTo?: string;
};

function ok(message: string, redirectTo?: string): ActionResult {
  return { success: true, message, redirectTo };
}

function fail(message: string): ActionResult {
  return { success: false, message };
}

function handleError(error: unknown): ActionResult {
  if (error instanceof z.ZodError) {
    return fail(error.issues[0]?.message ?? "入力内容を確認してください");
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return fail("一意制約に違反しています。既存データを確認してください");
    }
    return fail("データベース処理に失敗しました");
  }

  if (error instanceof Error) {
    return fail(error.message);
  }

  return fail("処理に失敗しました");
}

function toNullableString(value: string | undefined) {
  return value && value.length > 0 ? value : null;
}

function toNullableDate(value: string | undefined) {
  return value && value.length > 0 ? new Date(value) : null;
}

export async function upsertCustomerAction(
  customerId: string | null,
  payload: unknown
): Promise<ActionResult> {
  try {
    await requireRole("MANAGER");
    const values = customerSchema.parse(payload);

    const data = {
      companyName: values.companyName,
      contactName: values.contactName,
      email: values.email,
      phone: toNullableString(values.phone),
      status: values.status
    };

    if (customerId) {
      await prisma.customer.update({
        where: { id: customerId },
        data
      });
      revalidatePath("/sales/customers");
      revalidatePath(`/sales/customers/${customerId}`);
      revalidatePath(`/sales/customers/${customerId}/edit`);
      return ok("顧客情報を更新しました", `/sales/customers/${customerId}`);
    }

    const created = await prisma.customer.create({ data });
    revalidatePath("/sales/customers");
    revalidatePath("/");
    return ok("顧客を登録しました", `/sales/customers/${created.id}`);
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteCustomerAction(customerId: string): Promise<ActionResult> {
  try {
    await requireRole("MANAGER");
    await prisma.customer.update({
      where: { id: customerId },
      data: { isDeleted: true }
    });
    revalidatePath("/sales/customers");
    revalidatePath("/");
    return ok("顧客を削除しました", "/sales/customers");
  } catch (error) {
    return handleError(error);
  }
}

export async function upsertDealAction(
  dealId: string | null,
  payload: unknown
): Promise<ActionResult> {
  try {
    await requireRole("MANAGER");
    const values = dealSchema.parse(payload);
    const isClosed = values.status === "WON" || values.status === "LOST";

    const data = {
      title: values.title,
      customerId: values.customerId,
      assigneeId: values.assigneeId,
      amount: values.amount,
      probability: values.probability,
      status: values.status,
      note: toNullableString(values.note),
      closedAt: isClosed ? toNullableDate(values.closedAt) ?? new Date() : null
    };

    if (dealId) {
      await prisma.deal.update({ where: { id: dealId }, data });
      revalidatePath("/sales/deals");
      revalidatePath(`/sales/deals/${dealId}`);
      return ok("商談を更新しました", `/sales/deals/${dealId}`);
    }

    const created = await prisma.deal.create({ data });
    revalidatePath("/sales/deals");
    revalidatePath("/");
    return ok("商談を作成しました", `/sales/deals/${created.id}`);
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteDealAction(dealId: string): Promise<ActionResult> {
  try {
    await requireRole("MANAGER");
    await prisma.deal.delete({ where: { id: dealId } });
    revalidatePath("/sales/deals");
    revalidatePath("/");
    return ok("商談を削除しました", "/sales/deals");
  } catch (error) {
    return handleError(error);
  }
}

export async function updateDealStatusAction(
  dealId: string,
  status: "LEAD" | "PROPOSAL" | "NEGOTIATION" | "WON" | "LOST"
): Promise<ActionResult> {
  try {
    await requireRole("MANAGER");
    await prisma.deal.update({
      where: { id: dealId },
      data: {
        status,
        closedAt: status === "WON" || status === "LOST" ? new Date() : null
      }
    });
    revalidatePath("/sales/deals");
    revalidatePath(`/sales/deals/${dealId}`);
    revalidatePath("/");
    return ok("商談ステータスを更新しました");
  } catch (error) {
    return handleError(error);
  }
}

export async function upsertProjectAction(
  projectId: string | null,
  payload: unknown
): Promise<ActionResult> {
  try {
    await requireRole("MANAGER");
    const values = projectSchema.parse(payload);
    const data = {
      name: values.name,
      description: toNullableString(values.description),
      departmentId: values.departmentId,
      status: values.status,
      startDate: new Date(values.startDate),
      endDate: new Date(values.endDate)
    };

    if (projectId) {
      await prisma.project.update({ where: { id: projectId }, data });
      revalidatePath("/projects");
      revalidatePath(`/projects/${projectId}`);
      return ok("案件を更新しました", `/projects/${projectId}`);
    }

    const created = await prisma.project.create({ data });
    revalidatePath("/projects");
    revalidatePath("/");
    return ok("案件を登録しました", `/projects/${created.id}`);
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteProjectAction(projectId: string): Promise<ActionResult> {
  try {
    await requireRole("MANAGER");
    await prisma.project.update({
      where: { id: projectId },
      data: { isDeleted: true }
    });
    revalidatePath("/projects");
    revalidatePath("/");
    return ok("案件を削除しました", "/projects");
  } catch (error) {
    return handleError(error);
  }
}

export async function upsertTaskAction(taskId: string | null, payload: unknown): Promise<ActionResult> {
  try {
    await requireRole("MANAGER");
    const values = taskSchema.parse(payload);
    const data = {
      projectId: values.projectId,
      title: values.title,
      description: toNullableString(values.description),
      assigneeId: toNullableString(values.assigneeId),
      priority: values.priority,
      status: values.status,
      dueDate: toNullableDate(values.dueDate)
    };

    if (taskId) {
      await prisma.task.update({ where: { id: taskId }, data });
      revalidatePath(`/projects/${values.projectId}`);
      revalidatePath("/projects");
      return ok("タスクを更新しました");
    }

    await prisma.task.create({ data });
    revalidatePath(`/projects/${values.projectId}`);
    revalidatePath("/projects");
    return ok("タスクを追加しました");
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteTaskAction(taskId: string, projectId: string): Promise<ActionResult> {
  try {
    await requireRole("MANAGER");
    await prisma.task.delete({ where: { id: taskId } });
    revalidatePath(`/projects/${projectId}`);
    revalidatePath("/projects");
    return ok("タスクを削除しました");
  } catch (error) {
    return handleError(error);
  }
}

export async function upsertExpenseAction(
  expenseId: string | null,
  payload: unknown
): Promise<ActionResult> {
  try {
    const session = await requireSession();
    const values = expenseSchema.parse(payload);

    if (expenseId) {
      const target = await prisma.expense.findUnique({ where: { id: expenseId } });
      if (!target || target.applicantId !== session.user.id || target.status !== "PENDING") {
        return fail("未承認の自分の申請のみ編集できます");
      }

      await prisma.expense.update({
        where: { id: expenseId },
        data: {
          amount: values.amount,
          category: values.category,
          description: values.description,
          expenseDate: new Date(values.expenseDate)
        }
      });
      revalidatePath("/finance/expenses");
      revalidatePath("/");
      return ok("経費申請を更新しました", "/finance/expenses");
    }

    await prisma.expense.create({
      data: {
        applicantId: session.user.id,
        amount: values.amount,
        category: values.category,
        description: values.description,
        expenseDate: new Date(values.expenseDate)
      }
    });
    revalidatePath("/finance/expenses");
    revalidatePath("/finance/approvals");
    revalidatePath("/");
    return ok("経費申請を作成しました", "/finance/expenses");
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteExpenseAction(expenseId: string): Promise<ActionResult> {
  try {
    const session = await requireSession();
    const target = await prisma.expense.findUnique({ where: { id: expenseId } });
    if (!target || target.applicantId !== session.user.id || target.status !== "PENDING") {
      return fail("未承認の自分の申請のみ削除できます");
    }

    await prisma.expense.delete({ where: { id: expenseId } });
    revalidatePath("/finance/expenses");
    revalidatePath("/finance/approvals");
    revalidatePath("/");
    return ok("経費申請を削除しました", "/finance/expenses");
  } catch (error) {
    return handleError(error);
  }
}

export async function decideExpenseAction(payload: unknown): Promise<ActionResult> {
  try {
    const session = await requireRole("MANAGER");
    const values = expenseDecisionSchema.parse(payload);
    await prisma.expense.update({
      where: { id: values.expenseId },
      data: {
        status: values.decision,
        approverId: session.user.id,
        approverComment: values.approverComment,
        approvedAt: new Date()
      }
    });
    revalidatePath("/finance/approvals");
    revalidatePath("/finance/expenses");
    revalidatePath("/finance/summary");
    revalidatePath("/");
    return ok(values.decision === "APPROVED" ? "経費を承認しました" : "経費を却下しました");
  } catch (error) {
    return handleError(error);
  }
}

export async function upsertEmployeeAction(
  employeeId: string | null,
  payload: unknown
): Promise<ActionResult> {
  try {
    await requireRole("ADMIN");
    const values = employeeSchema.parse(payload);

    if (!employeeId && !values.password) {
      return fail("新規作成時はパスワードが必須です");
    }

    const data = {
      name: values.name,
      email: values.email,
      role: values.role,
      departmentId: toNullableString(values.departmentId),
      position: toNullableString(values.position),
      hireDate: toNullableDate(values.hireDate),
      isActive: values.isActive,
      ...(values.password ? { password: await hash(values.password, 12) } : {})
    };

    if (employeeId) {
      await prisma.user.update({ where: { id: employeeId }, data });
      revalidatePath("/hr/employees");
      revalidatePath(`/hr/employees/${employeeId}`);
      return ok("従業員情報を更新しました", `/hr/employees/${employeeId}`);
    }

    const created = await prisma.user.create({
      data: {
        ...data,
        password: data.password ?? ""
      }
    });
    revalidatePath("/hr/employees");
    revalidatePath("/");
    return ok("従業員を登録しました", `/hr/employees/${created.id}`);
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteEmployeeAction(employeeId: string): Promise<ActionResult> {
  try {
    await requireRole("ADMIN");
    await prisma.user.update({
      where: { id: employeeId },
      data: { isActive: false }
    });
    revalidatePath("/hr/employees");
    revalidatePath("/");
    return ok("従業員を無効化しました", "/hr/employees");
  } catch (error) {
    return handleError(error);
  }
}

export async function upsertDepartmentAction(
  departmentId: string | null,
  payload: unknown
): Promise<ActionResult> {
  try {
    await requireRole("MANAGER");
    const values = departmentSchema.parse(payload);

    if (departmentId) {
      await prisma.department.update({
        where: { id: departmentId },
        data: {
          name: values.name,
          description: toNullableString(values.description)
        }
      });
      revalidatePath("/hr/departments");
      revalidatePath("/projects");
      revalidatePath("/hr/employees");
      return ok("部署を更新しました");
    }

    await prisma.department.create({
      data: {
        name: values.name,
        description: toNullableString(values.description)
      }
    });
    revalidatePath("/hr/departments");
    revalidatePath("/projects");
    revalidatePath("/hr/employees");
    return ok("部署を追加しました");
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteDepartmentAction(departmentId: string): Promise<ActionResult> {
  try {
    await requireRole("MANAGER");
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      include: {
        _count: {
          select: { users: { where: { isActive: true } }, projects: { where: { isDeleted: false } } }
        }
      }
    });

    if (!department) {
      return fail("部署が見つかりません");
    }

    if (department._count.users > 0 || department._count.projects > 0) {
      return fail("所属従業員または案件がある部署は削除できません");
    }

    await prisma.department.delete({ where: { id: departmentId } });
    revalidatePath("/hr/departments");
    revalidatePath("/projects");
    revalidatePath("/hr/employees");
    return ok("部署を削除しました");
  } catch (error) {
    return handleError(error);
  }
}
