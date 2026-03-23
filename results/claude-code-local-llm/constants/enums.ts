// Role enums
export const ROLES = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  MEMBER: "MEMBER",
} as const;

// Customer status
export const CUSTOMER_STATUS = {
  ACTIVE: "ACTIVE",
  DORMANT: "DORMANT",
} as const;

// Deal status and workflow
export const DEAL_STATUS = {
  LEAD: "LEAD",
  PROPOSAL: "PROPOSAL",
  NEGOTIATION: "NEGOTIATION",
  WON: "WON",
  LOST: "LOST",
} as const;

export const DEAL_WORKFLOW = [DEAL_STATUS.LEAD, DEAL_STATUS.PROPOSAL, DEAL_STATUS.NEGOTIATION, DEAL_STATUS.WON, DEAL_STATUS.LOST];

// Project status
export const PROJECT_STATUS = {
  PLANNING: "PLANNING",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  ON_HOLD: "ON_HOLD",
} as const;

// Task status and workflow
export const TASK_STATUS = {
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  REVIEW: "REVIEW",
  DONE: "DONE",
} as const;

export const TASK_WORKFLOW = [TASK_STATUS.TODO, TASK_STATUS.IN_PROGRESS, TASK_STATUS.REVIEW, TASK_STATUS.DONE];

// Task priority
export const TASK_PRIORITY = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
} as const;

// Expense category and status
export const EXPENSE_CATEGORY = {
  TRAVEL: "TRAVEL",
  ENTERTAINMENT: "ENTERTAINMENT",
  SUPPLIES: "SUPPLIES",
  OTHER: "OTHER",
} as const;

export const EXPENSE_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

// Pagination constants
export const PAGE_SIZE = 10;
