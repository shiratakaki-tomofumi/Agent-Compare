import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLE_LABELS } from "@/lib/constants";
import { format } from "date-fns";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Pencil, User } from "lucide-react";
import { EmployeeDeleteButton } from "@/components/hr/employee-delete-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ year?: string; month?: string }>;
}

type AttendanceRow = {
  date: Date;
  checkIn: Date | null;
  checkOut: Date | null;
  overtimeHours: number;
};

export default async function EmployeeDetailPage({ params, searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const role = (session.user as { role: string }).role;
  if (role !== "ADMIN" && role !== "MANAGER") {
    redirect("/hr/employees");
  }

  const { id } = await params;
  const query = await searchParams;

  const now = new Date();
  const year = Number(query.year) || now.getFullYear();
  const month = Number(query.month) || now.getMonth() + 1;
  const startOfMonth = new Date(year, month - 1, 1);
  const startOfNextMonth = new Date(year, month, 1);

  const employee = await prisma.user.findFirst({
    where: { id, isActive: true },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      position: true,
      hireDate: true,
      department: { select: { name: true } },
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!employee) {
    notFound();
  }

  const attendance: AttendanceRow[] = await prisma.attendance.findMany({
    where: {
      userId: id,
      date: {
        gte: startOfMonth,
        lt: startOfNextMonth,
      },
    },
    orderBy: { date: "asc" },
    select: {
      date: true,
      checkIn: true,
      checkOut: true,
      overtimeHours: true,
    },
  });

  const attendedDays = attendance.filter((r) => r.checkIn !== null).length;
  const totalOvertimeHours = attendance.reduce(
    (sum, r) => sum + (r.overtimeHours ?? 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/hr/employees">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">従業員詳細</h1>
          <p className="text-muted-foreground">{employee.name} の情報</p>
        </div>
        {role === "ADMIN" && (
          <div className="flex items-center gap-2">
            <Link href={`/hr/employees/${employee.id}/edit`}>
              <Button variant="outline">
                <Pencil className="size-4" />
                編集
              </Button>
            </Link>
            <EmployeeDeleteButton employeeId={employee.id} employeeName={employee.name} />
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <User className="size-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{employee.name}</CardTitle>
              <p className="text-muted-foreground">{employee.email}</p>
            </div>
            <Badge
              variant={
                employee.role === "ADMIN"
                  ? "default"
                  : employee.role === "MANAGER"
                  ? "secondary"
                  : "outline"
              }
              className="ml-auto"
            >
              {ROLE_LABELS[employee.role]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Separator className="mb-6" />
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">部署</dt>
              <dd className="mt-1">{employee.department?.name || "未所属"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">役職</dt>
              <dd className="mt-1">{employee.position || "未設定"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">入社日</dt>
              <dd className="mt-1">
                {employee.hireDate
                  ? format(new Date(employee.hireDate), "yyyy/MM/dd")
                  : "未設定"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">ロール</dt>
              <dd className="mt-1">{ROLE_LABELS[employee.role]}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">登録日</dt>
              <dd className="mt-1">
                {format(new Date(employee.createdAt), "yyyy/MM/dd")}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">更新日</dt>
              <dd className="mt-1">
                {format(new Date(employee.updatedAt), "yyyy/MM/dd")}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl">月次勤怠</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {year}年{month}月
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
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">出勤日数</p>
              <p className="mt-1 text-2xl font-bold">{attendedDays}日</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">残業時間（合計）</p>
              <p className="mt-1 text-2xl font-bold">
                {totalOvertimeHours.toFixed(1)}時間
              </p>
            </div>
          </div>

          {attendance.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              この月の勤怠データはありません
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>日付</TableHead>
                  <TableHead className="text-right">出勤</TableHead>
                  <TableHead className="text-right">退勤</TableHead>
                  <TableHead className="text-right">残業（h）</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance.map((r) => (
                  <TableRow key={r.date.toISOString()}>
                    <TableCell>
                      {format(new Date(r.date), "yyyy/MM/dd")}
                    </TableCell>
                    <TableCell className="text-right">
                      {r.checkIn ? format(new Date(r.checkIn), "HH:mm") : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {r.checkOut
                        ? format(new Date(r.checkOut), "HH:mm")
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {r.overtimeHours.toFixed(1)}
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
