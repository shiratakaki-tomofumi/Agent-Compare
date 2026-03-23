"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Props {
  categoryData: { name: string; value: number }[];
}

const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#8b5cf6"];

export function SummaryCharts({ categoryData }: Props) {
  const hasData = categoryData.some((d) => d.value > 0);

  if (!hasData) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        データがありません
      </div>
    );
  }

  const filteredData = categoryData.filter((d) => d.value > 0);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={filteredData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={4}
          dataKey="value"
          nameKey="name"
          label={(props) => {
            const name = props.name ?? "";
            const percent = props.percent ?? 0;
            return `${name} ${(percent * 100).toFixed(0)}%`;
          }}
        >
          {filteredData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => `¥${Number(value).toLocaleString("ja-JP")}`}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
