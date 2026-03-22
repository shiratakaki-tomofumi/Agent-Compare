import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-sand px-4">
      <div className="max-w-lg rounded-3xl bg-white p-8 shadow-panel">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">404</p>
        <h1 className="mt-3 font-heading text-3xl font-semibold text-ink">ページが見つかりません</h1>
        <p className="mt-3 text-sm text-slate-600">
          指定されたデータは存在しないか、すでに削除されている可能性があります。
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white"
        >
          ダッシュボードへ戻る
        </Link>
      </div>
    </div>
  );
}
