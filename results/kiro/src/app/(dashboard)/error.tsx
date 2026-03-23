"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
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
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <h2 className="text-xl font-semibold">エラーが発生しました</h2>
      <p className="text-muted-foreground text-sm">
        問題が発生しました。再試行してください。
      </p>
      <Button onClick={reset}>再試行</Button>
    </div>
  );
}
