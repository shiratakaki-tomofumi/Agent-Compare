import {
  ExpenseStatus,
  Prisma,
  ProjectStatus,
  Role,
  TaskStatus
} from "@prisma/client";

import { PAGE_SIZE } from "@/lib/constants";
import { hasRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { parsePage, percentage } from "@/lib/utils";

type SearchParamsInput = {
  page?: string;
  query?: string;
  status?: string;
  scope?: string;
  month?: string;
};

function containsQuery(query: string | undefined, fields: Prisma.CustomerWhereInput[]) {
  if (!query) {
    return {};
  }

  return {
    OR: fields
  };
}

export async function getDashboardData() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [
    currentRevenue,
    dealsCount,
    wonDealsCount,
    closedDealsCount,
    activeProjectsCount,
    completedTasksCount,
    delayedProjectsCount,
    currentExpenseTotal,
    pendingExpenseCount,
    employeesCount,
    hiresThisMonth,
    recentCustomers,
    recentDeals,
    recentProjects,
    recentExpenses,
    recentEmployees
  ] = await Promise.all([
    prisma.revenue.findUnique({
      where: { year_month: { year: now.getFullYear(), month: now.getMonth() + 1 } }
    }),
    prisma.deal.count({
      where: { createdAt: { gte: monthStart, lt: monthEnd } }
    }),
    prisma.deal.count({
      where: { status: "WON", updatedAt: { gte: monthStart, lt: monthEnd } }
    }),
    prisma.deal.count({
      where: {
        status: { in: ["WON", "LOST"] },
        updatedAt: { gte: monthStart, lt: monthEnd }
      }
    }),
    prisma.project.count({
      where: { isDeleted: false, status: ProjectStatus.IN_PROGRESS }
    }),
    prisma.task.count({
      where: { status: TaskStatus.DONE }
    }),
    prisma.project.count({
      where: {
        isDeleted: false,
        status: { not: ProjectStatus.COMPLETED },
        endDate: { lt: now }
      }
    }),
    prisma.expense.aggregate({
      _sum: { amount: true },
      where: { expenseDate: { gte: monthStart, lt: monthEnd } }
    }),
    prisma.expense.count({
      where: { status: ExpenseStatus.PENDING }
    }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({
      where: {
        isActive: true,
        hireDate: { gte: monthStart, lt: monthEnd }
      }
    }),
    prisma.customer.findMany({
      take: 2,
      where: { isDeleted: false },
      orderBy: { createdAt: "desc" },
      select: { id: true, companyName: true, createdAt: true }
    }),
    prisma.deal.findMany({
      take: 2,
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, createdAt: true }
    }),
    prisma.project.findMany({
      take: 2,
      where: { isDeleted: false },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, createdAt: true }
    }),
    prisma.expense.findMany({
      take: 2,
      orderBy: { createdAt: "desc" },
      select: { id: true, description: true, createdAt: true }
    }),
    prisma.user.findMany({
      take: 2,
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, createdAt: true }
    })
  ]);

  const activityFeed = [
    ...recentCustomers.map((item) => ({
      id: `customer-${item.id}`,
      label: `顧客「${item.companyName}」を登録`,
      createdAt: item.createdAt
    })),
    ...recentDeals.map((item) => ({
      id: `deal-${item.id}`,
      label: `商談「${item.title}」を追加`,
      createdAt: item.createdAt
    })),
    ...recentProjects.map((item) => ({
      id: `project-${item.id}`,
      label: `案件「${item.name}」を登録`,
      createdAt: item.createdAt
    })),
    ...recentExpenses.map((item) => ({
      id: `expense-${item.id}`,
      label: `経費「${item.description}」が申請`,
      createdAt: item.createdAt
    })),
    ...recentEmployees.map((item) => ({
      id: `user-${item.id}`,
      label: `従業員「${item.name}」を追加`,
      createdAt: item.createdAt
    }))
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  const chartWindow = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return { year: date.getFullYear(), month: date.getMonth() + 1 };
  });

  const revenues = await prisma.revenue.findMany({
    where: {
      OR: chartWindow.map((entry) => ({
        year: entry.year,
        month: entry.month
      }))
    },
    orderBy: [{ year: "asc" }, { month: "asc" }]
  });

  const revenueMap = new Map(revenues.map((entry) => [`${entry.year}-${entry.month}`, entry]));
  const salesChart = chartWindow.map((entry) => {
    const record = revenueMap.get(`${entry.year}-${entry.month}`);
    return {
      label: `${entry.month}月`,
      amount: record?.amount ?? 0,
      target: record?.target ?? 0
    };
  });

  const dealStatuses = await prisma.deal.groupBy({
    by: ["status"],
    _count: { _all: true }
  });

  return {
    kpis: {
      sales: {
        monthlyRevenue: currentRevenue?.amount ?? 0,
        dealsCount,
        winRate: percentage(wonDealsCount, closedDealsCount)
      },
      projects: {
        activeProjectsCount,
        completedTasksCount,
        delayedProjectsCount
      },
      finance: {
        monthlyExpense: currentExpenseTotal._sum.amount ?? 0,
        pendingExpenseCount
      },
      hr: {
        employeesCount,
        hiresThisMonth
      }
    },
    salesChart,
    dealStatuses,
    revenueSummary: currentRevenue,
    activityFeed
  };
}

