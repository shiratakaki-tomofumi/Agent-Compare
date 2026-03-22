import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(1, "パスワードを入力してください"),
});

export const customerSchema = z.object({
  companyName: z.string().min(1, "会社名は必須です"),
  contactName: z.string().min(1, "担当者名は必須です"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  phone: z.string().optional(),
  status: z.enum(["ACTIVE", "DORMANT"]),
});

export const dealSchema = z.object({
  title: z.string().min(1, "商談名は必須です"),
  customerId: z.string().min(1, "顧客を選択してください"),
  assigneeId: z.string().min(1, "担当者を選択してください"),
  amount: z.coerce.number().int().min(0, "金額は0以上で入力してください"),
  probability: z.coerce.number().int().min(0).max(100, "確度は0〜100で入力してください"),
  status: z.enum(["LEAD", "PROPOSAL", "NEGOTIATION", "WON", "LOST"]),
  note: z.string().optional(),
});

export const projectSchema = z.object({
  name: z.string().min(1, "案件名は必須です"),
  description: z.string().optional(),
  departmentId: z.string().min(1, "担当部署を選択してください"),
  status: z.enum(["PLANNING", "IN_PROGRESS", "COMPLETED", "ON_HOLD"]),
  startDate: z.string().min(1, "開始日は必須です"),
  endDate: z.string().min(1, "終了予定日は必須です"),
});

export const taskSchema = z.object({
  title: z.string().min(1, "タスク名は必須です"),
  description: z.string().optional(),
  assigneeId: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]),
  dueDate: z.string().optional(),
});

export const expenseSchema = z.object({
  amount: z.coerce.number().int().min(1, "金額は1以上で入力してください"),
  category: z.enum(["TRAVEL", "ENTERTAINMENT", "SUPPLIES", "OTHER"]),
  description: z.string().min(1, "説明は必須です"),
  expenseDate: z.string().min(1, "経費発生日は必須です"),
});

export const employeeSchema = z.object({
  name: z.string().min(1, "氏名は必須です"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(6, "パスワードは6文字以上で入力してください").optional(),
  role: z.enum(["ADMIN", "MANAGER", "MEMBER"]),
  departmentId: z.string().optional(),
  position: z.string().optional(),
  hireDate: z.string().optional(),
});

export const departmentSchema = z.object({
  name: z.string().min(1, "部署名は必須です"),
  description: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CustomerInput = z.infer<typeof customerSchema>;
export type DealInput = z.infer<typeof dealSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type ExpenseInput = z.infer<typeof expenseSchema>;
export type EmployeeInput = z.infer<typeof employeeSchema>;
export type DepartmentInput = z.infer<typeof departmentSchema>;
