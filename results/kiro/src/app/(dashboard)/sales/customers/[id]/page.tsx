import { notFound } from "next/navigation";
import Link from "next/link";
import { getCustomer } from "@/lib/actions/customers";
import { deleteCustomerAndRedirect } from "@/lib/actions/delete-actions";

type DealRow = NonNullable<
  Awaited<ReturnType<typeof getCustomer>>
>["deals"][number];
import { getSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/shared/delete-button";
import { CUSTOMER_STATUS_LABELS, DEAL_STATUS_LABELS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Role } from "@prisma/client";
import { Pencil } from "lucide-react";

interface PageProps {
  params: { id: string };
}

export default async function CustomerDetailPage({ params }: PageProps) {
  const [session, customer] = await Promise.all([
    getSession(),
    getCustomer(params.id),
  ]);
  if (!customer) notFound();

  const canEdit =
    session &&
    ([Role.MANAGER, Role.ADMIN] as Role[]).includes(session.user.role as Role);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{customer.companyName}</h1>
        {canEdit && (
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href={`/sales/customers/${customer.id}/edit`}>
                <Pencil className="h-4 w-4" />
                編集
              </Link>
            </Button>
            <DeleteButton
              onDelete={deleteCustomerAndRedirect.bind(null, customer.id)}
            />
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-card p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">会社名</p>
          <p className="font-medium">{customer.companyName}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">担当者名</p>
          <p className="font-medium">{customer.contactName}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">メールアドレス</p>
          <p className="font-medium">{customer.email}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">電話番号</p>
          <p className="font-medium">{customer.phone ?? "-"}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">ステータス</p>
          <Badge
            variant={customer.status === "ACTIVE" ? "success" : "secondary"}
          >
            {CUSTOMER_STATUS_LABELS[customer.status]}
          </Badge>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">登録日</p>
          <p className="font-medium">{formatDate(customer.createdAt)}</p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">関連商談</h2>
        {customer.deals.length === 0 ? (
          <p className="text-sm text-muted-foreground">商談がありません</p>
        ) : (
          <div className="rounded-lg border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">商談名</th>
                  <th className="text-left px-4 py-3 font-medium">金額</th>
                  <th className="text-left px-4 py-3 font-medium">
                    ステータス
                  </th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
                    担当者
                  </th>
                </tr>
              </thead>
              <tbody>
                {customer.deals.map((deal: DealRow) => (
                  <tr key={deal.id} className="border-t hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Link
                        href={`/sales/deals/${deal.id}`}
                        className="hover:underline font-medium"
                      >
                        {deal.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{formatCurrency(deal.amount)}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">
                        {DEAL_STATUS_LABELS[deal.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                      {deal.assignee.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
