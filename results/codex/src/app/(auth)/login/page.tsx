import { redirect } from "next/navigation";

import { LoginForm } from "@/components/forms";
import { getSession } from "@/lib/auth";

export default async function LoginPage() {
  const session = await getSession();
  if (session?.user) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[36px] border border-white/80 bg-white/80 shadow-panel backdrop-blur lg:grid-cols-[1.1fr_0.9fr]">
        <section className="hidden bg-slate-950 px-10 py-12 text-white lg:block">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">BizBoard</p>
          <h1 className="mt-6 font-heading text-5xl font-semibold leading-tight">
            Business teams, one operational cockpit.
          </h1>
          <p className="mt-6 max-w-md text-sm leading-7 text-slate-300">
            営業、案件、財務、人事を横断して状態を把握し、同じ画面で実務を前に進めるためのダッシュボードです。
          </p>
        </section>
        <section className="px-6 py-10 sm:px-10">
          <p className="text-xs uppercase tracking-[0.4em] text-ocean">Welcome Back</p>
          <h2 className="mt-4 font-heading text-3xl font-semibold text-ink">ログイン</h2>
          <p className="mt-3 text-sm text-slate-600">
            メールアドレスとパスワードでログインしてください。シード投入後は
            `admin@bizboard.local / password123` などが利用できます。
          </p>
          <div className="mt-8">
            <LoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}