export async function getCustomerList(searchParams: SearchParamsInput) {
  const page = parsePage(searchParams.page);
  const query = searchParams.query?.trim();
  const status =
    searchParams.status === "ACTIVE" || searchParams.status === "DORMANT"
      ? searchParams.status
      : undefined;

  const where: Prisma.CustomerWhereInput = {
    isDeleted: false,
    ...(status ? { status } : {}),
    ...containsQuery(query, [
      { companyName: { contains: query, mode: "insensitive" } },
      { contactName: { contains: query, mode: "insensitive" } },
      { email: { contains: query, mode: "insensitive" } }
    ])
  };

  const [items, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { _count: { select: { deals: true } } }
    }),
    prisma.customer.count({ where })
  ]);

  return { items, page, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getCustomerDetail(id: string) {
  return prisma.customer.findFirst({
    where: { id, isDeleted: false },
    include: {
      deals: {
        include: {
          assignee: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: "desc" }
      }
    }
  });
}

export async function getDealList(searchParams: SearchParamsInput) {
  const page = parsePage(searchParams.page);
  const query = searchParams.query?.trim();
  const statusValues = ["LEAD", "PROPOSAL", "NEGOTIATION", "WON", "LOST"] as const;
  const status = statusValues.find((value) => value === searchParams.status);

  const where: Prisma.DealWhereInput = {
    ...(status ? { status } : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            {
              customer: {
                companyName: { contains: query, mode: "insensitive" }
              }
            }
          ]
        }
      : {})
  };

  const [items, total] = await Promise.all([
    prisma.deal.findMany({
      where,
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        customer: { select: { id: true, companyName: true } },
        assignee: { select: { id: true, name: true } }
      }
    }),
    prisma.deal.count({ where })
  ]);

  return { items, page, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getDealDetail(id: string) {
  return prisma.deal.findUnique({
    where: { id },
    include: {
      customer: true,
      assignee: {
        select: {
          id: true,
          name: true,
          email: true,
          department: { select: { name: true } }
        }
      }
    }
  });
}

export async function getProjectList(searchParams: SearchParamsInput) {
  const page = parsePage(searchParams.page);
  const query = searchParams.query?.trim();
  const statusValues = ["PLANNING", "IN_PROGRESS", "COMPLETED", "ON_HOLD"] as const;
  const status = statusValues.find((value) => value === searchParams.status);

  const where: Prisma.ProjectWhereInput = {
    isDeleted: false,
    ...(status ? { status } : {}),
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } }
          ]
        }
      : {})
  };

  const [items, total] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy: { startDate: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        department: { select: { id: true, name: true } },
        tasks: { select: { status: true } }
      }
    }),
    prisma.project.count({ where })
  ]);

  return {
    items: items.map((item) => {
      const completed = item.tasks.filter((task) => task.status === "DONE").length;
      return {
        ...item,
        progress: percentage(completed, item.tasks.length),
        taskCount: item.tasks.length
      };
    }),
    page,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE))
  };
}

export async function getProjectDetail(id: string) {
  const project = await prisma.project.findFirst({
    where: { id, isDeleted: false },
    include: {
      department: true,
      tasks: {
        include: {
          assignee: { select: { id: true, name: true } }
        },
        orderBy: [{ status: "asc" }, { dueDate: "asc" }]
      }
    }
  });

  if (!project) {
    return null;
  }

  const completed = project.tasks.filter((task) => task.status === "DONE").length;
  return {
    ...project,
    progress: percentage(completed, project.tasks.length)
  };
}

