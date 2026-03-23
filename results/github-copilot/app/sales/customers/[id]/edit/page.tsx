"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";

export default function CustomerEditPage({
  params,
}: {
  params: { id: string };
}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCustomer = async () => {
      const res = await fetch(`/api/customers/${params.id}`);
      if (!res.ok) {
        setError("顧客が見つかりません");
        setLoading(false);
        return;
      }
      const json = await res.json();
      setData(json);
      setLoading(false);
    };
    fetchCustomer();
  }, [params.id]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      companyName: form.get("companyName"),
      contactName: form.get("contactName"),
      email: form.get("email"),
      phone: form.get("phone"),
      status: form.get("status"),
    };
    const res = await fetch(`/api/customers/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      alert("更新に失敗しました");
      return;
    }

    router.push("/sales/customers");
  };

  if (loading) return <div className="p-4">読み込み中...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <AppShell>
      <div className="p-4">
        <h1 className="mb-4 text-2xl font-bold">顧客編集</h1>
        <form
          onSubmit={handleSubmit}
          className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4"
        >
          <div>
            <label className="block text-sm font-medium">会社名*</label>
            <input
              name="companyName"
              defaultValue={data.companyName}
              className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">担当者*</label>
            <input
              name="contactName"
              defaultValue={data.contactName}
              className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">メール*</label>
            <input
              type="email"
              name="email"
              defaultValue={data.email}
              className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">電話</label>
            <input
              name="phone"
              defaultValue={data.phone || ""}
              className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">ステータス*</label>
            <select
              name="status"
              defaultValue={data.status}
              className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="DORMANT">DORMANT</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => router.push("/sales/customers")}
              className="rounded-md border border-zinc-300 px-3 py-2"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
