"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { type ReactNode, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CustomerStatus, DealStatus, ExpenseCategory, ProjectStatus, Role, TaskPriority, TaskStatus } from "@prisma/client";
import { toast } from "sonner";
import { z } from "zod";

import {
  customerSchema,
  dealSchema,
  departmentSchema,
  employeeSchema,
  expenseSchema,
  projectSchema,
  taskSchema
} from "@/lib/validators";
import { MutationButton, Panel, StatusBadge } from "@/components/ui";
import {
  CUSTOMER_STATUS_LABELS,
  DEAL_STATUS_LABELS,
  EXPENSE_CATEGORY_LABELS,
  PROJECT_STATUS_LABELS,
  ROLE_LABELS,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS
} from "@/lib/constants";
import { canManage } from "@/lib/permissions";
import { formatCurrency, toDateInputValue } from "@/lib/utils";

type ActionResult = {
  success: boolean;
  message: string;
  redirectTo?: string;
};

type ActionFn<T> = (payload: T) => Promise<ActionResult>;
type TaskFormValues = z.infer<typeof taskSchema>;

function submitWithToast<T>(
  action: ActionFn<T>,
  values: T,
  router: ReturnType<typeof useRouter>,
  setBusy: (callback: () => Promise<void>) => void
) {
  setBusy(async () => {
    const result = await action(values);
    if (result.success) {
      toast.success(result.message);
      if (result.redirectTo) {
        router.push(result.redirectTo);
        return;
      }
      router.refresh();
      return;
    }

    toast.error(result.message);
  });
}

function FormShell({
  title,
  description,
  children,
  footer
}: {
  title: string;
  description?: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <Panel title={title} description={description}>
      <div className="space-y-5">{children}</div>
      <div className="mt-6 flex flex-wrap justify-end gap-3">{footer}</div>
    </Panel>
  );
}

function Field({
  label,
  required,
  error,
  children
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-1 text-rose-600">*</span>}
      </span>
      {children}
      {error && <p className="text-sm text-rose-600">{error}</p>}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-ocean transition focus:ring-2" />;
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className="min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-ocean transition focus:ring-2" />;
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-ocean transition focus:ring-2" />;
}

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const email = String(formData.get("email") ?? "");
        const password = String(formData.get("password") ?? "");
        setError(null);

        startTransition(async () => {
          const result = await signIn("credentials", {
            email,
            password,
            redirect: false
          });

          if (result?.error) {
            setError("メールアドレスまたはパスワードが正しくありません");
            return;
          }

          toast.success("ログインしました");
          router.push("/");
          router.refresh();
        });
      }}
    >
      <Field label="メールアドレス" required>
        <Input name="email" type="email" autoComplete="email" required />
      </Field>
      <Field label="パスワード" required>
        <Input name="password" type="password" autoComplete="current-password" required />
      </Field>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <button
        type="submit"
        className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white"
        disabled={isPending}
      >
        {isPending ? "ログイン中..." : "ログイン"}
      </button>
    </form>
  );
}

