"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

type FormValues = {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  status: "ACTIVE" | "DORMANT";
};

export default function CustomerNewPage() {
  const router = useRouter();
  const { register, handleSubmit, formState } = useForm<FormValues>({
    defaultValues: { status: "ACTIVE" },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("保存に失敗しました");
      router.push("/sales/customers");
    } catch (error) {
      alert("作成に失敗しました");
    }
  };

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">顧客登録</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4"
      >
        <div>
          <label className="block text-sm font-medium">会社名*</label>
          <input
            {...register("companyName", { required: true })}
            className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">担当者*</label>
          <input
            {...register("contactName", { required: true })}
            className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">メール*</label>
          <input
            type="email"
            {...register("email", { required: true })}
            className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">電話</label>
          <input
            {...register("phone")}
            className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">ステータス*</label>
          <select
            {...register("status")}
            className="mt-1 w-full rounded-md border border-zinc-300 px-2 py-1"
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="DORMANT">DORMANT</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border border-zinc-300 px-3 py-2"
          >
            キャンセル
          </button>
          <button
            disabled={formState.isSubmitting}
            type="submit"
            className="rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
          >
            保存
          </button>
        </div>
      </form>
    </div>
  );
}
