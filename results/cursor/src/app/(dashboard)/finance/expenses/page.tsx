import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PAGE_SIZE, EXPENSE_STATUS_LABELS, EXPENSE_CATEGORY_LABELS } from "@/lib/constants";
import { notFound } from "next/navigation";
import { ExpenseListClient } from "@/components/finance/expense-list-client";

interface Props {
  searchParams: Promise<{
    search?: string;
    status?: string;
    page?: string;
    tab?: string;
  }>;
}

type ExpenseRow = {
  id: string;
  applicantId: string;
  applicant: { id: string; name: string; email: string };
  amount: number;
  category: string;
  description: string;
  expenseDate: Date;
  status: string;
  approver: { id: string; name: string; email: string } | null;
  approverComment: string | null;
};

export default async function ExpensesPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return notFound();

  const params = await searchParams;
  const search = params.search || "";
  const status = params.status || "";
  const page = Math.max(1, Number(params.page || "1"));
  const tab = params.tab || "mine";
  const isMine = tab === "mine";

  const where = {
    ...(isMine && { applicantId: session.user.id }),
    ...(search && {
      description: { contains: search, mode: "insensitive" as const },
    }),
    ...(status && {
      status: status as "PENDING" | "APPROVED" | "REJECTED",
    }),
  };

  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        applicant: { select: { id: true, name: true, email: true } },
        approver: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.expense.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const serializedExpenses = (expenses as ExpenseRow[]).map((e) => ({
    id: e.id,
    applicantId: e.applicantId,
    applicantName: e.applicant.name,
    amount: e.amount,
    category: e.category,
    description: e.description,
    expenseDate: e.expenseDate.toISOString(),
    status: e.status,
    approverName: e.approver?.name ?? null,
    approverComment: e.approverComment,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">経費申請</h1>
      </div>
      <ExpenseListClient
        expenses={serializedExpenses}
        currentPage={page}
        totalPages={totalPages}
        currentSearch={search}
        currentStatus={status}
        currentTab={tab}
        currentUserId={session.user.id}
        statusLabels={EXPENSE_STATUS_LABELS}
        categoryLabels={EXPENSE_CATEGORY_LABELS}
      />
    </div>
  );
}
