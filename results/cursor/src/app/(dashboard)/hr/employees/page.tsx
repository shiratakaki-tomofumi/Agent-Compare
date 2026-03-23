import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PAGE_SIZE, ROLE_LABELS } from "@/lib/constants";
import { format } from "date-fns";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users } from "lucide-react";
import { redirect } from "next/navigation";
import { EmployeeSearch } from "@/components/hr/employee-search";
import { EmployeePagination } from "@/components/hr/employee-pagination";

interface Props {
  searchParams: Promise<{ search?: string; page?: string }>;
}

type EmployeeListRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  position: string | null;
  hireDate: Date | null;
  department: { name: string } | null;
};

export default async function EmployeesPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const params = await searchParams;
  const search = params.search || "";
  const page = Math.max(1, Number(params.page || "1"));
  const role = (session.user as { role: string }).role;

  const where = {
    isActive: true,
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [employees, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        position: true,
        hireDate: true,
        department: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">従業員一覧</h1>
          <p className="text-muted-foreground">従業員の管理を行います</p>
        </div>
        {role === "ADMIN" && (
          <Link href="/hr/employees/new">
            <Button>
              <Plus className="size-4" />
              新規追加
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Users className="size-5 text-muted-foreground" />
            <CardTitle>従業員 ({total}件)</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <EmployeeSearch defaultValue={search} />
          </div>

          {employees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="size-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                {search ? "検索条件に一致する従業員がいません" : "従業員が登録されていません"}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>氏名</TableHead>
                    <TableHead>メール</TableHead>
                    <TableHead>部署</TableHead>
                    <TableHead>役職</TableHead>
                    <TableHead>ロール</TableHead>
                    <TableHead>入社日</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(employees as EmployeeListRow[]).map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell>
                        {role === "ADMIN" || role === "MANAGER" ? (
                          <Link
                            href={`/hr/employees/${emp.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {emp.name}
                          </Link>
                        ) : (
                          <span className="font-medium">{emp.name}</span>
                        )}
                      </TableCell>
                      <TableCell>{emp.email}</TableCell>
                      <TableCell>{emp.department?.name || "-"}</TableCell>
                      <TableCell>{emp.position || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={emp.role === "ADMIN" ? "default" : emp.role === "MANAGER" ? "secondary" : "outline"}>
                          {ROLE_LABELS[emp.role]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {emp.hireDate
                          ? format(new Date(emp.hireDate), "yyyy/MM/dd")
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="mt-4">
                  <EmployeePagination
                    currentPage={page}
                    totalPages={totalPages}
                    search={search}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
