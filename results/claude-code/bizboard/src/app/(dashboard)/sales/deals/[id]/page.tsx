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
import { DEAL_STATUS_LABELS } from "@/lib/constants";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";

interface DealDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DealDetailPage({
  params,
}: DealDetailPageProps) {
  const { id } = await params;

  const deal = await prisma.deal.findUnique({
    where: { id },
    include: {
      customer: true,
      assignee: { select: { id: true, name: true, email: true } },
    },
  });

  if (!deal) {
    notFound();
  }

  const user = await getSessionUser();
  const canManage =
    user?.role === "ADMIN" || user?.role === "MANAGER";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/sales/deals">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{deal.title}</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>商談情報</CardTitle>
          {canManage && (
            <div className="flex gap-2">
              <Link href={`/sales/deals/${id}/edit`}>
                <Button variant="outline" size="sm">
                  <Pencil className="mr-1 size-4" />
                  編集
                </Button>
              </Link>
              <DeleteButton
                deleteUrl={`/api/sales/deals/${id}`}
                redirectUrl="/sales/deals"
                itemName={deal.title}
              />
            </div>
          )}
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                商談名
              </dt>
              <dd className="mt-1">{deal.title}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                顧客
              </dt>
              <dd className="mt-1">
                <Link
                  href={`/sales/customers/${deal.customerId}`}
                  className="text-primary underline underline-offset-4 hover:no-underline"
                >
                  {deal.customer.companyName}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                担当者
              </dt>
              <dd className="mt-1">{deal.assignee.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                金額
              </dt>
              <dd className="mt-1">
                {`\u00A5${deal.amount.toLocaleString("ja-JP")}`}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                確度
              </dt>
              <dd className="mt-1">{deal.probability}%</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                ステータス
              </dt>
              <dd className="mt-1">
                <StatusBadge
                  status={deal.status}
                  labels={DEAL_STATUS_LABELS}
                />
              </dd>
            </div>
            {deal.closedAt && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  クローズ日
                </dt>
                <dd className="mt-1">
                  {format(deal.closedAt, "yyyy/MM/dd")}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                登録日
              </dt>
              <dd className="mt-1">
                {format(deal.createdAt, "yyyy/MM/dd")}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">
                更新日
              </dt>
              <dd className="mt-1">
                {format(deal.updatedAt, "yyyy/MM/dd")}
              </dd>
            </div>
          </dl>
          {deal.note && (
            <div className="mt-4 border-t pt-4">
              <dt className="text-sm font-medium text-muted-foreground">
                備考
              </dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm">
                {deal.note}
              </dd>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
