'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createExpense } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import Link from 'next/link'

export default function NewExpensePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    try {
      await createExpense({
        amount: Number(formData.get('amount')),
        category: formData.get('category') as 'TRAVEL' | 'ENTERTAINMENT' | 'SUPPLIES' | 'OTHER',
        description: formData.get('description') as string,
        expenseDate: new Date(formData.get('expenseDate') as string),
      })
      toast.success('経費を申請しました')
      router.push('/finance/expenses')
    } catch (error) {
      toast.error('エラーが発生しました')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">経費の新規申請</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>申請内容</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="expenseDate">発生日 *</Label>
              <Input id="expenseDate" name="expenseDate" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">カテゴリ *</Label>
              <select 
                id="category" 
                name="category" 
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="TRAVEL">交通費・宿泊費 (TRAVEL)</option>
                <option value="ENTERTAINMENT">交際費 (ENTERTAINMENT)</option>
                <option value="SUPPLIES">消耗品費 (SUPPLIES)</option>
                <option value="OTHER">その他 (OTHER)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">金額 (円) *</Label>
              <Input id="amount" name="amount" type="number" min="1" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">説明・目的 *</Label>
              <Textarea id="description" name="description" rows={3} required />
            </div>
            
            <div className="flex justify-end space-x-4">
              <Link href="/finance/expenses">
                <Button variant="outline" type="button">キャンセル</Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? '申請中...' : '申請する'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
