"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Role } from "@prisma/client";
import { PAGE_SIZE } from "@/lib/constants";
import bcrypt from "bcryptjs";

// Select without password
const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  departmentId: true,
  position: true,
  hireDate: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

const employeeSchema = z.object({
  name: z.string().min(1, "氏名は必須です"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  role: z.nativeEnum(Role),
  departmentId: z.string().optional(),
  position: z.string().optional(),
  hireDate: z.string().optional(),
});

const createEmployeeSchema = employeeSchema.extend({
  password: z.string().min(8, "パスワードは8文字以上で入力してください"),
});

export async function getEmployees(page: number, search: string) {
  await requireAuth();
  const where = {
    isActive: true,
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
  const [employees, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      select: { ...userSelect, department: { select: { name: true } } },
    }),
    prisma.user.count({ where }),
  ]);
  return { employees, total, totalPages: Math.ceil(total / PAGE_SIZE) };
}

export async function getEmployee(id: string) {
  await requireRole([Role.MANAGER, Role.ADMIN]);
  return prisma.user.findUnique({
    where: { id },
    select: { ...userSelect, department: true },
  });
}

export async function createEmployee(formData: FormData) {
  await requireRole([Role.ADMIN]);
  const parsed = createEmployeeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0].message };
  try {
    const { password, departmentId, hireDate, ...rest } = parsed.data;
    const hashed = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: {
        ...rest,
        password: hashed,
        departmentId: departmentId || null,
        hireDate: hireDate ? new Date(hireDate) : null,
      },
    });
    revalidatePath("/hr/employees");
    return { success: true };
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes("Unique constraint")) {
      return { error: "このメールアドレスは既に使用されています" };
    }
    return { error: "作成に失敗しました" };
  }
}

export async function updateEmployee(id: string, formData: FormData) {
  await requireRole([Role.ADMIN]);
  const parsed = employeeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0].message };
  try {
    const { departmentId, hireDate, ...rest } = parsed.data;
    await prisma.user.update({
      where: { id },
      data: {
        ...rest,
        departmentId: departmentId || null,
        hireDate: hireDate ? new Date(hireDate) : null,
      },
    });
    revalidatePath("/hr/employees");
    revalidatePath(`/hr/employees/${id}`);
    return { success: true };
  } catch {
    return { error: "更新に失敗しました" };
  }
}

export async function deleteEmployee(id: string) {
  await requireRole([Role.ADMIN]);
  try {
    await prisma.user.update({ where: { id }, data: { isActive: false } });
    revalidatePath("/hr/employees");
    return { success: true };
  } catch {
    return { error: "削除に失敗しました" };
  }
}

export async function getDepartments() {
  await requireAuth();
  return prisma.department.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { users: { where: { isActive: true } } } } },
  });
}

export async function createDepartment(name: string, description: string) {
  await requireRole([Role.MANAGER, Role.ADMIN]);
  if (!name.trim()) return { error: "部署名は必須です" };
  try {
    await prisma.department.create({
      data: { name: name.trim(), description: description.trim() || undefined },
    });
    revalidatePath("/hr/departments");
    return { success: true };
  } catch {
    return {
      error: "作成に失敗しました（部署名が重複している可能性があります）",
    };
  }
}

export async function updateDepartment(
  id: string,
  name: string,
  description: string,
) {
  await requireRole([Role.MANAGER, Role.ADMIN]);
  if (!name.trim()) return { error: "部署名は必須です" };
  try {
    await prisma.department.update({
      where: { id },
      data: { name: name.trim(), description: description.trim() || undefined },
    });
    revalidatePath("/hr/departments");
    return { success: true };
  } catch {
    return { error: "更新に失敗しました" };
  }
}

export async function deleteDepartment(id: string) {
  await requireRole([Role.MANAGER, Role.ADMIN]);
  try {
    await prisma.department.delete({ where: { id } });
    revalidatePath("/hr/departments");
    return { success: true };
  } catch {
    return {
      error: "削除に失敗しました（所属ユーザーが存在する可能性があります）",
    };
  }
}