export function CustomerForm({
  initialValues,
  action
}: {
  initialValues?: {
    companyName: string;
    contactName: string;
    email: string;
    phone: string | null;
    status: CustomerStatus;
  };
  action: ActionFn<{
    companyName: string;
    contactName: string;
    email: string;
    phone?: string;
    status: CustomerStatus;
  }>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      companyName: initialValues?.companyName ?? "",
      contactName: initialValues?.contactName ?? "",
      email: initialValues?.email ?? "",
      phone: initialValues?.phone ?? "",
      status: initialValues?.status ?? "ACTIVE"
    }
  });

  return (
    <FormShell
      title={initialValues ? "顧客編集" : "顧客登録"}
      footer={
        <>
          <Link href="/sales/customers" className="rounded-full border border-slate-300 px-5 py-3 text-sm font-medium">
            キャンセル
          </Link>
          <button
            type="button"
            onClick={form.handleSubmit((values) =>
              submitWithToast(action, values, router, startTransition)
            )}
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white"
            disabled={isPending}
          >
            {isPending ? "保存中..." : "保存"}
          </button>
        </>
      }
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="会社名" required error={form.formState.errors.companyName?.message}>
          <Input {...form.register("companyName")} />
        </Field>
        <Field label="担当者名" required error={form.formState.errors.contactName?.message}>
          <Input {...form.register("contactName")} />
        </Field>
        <Field label="メールアドレス" required error={form.formState.errors.email?.message}>
          <Input {...form.register("email")} type="email" />
        </Field>
        <Field label="電話番号" error={form.formState.errors.phone?.message}>
          <Input {...form.register("phone")} />
        </Field>
      </div>
      <Field label="ステータス" required error={form.formState.errors.status?.message}>
        <Select {...form.register("status")}>
          {Object.entries(CUSTOMER_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </Field>
    </FormShell>
  );
}

export function DealForm({
  initialValues,
  customers,
  users,
  action
}: {
  initialValues?: {
    title: string;
    customerId: string;
    assigneeId: string;
    amount: number;
    probability: number;
    status: DealStatus;
    note: string | null;
    closedAt: Date | null;
  };
  customers: { id: string; companyName: string }[];
  users: { id: string; name: string }[];
  action: ActionFn<{
    title: string;
    customerId: string;
    assigneeId: string;
    amount: number;
    probability: number;
    status: DealStatus;
    note?: string;
    closedAt?: string;
  }>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      title: initialValues?.title ?? "",
      customerId: initialValues?.customerId ?? "",
      assigneeId: initialValues?.assigneeId ?? "",
      amount: initialValues?.amount ?? 0,
      probability: initialValues?.probability ?? 0,
      status: initialValues?.status ?? "LEAD",
      note: initialValues?.note ?? "",
      closedAt: toDateInputValue(initialValues?.closedAt)
    }
  });

  return (
    <FormShell
      title={initialValues ? "商談編集" : "商談作成"}
      footer={
        <>
          <Link href="/sales/deals" className="rounded-full border border-slate-300 px-5 py-3 text-sm font-medium">
            キャンセル
          </Link>
          <button
            type="button"
            onClick={form.handleSubmit((values) =>
              submitWithToast(action, values, router, startTransition)
            )}
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white"
            disabled={isPending}
          >
            {isPending ? "保存中..." : "保存"}
          </button>
        </>
      }
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="商談名" required error={form.formState.errors.title?.message}>
          <Input {...form.register("title")} />
        </Field>
        <Field label="顧客" required error={form.formState.errors.customerId?.message}>
          <Select {...form.register("customerId")}>
            <option value="">選択してください</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.companyName}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="金額" required error={form.formState.errors.amount?.message}>
          <Input {...form.register("amount", { valueAsNumber: true })} type="number" min={0} />
        </Field>
        <Field label="確度 (%)" required error={form.formState.errors.probability?.message}>
          <Input {...form.register("probability", { valueAsNumber: true })} type="number" min={0} max={100} />
        </Field>
        <Field label="ステータス" required error={form.formState.errors.status?.message}>
          <Select {...form.register("status")}>
            {Object.entries(DEAL_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="担当者" required error={form.formState.errors.assigneeId?.message}>
          <Select {...form.register("assigneeId")}>
            <option value="">選択してください</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="クローズ日">
          <Input {...form.register("closedAt")} type="date" />
        </Field>
      </div>
      <Field label="メモ" error={form.formState.errors.note?.message}>
        <Textarea {...form.register("note")} />
      </Field>
    </FormShell>
  );
}

