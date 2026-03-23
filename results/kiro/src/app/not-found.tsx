import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
      <p className="text-xl font-semibold">ページが見つかりません</p>
      <p className="text-muted-foreground">
        お探しのページは存在しないか、削除された可能性があります。
      </p>
      <Button asChild>
        <Link href="/">ダッシュボードに戻る</Link>
      </Button>
    </div>
  );
}
