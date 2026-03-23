import { notFound } from "next/navigation";
import Link from "next/link";
import { getEmployee } from "@/lib/actions/employees";
import { deleteEmployeeAndRedirect } from "@/lib/actions/delete-actions";
import { requireRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/shared/delete-button";
import { ROLE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { Role } from "@prisma/client";
import { Pencil } from "lucide-react";

interface PageProps {
  params: { id: string };
}

export default async function EmployeeDetailPage({ params }: PageProps) {
  const session = await requireRole([Role.MANAGER, Role.ADMIN]);
  const employee = await getEmployee(params.id);
  if (!employee) notFound();
  const isAdmin = session.user.role === Role.ADMIN;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{employee.name}</h1>
        {isAdmin && (
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href={`/hr/employees/${employee.id}/edit`}>
                <Pencil className="h-4 w-4" />
                編集
              </Link>
            </Button>
            <DeleteButton
              onDelete={deleteEmployeeAndRedirect.bind(null, employee.id)}
            />
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-card p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">氏名</p>
          <p className="font-medium">{employee.name}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">メールアドレス</p>
          <p className="font-medium">{employee.email}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">ロール</p>
          <Badge variant={employee.role === "ADMIN" ? "default" : "secondary"}>
            {ROLE_LABELS[employee.role]}
          </Badge>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">部署</p>
          <p className="font-medium">{employee.department?.name ?? "-"}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">役職</p>
          <p className="font-medium">{employee.position ?? "-"}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">入社日</p>
          <p className="font-medium">{formatDate(employee.hireDate)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">登録日</p>
          <p className="font-medium">{formatDate(employee.createdAt)}</p>
        </div>
      </div>
    </div>
  );
}
