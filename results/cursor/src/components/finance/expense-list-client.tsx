"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { format } from "date-fns";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/shared/status-badge";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ExpenseRow {
  id: string;
  applicantId: string;
  applicantName: string;
  amount: number;
  category: string;
  description: string;
  expenseDate: string;
  status: string;
  approverName: string | null;
  approverComment: string | null;
}

interface Props {
  expenses: ExpenseRow[];
  currentPage: number;
  totalPages: number;
  currentSearch: string;
  currentStatus: string;
  currentTab: string;
  currentUserId: string;
  statusLabels: Record<string, string>;
  categoryLabels: Record<string, string>;
}

export function ExpenseListClient({
  expenses,
  currentPage,
  totalPages,
  currentSearch,
  currentStatus,
  currentTab,
  currentUserId,
  statusLabels,
  categoryLabels,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(currentSearch);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    if (updates.status !== undefined || updates.search !== undefined || updates.tab !== undefined) {
      params.delete("page");
    }
    router.push(`/finance/expenses?${params.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateParams({ search });
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/finance/expenses/${deleteTarget}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "削除に失敗しました");
      }
      toast.success("経費申請を削除しました");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "削除に失敗しました");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  return (
    <div className="space-y-4">
      <Tabs
        defaultValue={currentTab}
        onValueChange={(val) => updateParams({ tab: val as string })}
      >
        <TabsList>
          <TabsTrigger value="mine">自分の申請</TabsTrigger>
          <TabsTrigger value="all">全体</TabsTrigger>
        </TabsList>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="説明で検索..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 w-60"
              />
            </div>
            <Button type="submit" variant="outline" size="sm">
              検索
            </Button>
          </form>

          <Select
            value={currentStatus}
            onValueChange={(val) => updateParams({ status: val as string })}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="ステータス" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">すべて</SelectItem>
              {Object.entries(statusLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Link href="/finance/expenses/new" className="ml-auto">
            <Button>
              <Plus className="size-4" />
              新規申請
            </Button>
          </Link>
        </div>

        <TabsContent value={currentTab}>
          {expenses.length === 0 ? (
            <EmptyState message="経費申請がありません" />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>申請者</TableHead>
                    <TableHead>金額</TableHead>
                    <TableHead>カテゴリ</TableHead>
                    <TableHead>説明</TableHead>
                    <TableHead>日付</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => {
                    const isOwner = expense.applicantId === currentUserId;
                    const isPending = expense.status === "PENDING";
                    const canModify = isOwner && isPending;

                    return (
                      <TableRow key={expense.id}>
                        <TableCell>{expense.applicantName}</TableCell>
                        <TableCell className="font-medium">
                          ¥{expense.amount.toLocaleString("ja-JP")}
                        </TableCell>
                        <TableCell>
                          {categoryLabels[expense.category] ?? expense.category}
                        </TableCell>
                        <TableCell className="max-w-48 truncate">
                          {expense.description}
                        </TableCell>
                        <TableCell>
                          {format(new Date(expense.expenseDate), "yyyy/MM/dd")}
                        </TableCell>
                        <TableCell>
                          <StatusBadge
                            status={expense.status}
                            labels={statusLabels}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          {canModify && (
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() =>
                                  router.push(
                                    `/finance/expenses/${expense.id}/edit`
                                  )
                                }
                              >
                                <Pencil className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => setDeleteTarget(expense.id)}
                              >
                                <Trash2 className="size-4 text-destructive" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => updateParams({ page: String(page) })}
              />
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>経費申請の削除</DialogTitle>
            <DialogDescription>
              この経費申請を削除してもよろしいですか？この操作は取り消せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "削除中..." : "削除する"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
