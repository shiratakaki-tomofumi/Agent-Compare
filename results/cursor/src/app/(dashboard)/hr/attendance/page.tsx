import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { format } from "date-fns";

interface Props {
  searchParams: Promise<{ year?: string; month?: string }>;
}

type EmployeeRow = {
  id: string;
  name: string;
  department: { name: string } | null;
};

export default async function AttendanceSummaryPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const role = (session.user as { role: string }).role;
  if (role !== "MANAGER" && role !== "ADMIN") {
    redirect("/hr/employees");
  }

  const params = await searchParams;
  const now = new Date();
  const year = Number(params.year) || now.getFullYear();
  const month = Number(params.month) || now.getMonth() + 1;
  const startOfMonth = new Date(year, month - 1, 1);
  const startOfNextMonth = new Date(year, month, 1);

  const employees: EmployeeRow[] = await prisma.user.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      department: { select: { name: true } },
    },
    orderBy: { name: "asc" },
  });

  const employeeIds = employees.map((e) => e.id);
  const attendance = employeeIds.length
    ? await prisma.attendance.findMany({
        where: {
          userId: { in: employeeIds },
          date: { gte: startOfMonth, lt: startOfNextMonth },
        },
        select: {
          userId: true,
          checkIn: true,
          overtimeHours: true,
        },
      })
    : [];

  const statsMap = new Map<string, { days: number; overtime: number }>();
  for (const rec of attendance) {
    const current = statsMap.get(rec.userId) ?? { days: 0, overtime: 0 };
    if (rec.checkIn !== null) current.days += 1;
    current.overtime += rec.overtimeHours ?? 0;
    statsMap.set(rec.userId, current);
  }

  const rows = employees
    .map((emp) => {
      const s = statsMap.get(emp.id) ?? { days: 0, overtime: 0 };
      return {
        id: emp.id,
        name: emp.name,
        department: emp.department?.name ?? "-",
        days: s.days,
        overtime: s.overtime,
      };
    })
    .sort((a, b) => b.overtime - a.overtime);

  const totalDays = rows.reduce((sum, r) => sum + r.days, 0);
  const totalOvertime = rows.reduce((sum, r) => sum + r.overtime, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">勤怠サマリー</h1>
          <p className="text-muted-foreground">
            {format(startOfMonth, "yyyy年M月")} の集計
          </p>
        </div>

        <form method="GET" className="flex items-center gap-3">
          <select
            name="year"
            defaultValue={String(year)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            {Array.from({ length: 3 }, (_, i) => now.getFullYear() - 1 + i).map(
              (y) => (
                <option key={y} value={y}>
                  {y}年
                </option>
              )
            )}
          </select>
          <select
            name="month"
            defaultValue={String(month)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {m}月
              </option>
            ))}
          </select>
          <Button type="submit" variant="outline">
            表示
          </Button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">出勤日数合計</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalDays}日</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">残業時間合計</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalOvertime.toFixed(1)}時間</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>従業員別（{rows.length}名）</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              データがありません
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>氏名</TableHead>
                  <TableHead>部署</TableHead>
                  <TableHead className="text-right">出勤日数</TableHead>
                  <TableHead className="text-right">残業（h）</TableHead>
                  <TableHead className="text-right">詳細</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">
                      {r.name}
                    </TableCell>
                    <TableCell>{r.department}</TableCell>
                    <TableCell className="text-right">{r.days}日</TableCell>
                    <TableCell className="text-right">
                      {r.overtime.toFixed(1)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        className="text-sm font-medium text-primary hover:underline"
                        href={`/hr/employees/${r.id}?year=${year}&month=${month}`}
                      >
                        表示
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

