import type {
  CustomerStatus,
  DealStatus,
  ExpenseCategory,
  ExpenseStatus,
  ProjectStatus,
  Role,
  TaskPriority,
  TaskStatus
} from "@prisma/client";

export const PAGE_SIZE = 10;

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin",
  MANAGER: "Manager",
  MEMBER: "Member"
};

export const CUSTOMER_STATUS_LABELS: Record<CustomerStatus, string> = {
  ACTIVE: "有効",
  DORMANT: "休眠"
};

export const DEAL_STATUS_LABELS: Record<DealStatus, string> = {
  LEAD: "リード",
  PROPOSAL: "提案",
  NEGOTIATION: "交渉",
  WON: "成約",
  LOST: "失注"
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  PLANNING: "計画中",
  IN_PROGRESS: "進行中",
  COMPLETED: "完了",
  ON_HOLD: "保留"
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "未着手",
  IN_PROGRESS: "進行中",
  REVIEW: "レビュー",
  DONE: "完了"
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: "低",
  MEDIUM: "中",
  HIGH: "高"
};

export const EXPENSE_STATUS_LABELS: Record<ExpenseStatus, string> = {
  PENDING: "申請中",
  APPROVED: "承認済",
  REJECTED: "却下"
};

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  TRAVEL: "旅費交通費",
  ENTERTAINMENT: "交際費",
  SUPPLIES: "備品",
  OTHER: "その他"
};

export const ROLE_ORDER: Role[] = ["MEMBER", "MANAGER", "ADMIN"];
