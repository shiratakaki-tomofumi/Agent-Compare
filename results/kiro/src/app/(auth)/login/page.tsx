import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/");

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="w-full max-w-sm">
        <div className="rounded-lg border bg-card p-8 shadow-sm space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">BizBoard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              業務管理ダッシュボード
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
