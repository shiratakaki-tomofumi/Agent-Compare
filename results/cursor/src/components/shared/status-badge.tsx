import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
  labels: Record<string, string>;
}

const statusVariantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PLANNING: "outline",
  IN_PROGRESS: "default",
  COMPLETED: "secondary",
  ON_HOLD: "destructive",
  TODO: "outline",
  REVIEW: "secondary",
  DONE: "secondary",
  PENDING: "outline",
  APPROVED: "secondary",
  REJECTED: "destructive",
  LOW: "outline",
  MEDIUM: "secondary",
  HIGH: "destructive",
};

export function StatusBadge({ status, labels }: StatusBadgeProps) {
  const variant = statusVariantMap[status] ?? "outline";
  const label = labels[status] ?? status;

  return <Badge variant={variant}>{label}</Badge>;
}
