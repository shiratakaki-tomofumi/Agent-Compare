import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth-guard";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { DeleteButton } from "@/components/sales/delete-button";
import {
  CUSTOMER_STATUS_LABELS,
  DEAL_STATUS_LABELS,
} from "@/lib/constants";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";

type DealRow = {
  id: string;
  title: string;
  amount: number;
  status: string;
  assignee: { name: string };
};

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({
  params,
}: CustomerDetailPageProps) {
  const { id } = await params;

  const customer = await prisma.customer.findFirst({
    where: { id, isDeleted: false },
    include: {
      deals: {
        include: {
          assignee: { select: { name: true } },
        },
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!customer) {
    notFound();
  }

  const user = await getSessionUser();
  const canManage =
    user?.role === "ADMIN" || user?.role === "MANAGER";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/sales/customers">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{customer.companyName}</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>基本情報</CardTitle>
          {canManage && (
            <div className="flex gap-2">
              <Link href={`/sales/customers/${id}/edit`}>
                <Button variant="outline" size="sm">
                  <Pencil className="mr-1 size-4" />
                  編集
                </Button>
              </Link>
              <DeleteButton
                deleteUrl={`/api/sales/customers/${id}`}
                redirectUrl="/sales/customers"
                itemName={customer.companyName}
              />
            </div>
          )}
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                会社名
              </dt>
              <dd className="mt-1">{customer.companyName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                担当者名
              </dt>
              <dd className="mt-1">{customer.contactName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                メールアドレス
              </dt>
              <dd className="mt-1">{customer.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                電話番号
              </dt>
              <dd className="mt-1">{customer.phone ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                ステータス
              </dt>
              <dd className="mt-1">
                <StatusBadge
                  status={customer.status}
                  labels={CUSTOMER_STATUS_LABELS}
                />
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                登録日
              </dt>
              <dd className="mt-1">
                {format(customer.createdAt, "yyyy/MM/dd")}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>関連商談</CardTitle>
        </CardHeader>
        <CardContent>
          {customer.deals.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              関連する商談はありません
            </p>
          ) : (
            <div className="divide-y">
              {(customer.deals as DealRow[]).map((deal) => (
                <Link
                  key={deal.id}
                  href={`/sales/deals/${deal.id}`}
                  className="flex items-center justify-between py-3 transition-colors hover:bg-muted/50 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{deal.title}</p>
                    <p className="text-sm text-muted-foreground">
                      担当: {deal.assignee.name} /
                      {` \u00A5${deal.amount.toLocaleString("ja-JP")}`}
                    </p>
                  </div>
                  <StatusBadge
                    status={deal.status}
                    labels={DEAL_STATUS_LABELS}
                  />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
