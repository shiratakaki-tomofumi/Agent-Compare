import { z } from "zod";

export const customerSchema = z.object({
  companyName: z.string().min(1, "会社名は必須です").max(120),
  contactName: z.string().min(1, "担当者名は必須です").max(80),
  email: z.string().email("メールアドレスの形式が不正です"),
  phone: z.string().max(30).optional().or(z.literal("")),
  status: z.enum(["ACTIVE", "DORMANT"])
});

export const dealSchema = z.object({
  title: z.string().min(1, "商談名は必須です").max(120),
  customerId: z.string().uuid("顧客を選択してください"),
  assigneeId: z.string().uuid("担当者を選択してください"),
  amount: z.coerce.number().int().min(0, "金額は0以上で入力してください"),
  probability: z.coerce.number().int().min(0).max(100),
  status: z.enum(["LEAD", "PROPOSAL", "NEGOTIATION", "WON", "LOST"]),
  note: z.string().max(1000).optional().or(z.literal("")),
  closedAt: z.string().optional().or(z.literal(""))
});

export const projectSchema = z
  .object({
    name: z.string().min(1, "案件名は必須です").max(120),
    description: z.string().max(2000).optional().or(z.literal("")),
    departmentId: z.string().uuid("担当部署を選択してください"),
    status: z.enum(["PLANNING", "IN_PROGRESS", "COMPLETED", "ON_HOLD"]),
    startDate: z.string().min(1, "開始日は必須です"),
    endDate: z.string().min(1, "終了予定日は必須です")
  })
  .refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
    message: "終了予定日は開始日以降で入力してください",
    path: ["endDate"]
  });

export const taskSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(1, "タスク名は必須です").max(120),
  description: z.string().max(1000).optional().or(z.literal("")),
  assigneeId: z.string().uuid().optional().or(z.literal("")),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]),
  dueDate: z.string().optional().or(z.literal(""))
});

export const expenseSchema = z.object({
  amount: z.coerce.number().int().positive("金額を入力してください"),
  category: z.enum(["TRAVEL", "ENTERTAINMENT", "SUPPLIES", "OTHER"]),
  description: z.string().min(1, "説明は必須です").max(300),
  expenseDate: z.string().min(1, "日付は必須です")
});

export const expenseDecisionSchema = z.object({
  expenseId: z.string().uuid(),
  decision: z.enum(["APPROVED", "REJECTED"]),
  approverComment: z.string().min(1, "コメントは必須です").max(500)
});

export const employeeSchema = z.object({
  name: z.string().min(1, "氏名は必須です").max(80),
  email: z.string().email("メールアドレスの形式が不正です"),
  password: z.string().min(8, "パスワードは8文字以上で入力してください").optional().or(z.literal("")),
  role: z.enum(["ADMIN", "MANAGER", "MEMBER"]),
  departmentId: z.string().uuid().optional().or(z.literal("")),
  position: z.string().max(80).optional().or(z.literal("")),
  hireDate: z.string().optional().or(z.literal("")),
  isActive: z.boolean()
});

export const departmentSchema = z.object({
  name: z.string().min(1, "部署名は必須です").max(80),
  description: z.string().max(300).optional().or(z.literal(""))
});
