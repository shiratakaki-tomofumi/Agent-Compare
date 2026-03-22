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

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EmployeeDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const role = (session.user as { role: string }).role;
  if (role !== "ADMIN" && role !== "MANAGER") {
    redirect("/hr/employees");
  }

  const { id } = await params;

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
    </div>
  );
}
