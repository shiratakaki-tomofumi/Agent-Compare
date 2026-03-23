import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ナビゲーションバー */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">BizBoard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {session.user?.email}
            </span>
          </div>
        </div>
      </nav>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">ダッシュボード</h2>
          <p className="text-gray-600 mt-1">ようこそ、{session.user?.name}さん</p>
        </div>

        {/* KPI カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-600">売上</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">¥0</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-600">顧客数</p>
            <p className="text-3xl font-bold text-green-600 mt-2">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-600">商談数</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-600">案件数</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">0</p>
          </div>
        </div>

        {/* 主要モジュールへのリンク */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <a
            href="/dashboard/sales/customers"
            className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:border-blue-500 transition-colors"
          >
            <h3 className="font-semibold text-gray-900 mb-2">顧客管理</h3>
            <p className="text-sm text-gray-600">顧客情報と商談を管理</p>
          </a>
          <a
            href="/dashboard/projects"
            className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:border-blue-500 transition-colors"
          >
            <h3 className="font-semibold text-gray-900 mb-2">案件管理</h3>
            <p className="text-sm text-gray-600">プロジェクトとタスクを管理</p>
          </a>
          <a
            href="/dashboard/finance"
            className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:border-blue-500 transition-colors"
          >
            <h3 className="font-semibold text-gray-900 mb-2">経費管理</h3>
            <p className="text-sm text-gray-600">経費申請と収支を管理</p>
          </a>
          <a
            href="/dashboard/hr"
            className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:border-blue-500 transition-colors"
          >
            <h3 className="font-semibold text-gray-900 mb-2">人事管理</h3>
            <p className="text-sm text-gray-600">従業員と勤怠を管理</p>
          </a>
        </div>
      </main>
    </div>
  );
}
