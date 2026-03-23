import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DepartmentManager } from "@/components/hr/department-manager";

type DepartmentRow = {
  id: string;
  name: string;
  description: string | null;
  _count: { users: number };
};

export default async function DepartmentsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const role = (session.user as { role: string }).role;
  if (role !== "ADMIN" && role !== "MANAGER") {
    redirect("/");
  }

  const departments: DepartmentRow[] = await prisma.department.findMany({
    include: {
      _count: { select: { users: true } },
    },
    orderBy: { name: "asc" },
  });

  const initialData = departments.map((dept) => ({
    id: dept.id,
    name: dept.name,
    description: dept.description,
    _count: { users: dept._count.users },
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">部署管理</h1>
        <p className="text-muted-foreground">部署の追加・編集・削除を行います</p>
      </div>

      <DepartmentManager initialDepartments={initialData} />
    </div>
  );
}
