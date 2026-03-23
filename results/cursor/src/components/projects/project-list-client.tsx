"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { format } from "date-fns";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface ProjectRow {
  id: string;
  name: string;
  departmentName: string;
  status: string;
  startDate: string;
  endDate: string;
  progress: number;
  totalTasks: number;
  doneTasks: number;
}

interface Props {
  projects: ProjectRow[];
  currentPage: number;
  totalPages: number;
  currentSearch: string;
  currentStatus: string;
  canCreate: boolean;
  statusLabels: Record<string, string>;
}

export function ProjectListClient({
  projects,
  currentPage,
  totalPages,
  currentSearch,
  currentStatus,
  canCreate,
  statusLabels,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(currentSearch);

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    if (updates.status !== undefined || updates.search !== undefined) {
      params.delete("page");
    }
    router.push(`/projects?${params.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateParams({ search });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="案件名で検索..."
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
          <SelectTrigger className="w-36">
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

        {canCreate && (
          <Link href="/projects/new" className="ml-auto">
            <Button>
              <Plus className="size-4" />
              新規案件
            </Button>
          </Link>
        )}
      </div>

      {projects.length === 0 ? (
        <EmptyState message="案件がありません" />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>案件名</TableHead>
                <TableHead>担当部署</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>開始日</TableHead>
                <TableHead>終了予定日</TableHead>
                <TableHead>進捗率</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow
                  key={project.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/projects/${project.id}`)}
                >
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>{project.departmentName}</TableCell>
                  <TableCell>
                    <StatusBadge status={project.status} labels={statusLabels} />
                  </TableCell>
                  <TableCell>
                    {format(new Date(project.startDate), "yyyy/MM/dd")}
                  </TableCell>
                  <TableCell>
                    {format(new Date(project.endDate), "yyyy/MM/dd")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary transition-all"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {project.progress}% ({project.doneTasks}/{project.totalTasks})
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => updateParams({ page: String(page) })}
          />
        </>
      )}
    </div>
  );
}
