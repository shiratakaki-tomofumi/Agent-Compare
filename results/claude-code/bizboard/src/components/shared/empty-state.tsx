import { InboxIcon } from "lucide-react";

interface EmptyStateProps {
  message?: string;
}

export function EmptyState({ message = "データがありません" }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <InboxIcon className="mb-4 size-12" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
