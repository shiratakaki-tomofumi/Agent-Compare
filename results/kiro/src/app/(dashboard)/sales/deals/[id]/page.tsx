import { notFound } from "next/navigation";
import Link from "next/link";
import { getDeal } from "@/lib/actions/deals";
import { deleteDealAndRedirect } from "@/lib/actions/delete-actions";
import { getSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/shared/delete-button";
import { DEAL_STATUS_LABELS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Role } from "@prisma/client";
import { Pencil } from "lucide-react";

interface PageProps {
  params: { id: string };
}

export default async function DealDetailPage({ params }: PageProps) {
  const [session, deal] = await Promise.all([getSession(), getDeal(params.id)]);
  if (!deal) notFound();
  const canEdit =
    session &&
    ([Role.MANAGER, Role.ADMIN] as Role[]).includes(session.user.role as Role);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{deal.title}</h1>
        {canEdit && (
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href={`/sales/deals/${deal.id}/edit`}>
                <Pencil className="h-4 w-4" />
                編集
              </Link>
            </Button>
            <DeleteButton
              onDelete={deleteDealAndRedirect.bind(null, deal.id)}
            />
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-card p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">顧客</p>
          <p className="font-medium">{deal.customer.companyName}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">担当者</p>
          <p className="font-medium">{deal.assignee.name}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">金額</p>
          <p className="font-medium text-lg">{formatCurrency(deal.amount)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">確度</p>
          <p className="font-medium">{deal.probability}%</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">ステータス</p>
          <Badge variant="outline">{DEAL_STATUS_LABELS[deal.status]}</Badge>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">クローズ日</p>
          <p className="font-medium">{formatDate(deal.closedAt)}</p>
        </div>
        {deal.note && (
          <div className="col-span-2">
            <p className="text-sm text-muted-foreground">メモ</p>
            <p className="whitespace-pre-wrap">{deal.note}</p>
          </div>
        )}
        <div>
          <p className="text-sm text-muted-foreground">作成日</p>
          <p className="font-medium">{formatDate(deal.createdAt)}</p>
        </div>
      </div>
    </div>
  );
}