export async function getExpenseList(searchParams: SearchParamsInput, user: { id: string; role: Role }) {
  const page = parsePage(searchParams.page);
  const query = searchParams.query?.trim();
  const statusValues = ["PENDING", "APPROVED", "REJECTED"] as const;
  const status = statusValues.find((value) => value === searchParams.status);
  const scope = searchParams.scope === "all" && hasRole(user.role, "MANAGER") ? "all" : "mine";

  const where: Prisma.ExpenseWhereInput = {
    ...(scope === "mine" ? { applicantId: user.id } : {}),
    ...(status ? { status } : {}),
    ...(query
      ? { description: { contains: query, mode: "insensitive" } }
      : {})
  };

  const [items, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      orderBy: { expenseDate: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        applicant: { select: { id: true, name: true } },
        approver: { select: { id: true, name: true } }
      }
    }),
    prisma.expense.count({ where })
  ]);

  return { items, page, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)), scope };
}

export async function getExpenseDetail(id: string) {
  return prisma.expense.findUnique({
    where: { id },
    include: {
      applicant: { select: { id: true, name: true } },
      approver: { select: { id: true, name: true } }
    }
  });
}

export async function getApprovalList() {
  return prisma.expense.findMany({
    where: { status: ExpenseStatus.PENDING },
    orderBy: { createdAt: "asc" },
    include: {
      applicant: {
        select: {
          id: true,
          name: true,
          department: { select: { name: true } }
        }
      }
    }
  });
}

export async function getFinanceSummary(searchParams: SearchParamsInput) {
  const today = new Date();
  const monthString =
    searchParams.month && /^\d{4}-\d{2}$/.test(searchParams.month)
      ? searchParams.month
      : `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

  const [yearText, monthText] = monthString.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 1);

  const [revenue, expenses, budgets] = await Promise.all([
    prisma.revenue.findUnique({ where: { year_month: { year, month } } }),
    prisma.expense.findMany({
      where: {
        expenseDate: { gte: monthStart, lt: monthEnd },
        status: ExpenseStatus.APPROVED
      },
      include: {
        applicant: {
          select: {
            departmentId: true,
            department: { select: { name: true } }
          }
        }
      }
    }),
    prisma.budget.findMany({
      where: { year, month },
      include: { department: true },
      orderBy: { department: { name: "asc" } }
    })
  ]);

  const expenseTotal = expenses.reduce((sum, item) => sum + item.amount, 0);
  const actualByDepartment = expenses.reduce<Record<string, number>>((acc, item) => {
    const key = item.applicant.departmentId ?? "unknown";
    acc[key] = (acc[key] ?? 0) + item.amount;
    return acc;
  }, {});

  const categoryBreakdown = Object.entries(
    expenses.reduce<Record<string, number>>((acc, item) => {
      acc[item.category] = (acc[item.category] ?? 0) + item.amount;
      return acc;
    }, {})
  ).map(([category, amount]) => ({
    category,
    amount
  }));

  return {
    selectedMonth: monthString,
    cards: {
      income: revenue?.amount ?? 0,
      expense: expenseTotal,
      balance: (revenue?.amount ?? 0) - expenseTotal
    },
    budgetRows: budgets.map((budget) => ({
      id: budget.id,
      departmentName: budget.department.name,
      budget: budget.amount,
      actual: actualByDepartment[budget.departmentId] ?? 0
    })),
    categoryBreakdown
  };
}

export async function getEmployeeList(searchParams: SearchParamsInput) {
  const page = parsePage(searchParams.page);
  const query = searchParams.query?.trim();

  const where: Prisma.UserWhereInput = {
    isActive: true,
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { position: { contains: query, mode: "insensitive" } }
          ]
        }
      : {})
  };

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        department: { select: { id: true, name: true } }
      }
    }),
    prisma.user.count({ where })
  ]);

  return { items, page, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function getEmployeeDetail(id: string) {
  const employee = await prisma.user.findFirst({
    where: { id, isActive: true },
    include: {
      department: true
    }
  });

  if (!employee) {
    return null;
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const attendances = await prisma.attendance.findMany({
    where: {
      userId: id,
      date: { gte: monthStart, lt: monthEnd }
    },
    orderBy: { date: "asc" }
  });

  return {
    employee,
    attendanceSummary: {
      workingDays: attendances.length,
      overtimeHours: attendances.reduce((sum, row) => sum + row.overtimeHours, 0),
      records: attendances
    }
  };
}

export async function getDepartmentList() {
  return prisma.department.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { users: { where: { isActive: true } } }
      }
    }
  });
}

export async function getSelectOptions() {
  const [customers, users, departments] = await Promise.all([
    prisma.customer.findMany({
      where: { isDeleted: false },
      orderBy: { companyName: "asc" },
      select: { id: true, companyName: true }
    }),
    prisma.user.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, role: true }
    }),
    prisma.department.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true }
    })
  ]);

  return { customers, users, departments };
}
