"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/constants";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { ExpenseCategory } from "@prisma/client";

interface SummaryData {
  revenue: number;
  revenueTarget: number;
  expense: number;
  balance: number;
  budgets: {
    id: string;
    departmentId: string;
    year: number;
    month: number;
    amount: number;
    actual: number;
    department: { name: string };
  }[];
  categoryBreakdown: { category: ExpenseCategory; amount: number }[];
}

interface FinanceSummaryViewProps {
  data: SummaryData;
  year: number;
  month: number;
}

export function FinanceSummaryView({
  data,
  year,
  month,
}: FinanceSummaryViewProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navigate = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m > 12) {
      m = 1;
      y++;
    }
    if (m < 1) {
      m = 12;
      y--;
    }
    router.push(`${pathname}?year=${y}&month=${m}`);
  };

  const chartData = data.categoryBreakdown.map((c) => ({
    name: EXPENSE_CATEGORY_LABELS[c.category],
    amount: c.amount,
  }));

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#6366f1"];

  return (
    <div className="space-y-6">
      {/* Month selector */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-lg font-semibold w-28 text-center">
          {year}年{month}月
        </span>
        <Button variant="outline" size="icon" onClick={() => navigate(1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">売上</p>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold">{formatCurrency(data.revenue)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            目標: {formatCurrency(data.revenueTarget)}
          </p>
          {data.revenueTarget > 0 && (
            <div className="mt-2">
              <div className="bg-muted rounded-full h-1.5">
                <div
                  className="bg-green-500 h-1.5 rounded-full"
                  style={{
                    width: `${Math.min(100, Math.round((data.revenue / data.revenueTarget) * 100))}%`,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round((data.revenue / data.revenueTarget) * 100)}%達成
              </p>
            </div>
          )}
        </div>
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">支出</p>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold">{formatCurrency(data.expense)}</p>
        </div>
        <div className="rounded-lg border bg-card p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">差額</p>
            <Minus className="h-4 w-4 text-muted-foreground" />
          </div>
          <p
            className={`text-2xl font-bold ${data.balance >= 0 ? "text-green-600" : "text-destructive"}`}
          >
            {formatCurrency(data.balance)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget vs Actual */}
        <div className="rounded-lg border bg-card p-5">
          <h2 className="font-semibold mb-4">部門別予算 vs 実績</h2>
          {data.budgets.length === 0 ? (
            <p className="text-sm text-muted-foreground">データがありません</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">部署</th>
                  <th className="text-right py-2 font-medium">予算</th>
                  <th className="text-right py-2 font-medium">実績</th>
                  <th className="text-right py-2 font-medium">状態</th>
                </tr>
              </thead>
              <tbody>
                {data.budgets.map((b) => (
                  <tr key={b.id} className="border-b last:border-0">
                    <td className="py-2">{b.department.name}</td>
                    <td className="py-2 text-right">
                      {formatCurrency(b.amount)}
                    </td>
                    <td className="py-2 text-right">
                      {formatCurrency(b.actual)}
                    </td>
                    <td className="py-2 text-right">
                      <Badge
                        variant={
                          b.actual <= b.amount ? "success" : "destructive"
                        }
                      >
                        {b.actual <= b.amount ? "予算内" : "超過"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Category breakdown chart */}
        <div className="rounded-lg border bg-card p-5">
          <h2 className="font-semibold mb-4">カテゴリ別支出</h2>
          {chartData.length === 0 ? (
            <p className="text-sm text-muted-foreground">データがありません</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={chartData}
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              >
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v: number) => `¥${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
