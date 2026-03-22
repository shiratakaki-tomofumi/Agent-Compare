"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { EXPENSE_CATEGORY_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

export function SalesChart({
  data
}: {
  data: { label: string; amount: number; target: number }[];
}) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip formatter={(value: number) => new Intl.NumberFormat("ja-JP").format(value)} />
          <Bar dataKey="target" fill="#cbd5e1" radius={[10, 10, 0, 0]} />
          <Bar dataKey="amount" fill="#0f766e" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const PIE_COLORS = ["#0f766e", "#d97706", "#16a34a", "#475569"];

export function ExpenseBreakdownChart({
  data
}: {
  data: { category: string; amount: number }[];
}) {
  if (data.length === 0) {
    return <p className="text-sm text-slate-500">承認済み経費がありません。</p>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="amount" nameKey="category" innerRadius={70} outerRadius={95}>
              {data.map((entry, index) => (
                <Cell key={entry.category} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => new Intl.NumberFormat("ja-JP").format(value)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-3">
        {data.map((entry, index) => (
          <div key={entry.category} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-3">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
              />
              <span className="text-sm text-slate-700">
                {EXPENSE_CATEGORY_LABELS[
                  entry.category as keyof typeof EXPENSE_CATEGORY_LABELS
                ] ?? entry.category}
              </span>
            </div>
            <span className="font-medium text-slate-900">{formatCurrency(entry.amount)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
