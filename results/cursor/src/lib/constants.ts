export const PAGE_SIZE = 10;

export const DEAL_STATUS_LABELS: Record<string, string> = {
  LEAD: "リード",
  PROPOSAL: "提案",
  NEGOTIATION: "交渉",
  WON: "成約",
  LOST: "失注",
};

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  PLANNING: "計画中",
  IN_PROGRESS: "進行中",
  COMPLETED: "完了",
  ON_HOLD: "保留",
};

export const TASK_STATUS_LABELS: Record<string, string> = {
  TODO: "未着手",
  IN_PROGRESS: "進行中",
  REVIEW: "レビュー",
  DONE: "完了",
};

export const TASK_PRIORITY_LABELS: Record<string, string> = {
  LOW: "低",
  MEDIUM: "中",
  HIGH: "高",
};

export const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  TRAVEL: "交通費",
  ENTERTAINMENT: "接待費",
  SUPPLIES: "消耗品費",
  OTHER: "その他",
};

export const EXPENSE_STATUS_LABELS: Record<string, string> = {
  PENDING: "申請中",
  APPROVED: "承認済",
  REJECTED: "却下",
};

export const CUSTOMER_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "アクティブ",
  DORMANT: "休眠",
};

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "管理者",
  MANAGER: "マネージャー",
  MEMBER: "メンバー",
};
