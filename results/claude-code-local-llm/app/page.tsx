import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";

export default async function Home() {
  const session = await getServerSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">BizBoard</h1>
        <p className="text-lg text-gray-600">業務管理ダッシュボード</p>
        <a
          href="/login"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
        >
          ログインする
        </a>
      </div>
    </div>
  );
}
