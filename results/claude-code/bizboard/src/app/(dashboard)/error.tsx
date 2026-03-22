"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <AlertTriangle className="mb-4 size-12 text-destructive" />
      <h2 className="mb-2 text-lg font-semibold">エラーが発生しました</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        問題が解決しない場合は管理者にお問い合わせください。
      </p>
      <Button onClick={reset}>再試行</Button>
    </div>
  );
}