export function ProjectForm({
  initialValues,
  departments,
  action
}: {
  initialValues?: {
    name: string;
    description: string | null;
    departmentId: string;
    status: ProjectStatus;
    startDate: Date;
    endDate: Date;
  };
  departments: { id: string; name: string }[];
  action: ActionFn<{
    name: string;
    description?: string;
    departmentId: string;
    status: ProjectStatus;
    startDate: string;
    endDate: string;
  }>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? "",
      departmentId: initialValues?.departmentId ?? "",
      status: initialValues?.status ?? "PLANNING",
      startDate: toDateInputValue(initialValues?.startDate),
      endDate: toDateInputValue(initialValues?.endDate)
    }
  });

  return (
    <FormShell
      title={initialValues ? "案件編集" : "案件作成"}
      footer={
        <>
          <Link href="/projects" className="rounded-full border border-slate-300 px-5 py-3 text-sm font-medium">
            キャンセル
          </Link>
          <button
            type="button"
            onClick={form.handleSubmit((values) =>
              submitWithToast(action, values, router, startTransition)
            )}
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white"
            disabled={isPending}
          >
            {isPending ? "保存中..." : "保存"}
          </button>
        </>
      }
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="案件名" required error={form.formState.errors.name?.message}>
          <Input {...form.register("name")} />
        </Field>
        <Field label="担当部署" required error={form.formState.errors.departmentId?.message}>
          <Select {...form.register("departmentId")}>
            <option value="">選択してください</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="ステータス" required error={form.formState.errors.status?.message}>
          <Select {...form.register("status")}>
            {Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="開始日" required error={form.formState.errors.startDate?.message}>
          <Input {...form.register("startDate")} type="date" />
        </Field>
        <Field label="終了予定日" required error={form.formState.errors.endDate?.message}>
          <Input {...form.register("endDate")} type="date" />
        </Field>
      </div>
      <Field label="説明" error={form.formState.errors.description?.message}>
        <Textarea {...form.register("description")} />
      </Field>
    </FormShell>
  );
}

