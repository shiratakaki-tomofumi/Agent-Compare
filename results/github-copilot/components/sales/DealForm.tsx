"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type DealFormProps = {
  customers: { id: string; companyName: string }[];
  assignees: { id: string; name: string }[];
  initial?: {
    title?: string;
    customerId?: string;
    assigneeId?: string;
    amount?: number;
    probability?: number;
    status?: string;
    note?: string;
  };
  id?: string;
};

export default function DealForm({
  customers,
  assignees,
  initial,
  id,
}: DealFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    customerId: initial?.customerId ?? customers[0]?.id ?? "",
    assigneeId: initial?.assigneeId ?? assignees[0]?.id ?? "",
    amount: initial?.amount ?? 0,
    probability: initial?.probability ?? 0,
    status: initial?.status ?? "LEAD",
    note: initial?.note ?? "",
  });

  const handleChange = (key: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const method = id ? "PUT" : "POST";
    const target = id ? `/api/deals/${id}` : "/api/deals";

    const res = await fetch(target, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      alert("保存に失敗しました");
      return;
    }

    router.push("/sales/deals");
  };

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">
        {id ? "商談編集" : "商談作成"}
      </h1>
      <form
        onSubmit={onSubmit}
        className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4"
      >
        <div>
          <label className="block text-sm font-medium">商談名*</label>
          <input
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
            required
            className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">顧客*</label>
          <select
            value={form.customerId}
            onChange={(e) => handleChange("customerId", e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.companyName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">担当者*</label>
          <select
            value={form.assigneeId}
            onChange={(e) => handleChange("assigneeId", e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1"
          >
            {assignees.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">金額*</label>
          <input
            type="number"
            value={form.amount}
            onChange={(e) => handleChange("amount", Number(e.target.value))}
            required
            className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">確度 (%)*</label>
          <input
            type="number"
            value={form.probability}
            onChange={(e) =>
              handleChange("probability", Number(e.target.value))
            }
            required
            min={0}
            max={100}
            className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">ステータス*</label>
          <select
            value={form.status}
            onChange={(e) => handleChange("status", e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1"
          >
            <option value="LEAD">LEAD</option>
            <option value="PROPOSAL">PROPOSAL</option>
            <option value="NEGOTIATION">NEGOTIATION</option>
            <option value="WON">WON</option>
            <option value="LOST">LOST</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">メモ</label>
          <textarea
            value={form.note}
            onChange={(e) => handleChange("note", e.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => router.push("/sales/deals")}
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
  );
}
