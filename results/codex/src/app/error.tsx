"use client";

export default function GlobalError({
  error,
  reset
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-sand px-4">
      <div className="max-w-lg rounded-3xl bg-white p-8 shadow-panel">
        <p className="text-sm uppercase tracking-[0.3em] text-rose-600">Error</p>
        <h1 className="mt-3 font-heading text-3xl font-semibold text-ink">問題が発生しました</h1>
        <p className="mt-3 text-sm text-slate-600">
          画面の表示中にエラーが発生しました。再試行しても改善しない場合は入力内容を見直してください。
        </p>
        <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">{error.message}</p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white"
        >
          再試行
        </button>
      </div>
    </div>
  );
}