export function TaskManager({
  projectId,
  users,
  tasks,
  role,
  onCreate,
  onUpdate,
  onDelete
}: {
  projectId: string;
  users: { id: string; name: string }[];
  tasks: {
    id: string;
    title: string;
    description: string | null;
    assigneeId: string | null;
    assignee?: { id: string; name: string } | null;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate: Date | null;
  }[];
  role: Role;
  onCreate: ActionFn<{
    projectId: string;
    title: string;
    description?: string;
    assigneeId?: string;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate?: string;
  }>;
  onUpdate: (taskId: string, payload: {
    projectId: string;
    title: string;
    description?: string;
    assigneeId?: string;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate?: string;
  }) => Promise<ActionResult>;
  onDelete: (taskId: string) => Promise<ActionResult>;
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const editable = canManage(role);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      projectId,
      title: "",
      description: "",
      assigneeId: "",
      priority: "MEDIUM",
      status: "TODO",
      dueDate: ""
    }
  });

  const editForm = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      projectId,
      title: "",
      description: "",
      assigneeId: "",
      priority: "MEDIUM",
      status: "TODO",
      dueDate: ""
    }
  });

  return (
    <div className="space-y-5">
      {editable && (
        <Panel title="タスク追加">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="タスク名" required error={form.formState.errors.title?.message}>
              <Input {...form.register("title")} />
            </Field>
            <Field label="担当者" error={form.formState.errors.assigneeId?.message}>
              <Select {...form.register("assigneeId")}>
                <option value="">未設定</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="優先度" required error={form.formState.errors.priority?.message}>
              <Select {...form.register("priority")}>
                {Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="ステータス" required error={form.formState.errors.status?.message}>
              <Select {...form.register("status")}>
                {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="期限" error={form.formState.errors.dueDate?.message}>
              <Input {...form.register("dueDate")} type="date" />
            </Field>
          </div>
          <Field label="説明" error={form.formState.errors.description?.message}>
            <Textarea {...form.register("description")} />
          </Field>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={form.handleSubmit((values) =>
                submitWithToast(onCreate, values, router, startTransition)
              )}
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white"
              disabled={isPending}
            >
              {isPending ? "保存中..." : "タスク追加"}
            </button>
          </div>
        </Panel>
      )}

      {tasks.length === 0 && <p className="text-sm text-slate-500">タスクはまだありません。</p>}

      {tasks.map((task) => {
        const isEditing = editingId === task.id;

        if (isEditing) {
          if (editForm.getValues("title") === "") {
            editForm.reset({
              projectId,
              title: task.title,
              description: task.description ?? "",
              assigneeId: task.assigneeId ?? "",
              priority: task.priority,
              status: task.status,
              dueDate: toDateInputValue(task.dueDate)
            });
          }

          return (
            <Panel key={task.id} title={`タスク編集: ${task.title}`}>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="タスク名" required error={editForm.formState.errors.title?.message}>
                  <Input {...editForm.register("title")} />
                </Field>
                <Field label="担当者" error={editForm.formState.errors.assigneeId?.message}>
                  <Select {...editForm.register("assigneeId")}>
                    <option value="">未設定</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="優先度" required error={editForm.formState.errors.priority?.message}>
                  <Select {...editForm.register("priority")}>
                    {Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="ステータス" required error={editForm.formState.errors.status?.message}>
                  <Select {...editForm.register("status")}>
                    {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="期限" error={editForm.formState.errors.dueDate?.message}>
                  <Input {...editForm.register("dueDate")} type="date" />
                </Field>
              </div>
              <Field label="説明" error={editForm.formState.errors.description?.message}>
                <Textarea {...editForm.register("description")} />
              </Field>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setEditingId(null)} className="rounded-full border border-slate-300 px-5 py-3 text-sm">
                  キャンセル
                </button>
                <button
                  type="button"
                  className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white"
                  onClick={editForm.handleSubmit((values) =>
                    submitWithToast(
                      (payload) => onUpdate(task.id, payload),
                      values,
                      router,
                      startTransition
                    )
                  )}
                >
                  保存
                </button>
              </div>
            </Panel>
          );
        }

        return (
          <div key={task.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium text-slate-900">{task.title}</h3>
                  <StatusBadge value={task.status} />
                  <StatusBadge value={task.priority} />
                </div>
                <p className="mt-2 text-sm text-slate-600">{task.description || "説明なし"}</p>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
                  <span>担当者: {task.assignee?.name ?? "未設定"}</span>
                  <span>期限: {task.dueDate ? toDateInputValue(task.dueDate) : "-"}</span>
                </div>
              </div>
              {editable && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded-full border border-slate-300 px-4 py-2 text-sm"
                    onClick={() => {
                      editForm.reset({
                        projectId,
                        title: task.title,
                        description: task.description ?? "",
                        assigneeId: task.assigneeId ?? "",
                        priority: task.priority,
                        status: task.status,
                        dueDate: toDateInputValue(task.dueDate)
                      });
                      setEditingId(task.id);
                    }}
                  >
                    編集
                  </button>
                  <MutationButton
                    label="削除"
                    variant="danger"
                    confirmMessage="このタスクを削除しますか？"
                    action={() => onDelete(task.id)}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ExpenseForm({
  initialValues,
  action
}: {
  initialValues?: {
    amount: number;
    category: ExpenseCategory;
    description: string;
    expenseDate: Date;
  };
  action: ActionFn<{
    amount: number;
    category: ExpenseCategory;
    description: string;
    expenseDate: string;
  }>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: initialValues?.amount ?? 0,
      category: initialValues?.category ?? "TRAVEL",
      description: initialValues?.description ?? "",
      expenseDate: toDateInputValue(initialValues?.expenseDate)
    }
  });

  return (
    <FormShell
      title={initialValues ? "経費申請編集" : "経費申請"}
      footer={
        <>
          <Link href="/finance/expenses" className="rounded-full border border-slate-300 px-5 py-3 text-sm font-medium">
            キャンセル
          </Link>
          <button
            type="button"
            onClick={form.handleSubmit((values) =>
              submitWithToast(action, values, router, startTransition)
            )}
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white"
            disabled={isPending}
          >
            {isPending ? "保存中..." : "保存"}
          </button>
        </>
      }
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="金額" required error={form.formState.errors.amount?.message}>
          <Input {...form.register("amount", { valueAsNumber: true })} type="number" min={1} />
        </Field>
        <Field label="カテゴリ" required error={form.formState.errors.category?.message}>
          <Select {...form.register("category")}>
            {Object.entries(EXPENSE_CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="日付" required error={form.formState.errors.expenseDate?.message}>
          <Input {...form.register("expenseDate")} type="date" />
        </Field>
      </div>
      <Field label="説明" required error={form.formState.errors.description?.message}>
        <Textarea {...form.register("description")} />
      </Field>
    </FormShell>
  );
}

export function EmployeeForm({
  initialValues,
  departments,
  action
}: {
  initialValues?: {
    name: string;
    email: string;
    role: Role;
    departmentId: string | null;
    position: string | null;
    hireDate: Date | null;
    isActive: boolean;
  };
  departments: { id: string; name: string }[];
  action: ActionFn<{
    name: string;
    email: string;
    password?: string;
    role: Role;
    departmentId?: string;
    position?: string;
    hireDate?: string;
    isActive: boolean;
  }>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      email: initialValues?.email ?? "",
      password: "",
      role: initialValues?.role ?? "MEMBER",
      departmentId: initialValues?.departmentId ?? "",
      position: initialValues?.position ?? "",
      hireDate: toDateInputValue(initialValues?.hireDate),
      isActive: initialValues?.isActive ?? true
    }
  });

  return (
    <FormShell
      title={initialValues ? "従業員編集" : "従業員登録"}
      footer={
        <>
          <Link href="/hr/employees" className="rounded-full border border-slate-300 px-5 py-3 text-sm font-medium">
            キャンセル
          </Link>
          <button
            type="button"
            onClick={form.handleSubmit((values) =>
              submitWithToast(action, values, router, startTransition)
            )}
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white"
            disabled={isPending}
          >
            {isPending ? "保存中..." : "保存"}
          </button>
        </>
      }
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="氏名" required error={form.formState.errors.name?.message}>
          <Input {...form.register("name")} />
        </Field>
        <Field label="メールアドレス" required error={form.formState.errors.email?.message}>
          <Input {...form.register("email")} type="email" />
        </Field>
        <Field label="パスワード" error={form.formState.errors.password?.message}>
          <Input {...form.register("password")} type="password" />
        </Field>
        <Field label="ロール" required error={form.formState.errors.role?.message}>
          <Select {...form.register("role")}>
            {Object.entries(ROLE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="部署" error={form.formState.errors.departmentId?.message}>
          <Select {...form.register("departmentId")}>
            <option value="">未設定</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="役職" error={form.formState.errors.position?.message}>
          <Input {...form.register("position")} />
        </Field>
        <Field label="入社日" error={form.formState.errors.hireDate?.message}>
          <Input {...form.register("hireDate")} type="date" />
        </Field>
        <label className="flex items-center gap-3 pt-8">
          <input type="checkbox" {...form.register("isActive")} className="h-4 w-4 rounded border-slate-300" />
          <span className="text-sm font-medium text-slate-700">有効</span>
        </label>
      </div>
    </FormShell>
  );
}

export function DepartmentManager({
  departments,
  onCreate,
  onUpdate,
  onDelete
}: {
  departments: {
    id: string;
    name: string;
    description: string | null;
    _count: { users: number };
  }[];
  onCreate: ActionFn<{ name: string; description?: string }>;
  onUpdate: (departmentId: string, payload: { name: string; description?: string }) => Promise<ActionResult>;
  onDelete: (departmentId: string) => Promise<ActionResult>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const createForm = useForm({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: "",
      description: ""
    }
  });
  const editForm = useForm({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: "",
      description: ""
    }
  });

  return (
    <div className="space-y-5">
      <Panel title="部署追加">
        <div className="grid gap-4 md:grid-cols-[1fr_1.4fr_auto]">
          <Field label="部署名" required error={createForm.formState.errors.name?.message}>
            <Input {...createForm.register("name")} />
          </Field>
          <Field label="説明" error={createForm.formState.errors.description?.message}>
            <Input {...createForm.register("description")} />
          </Field>
          <div className="flex items-end">
            <button
              type="button"
              onClick={createForm.handleSubmit((values) =>
                submitWithToast(onCreate, values, router, startTransition)
              )}
              className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white"
              disabled={isPending}
            >
              追加
            </button>
          </div>
        </div>
      </Panel>

      {departments.map((department) => (
        <Panel key={department.id}>
          {editingId === department.id ? (
            <div className="grid gap-4 md:grid-cols-[1fr_1.4fr_auto_auto]">
              <Field label="部署名" required error={editForm.formState.errors.name?.message}>
                <Input {...editForm.register("name")} />
              </Field>
              <Field label="説明" error={editForm.formState.errors.description?.message}>
                <Input {...editForm.register("description")} />
              </Field>
              <div className="flex items-end">
                <button
                  type="button"
                  className="w-full rounded-full border border-slate-300 px-5 py-3 text-sm"
                  onClick={() => setEditingId(null)}
                >
                  キャンセル
                </button>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white"
                  onClick={editForm.handleSubmit((values) =>
                    submitWithToast(
                      (payload) => onUpdate(department.id, payload),
                      values,
                      router,
                      startTransition
                    )
                  )}
                >
                  保存
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-medium text-slate-900">{department.name}</h3>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                    所属 {department._count.users} 名
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{department.description || "説明なし"}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm"
                  onClick={() => {
                    editForm.reset({
                      name: department.name,
                      description: department.description ?? ""
                    });
                    setEditingId(department.id);
                  }}
                >
                  編集
                </button>
                <MutationButton
                  label="削除"
                  variant="danger"
                  confirmMessage="この部署を削除しますか？"
                  action={() => onDelete(department.id)}
                />
              </div>
            </div>
          )}
        </Panel>
      ))}
    </div>
  );
}

export function ExpenseApprovalList({
  items,
  approve,
  reject
}: {
  items: {
    id: string;
    applicant: { name: string; department: { name: string } | null };
    amount: number;
    category: ExpenseCategory;
    description: string;
    expenseDate: Date;
  }[];
  approve: (expenseId: string, comment: string) => Promise<ActionResult>;
  reject: (expenseId: string, comment: string) => Promise<ActionResult>;
}) {
  const router = useRouter();
  const [comments, setComments] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Panel key={item.id}>
          <div className="space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium text-slate-900">{item.description}</h3>
                  <StatusBadge value={item.category} />
                </div>
                <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">
                  <span>申請者: {item.applicant.name}</span>
                  <span>部署: {item.applicant.department?.name ?? "-"}</span>
                  <span>金額: {formatCurrency(item.amount)}</span>
                </div>
              </div>
              <StatusBadge value="PENDING" />
            </div>
            <Textarea
              placeholder="承認コメントを入力"
              value={comments[item.id] ?? ""}
              onChange={(event) =>
                setComments((current) => ({ ...current, [item.id]: event.target.value }))
              }
            />
            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
                disabled={isPending}
                onClick={() =>
                  submitWithToast(
                    (comment) => approve(item.id, comment),
                    comments[item.id] ?? "",
                    router,
                    startTransition
                  )
                }
              >
                承認
              </button>
              <button
                type="button"
                className="rounded-full bg-rose-600 px-4 py-2 text-sm font-medium text-white"
                disabled={isPending}
                onClick={() =>
                  submitWithToast(
                    (comment) => reject(item.id, comment),
                    comments[item.id] ?? "",
                    router,
                    startTransition
                  )
                }
              >
                却下
              </button>
            </div>
          </div>
        </Panel>
      ))}
    </div>
  );
}

export function DealStatusBoard({
  currentStatus,
  onChange,
  disabled
}: {
  currentStatus: DealStatus;
  onChange: (status: DealStatus) => Promise<ActionResult>;
  disabled: boolean;
}) {
  const statuses = useMemo(
    () => ["LEAD", "PROPOSAL", "NEGOTIATION", "WON", "LOST"] as const,
    []
  );

  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((status) => (
        <MutationButton
          key={status}
          label={DEAL_STATUS_LABELS[status]}
          action={() => onChange(status)}
          variant={currentStatus === status ? "primary" : "secondary"}
          refreshOnly
        />
      ))}
      {disabled && <p className="w-full text-sm text-slate-500">閲覧権限のため更新できません。</p>}
    </div>
  );
}
