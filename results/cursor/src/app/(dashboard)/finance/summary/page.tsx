import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SummaryCharts } from "@/components/finance/summary-charts";
import { SummaryNavigation } from "@/components/finance/summary-navigation";

interface Props {
  searchParams: Promise<{ year?: string; month?: string }>;
}

type ApprovedExpenseRow = {
  amount: number;
  category: string;
  applicant: { departmentId: string | null };
};

type BudgetRow = {
  departmentId: string;
  amount: number;
};

type DepartmentRow = {
  id: string;
  name: string;
};

export default async function FinanceSummaryPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const role = session.user.role;
  if (role !== "MANAGER" && role !== "ADMIN") {
    redirect("/");
  }

  const params = await searchParams;
  const now = new Date();
  const year = Number(params.year) || now.getFullYear();
  const month = Number(params.month) || now.getMonth() + 1;

  // Revenue for the month
  const revenue = await prisma.revenue.findUnique({
    where: { year_month: { year, month } },
  });

  // Approved expenses for the month
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

  const approvedExpenses: ApprovedExpenseRow[] = await prisma.expense.findMany({
    where: {
      status: "APPROVED",
      expenseDate: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    include: {
      applicant: {
        select: { departmentId: true },
      },
    },
  });

  const totalRevenue = revenue?.amount ?? 0;
  const totalExpenses = approvedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const balance = totalRevenue - totalExpenses;

  // Budget vs actual per department
  const departments: DepartmentRow[] = await prisma.department.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const budgets: BudgetRow[] = await prisma.budget.findMany({
    where: { year, month },
    select: { departmentId: true, amount: true },
  });

  const deptBudgetMap = new Map(budgets.map((b) => [b.departmentId, b.amount]));

  const deptExpenseMap = new Map<string, number>();
  for (const expense of approvedExpenses) {
    const deptId = expense.applicant.departmentId;
    if (deptId) {
      deptExpenseMap.set(deptId, (deptExpenseMap.get(deptId) ?? 0) + expense.amount);
    }
  }

  const departmentData = departments.map((dept) => ({
    name: dept.name,
    budget: deptBudgetMap.get(dept.id) ?? 0,
    actual: deptExpenseMap.get(dept.id) ?? 0,
  }));

  // Category breakdown
  const categoryMap = new Map<string, number>();
  for (const expense of approvedExpenses) {
    categoryMap.set(
      expense.category,
      (categoryMap.get(expense.category) ?? 0) + expense.amount
    );
  }

  const categoryData = Object.entries(EXPENSE_CATEGORY_LABELS).map(
    ([key, label]) => ({
      name: label,
      value: categoryMap.get(key) ?? 0,
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">収支サマリー</h1>
        <SummaryNavigation year={year} month={month} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">収入</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              ¥{totalRevenue.toLocaleString("ja-JP")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">支出</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              ¥{totalExpenses.toLocaleString("ja-JP")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">差額</CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${
                balance >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              ¥{balance.toLocaleString("ja-JP")}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>部門別 予算 vs 実績</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>部門</TableHead>
                  <TableHead className="text-right">予算</TableHead>
                  <TableHead className="text-right">実績</TableHead>
                  <TableHead className="text-right">差額</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departmentData.map((dept) => (
                  <TableRow key={dept.name}>
                    <TableCell>{dept.name}</TableCell>
                    <TableCell className="text-right">
                      ¥{dept.budget.toLocaleString("ja-JP")}
                    </TableCell>
                    <TableCell className="text-right">
                      ¥{dept.actual.toLocaleString("ja-JP")}
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        dept.budget - dept.actual >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      ¥{(dept.budget - dept.actual).toLocaleString("ja-JP")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>カテゴリ別支出内訳</CardTitle>
          </CardHeader>
          <CardContent>
            <SummaryCharts categoryData={categoryData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
