import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prismadb";
import AppShell from "@/components/AppShell";

type Params = { params: { id: string } };

export default async function CustomerDetailPage({ params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return <p>ログインしてください</p>;

  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    include: { deals: true },
  });

  if (!customer || customer.isDeleted) {
    return (
      <AppShell>
        <div className="p-4">顧客が見つかりません</div>
      </AppShell>
    );
  }

  const canEdit = ["MANAGER", "ADMIN"].includes(
    (session.user as any).role as string,
  );

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold">顧客詳細</h1>
          <div className="space-x-2">
            {canEdit && (
              <Link
                href={`/sales/customers/${customer.id}/edit`}
                className="rounded-md border border-blue-500 px-3 py-1 text-blue-600"
              >
                編集
              </Link>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <DetailItem label="会社名" value={customer.companyName} />
            <DetailItem label="担当者" value={customer.contactName} />
            <DetailItem label="メール" value={customer.email} />
            <DetailItem label="電話" value={customer.phone || "-"} />
            <DetailItem label="ステータス" value={customer.status} />
            <DetailItem
              label="作成日"
              value={customer.createdAt.toISOString().slice(0, 10)}
            />
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="text-lg font-semibold">関連商談</h2>
          <ul className="mt-2 space-y-1">
            {customer.deals.length === 0 && (
              <li className="text-sm text-zinc-500">関連商談がありません</li>
            )}
            {customer.deals.map((deal) => (
              <li key={deal.id} className="text-sm">
                <Link
                  className="text-blue-600 hover:underline"
                  href={`/sales/deals/${deal.id}`}
                >
                  {deal.title}
                </Link>
                <span className="ml-2 text-zinc-500">{deal.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppShell>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-base">{value}</p>
    </div>
  );
}
