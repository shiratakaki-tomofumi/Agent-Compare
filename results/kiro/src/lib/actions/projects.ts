"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ProjectStatus, TaskPriority, TaskStatus, Role } from "@prisma/client";
import { PAGE_SIZE } from "@/lib/constants";

const projectSchema = z.object({
  name: z.string().min(1, "案件名は必須です"),
  description: z.string().optional(),
  departmentId: z.string().min(1, "担当部署は必須です"),
  status: z.nativeEnum(ProjectStatus),
  startDate: z.string().min(1, "開始日は必須です"),
  endDate: z.string().min(1, "終了予定日は必須です"),
});

const taskSchema = z.object({
  title: z.string().min(1, "タスク名は必須です"),
  description: z.string().optional(),
  assigneeId: z.string().optional(),
  priority: z.nativeEnum(TaskPriority),
  status: z.nativeEnum(TaskStatus),
  dueDate: z.string().optional(),
});

export async function getProjects(
  page: number,
  search: string,
  status: string,
) {
  await requireAuth();
  const where = {
    isDeleted: false,
    ...(search
      ? { name: { contains: search, mode: "insensitive" as const } }
      : {}),
    ...(status && status !== "ALL" ? { status: status as ProjectStatus } : {}),
  };
  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      include: {
        department: { select: { name: true } },
        _count: { select: { tasks: true } },
        tasks: { select: { status: true } },
      },
    }),
    prisma.project.count({ where }),
  ]);
  return { projects, total, totalPages: Math.ceil(total / PAGE_SIZE) };
}

export async function getProject(id: string) {
  await requireAuth();
  return prisma.project.findFirst({
    where: { id, isDeleted: false },
    include: {
      department: true,
      tasks: {
        include: { assignee: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function createProject(formData: FormData) {
  await requireRole([Role.MANAGER, Role.ADMIN]);
  const parsed = projectSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0].message };
  try {
    await prisma.project.create({
      data: {
        ...parsed.data,
        startDate: new Date(parsed.data.startDate),
        endDate: new Date(parsed.data.endDate),
      },
    });
    revalidatePath("/projects");
    return { success: true };
  } catch {
    return { error: "作成に失敗しました" };
  }
}

export async function updateProject(id: string, formData: FormData) {
  await requireRole([Role.MANAGER, Role.ADMIN]);
  const parsed = projectSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0].message };
  try {
    await prisma.project.update({
      where: { id },
      data: {
        ...parsed.data,
        startDate: new Date(parsed.data.startDate),
        endDate: new Date(parsed.data.endDate),
      },
    });
    revalidatePath("/projects");
    revalidatePath(`/projects/${id}`);
    return { success: true };
  } catch {
    return { error: "更新に失敗しました" };
  }
}

export async function deleteProject(id: string) {
  await requireRole([Role.MANAGER, Role.ADMIN]);
  try {
    await prisma.project.update({ where: { id }, data: { isDeleted: true } });
    revalidatePath("/projects");
    return { success: true };
  } catch {
    return { error: "削除に失敗しました" };
  }
}

export async function createTask(projectId: string, formData: FormData) {
  await requireAuth();
  const parsed = taskSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0].message };
  try {
    const { assigneeId, dueDate, ...rest } = parsed.data;
    await prisma.task.create({
      data: {
        ...rest,
        projectId,
        assigneeId: assigneeId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });
    revalidatePath(`/projects/${projectId}`);
    return { success: true };
  } catch {
    return { error: "作成に失敗しました" };
  }
}

export async function updateTask(
  taskId: string,
  projectId: string,
  formData: FormData,
) {
  await requireAuth();
  const parsed = taskSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0].message };
  try {
    const { assigneeId, dueDate, ...rest } = parsed.data;
    await prisma.task.update({
      where: { id: taskId },
      data: {
        ...rest,
        assigneeId: assigneeId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });
    revalidatePath(`/projects/${projectId}`);
    return { success: true };
  } catch {
    return { error: "更新に失敗しました" };
  }
}

export async function deleteTask(taskId: string, projectId: string) {
  await requireAuth();
  try {
    await prisma.task.delete({ where: { id: taskId } });
    revalidatePath(`/projects/${projectId}`);
    return { success: true };
  } catch {
    return { error: "削除に失敗しました" };
  }
}
