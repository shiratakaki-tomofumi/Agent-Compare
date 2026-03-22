'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createEmployee } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import Link from 'next/link'

export default function NewEmployeePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    try {
      await createEmployee({
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        role: formData.get('role') as 'ADMIN' | 'MANAGER' | 'MEMBER',
        departmentId: formData.get('departmentId') as string || undefined,
        position: formData.get('position') as string,
        hireDate: formData.get('hireDate') ? new Date(formData.get('hireDate') as string) : undefined,
      })
      toast.success('従業員を登録しました')
      router.push('/hr/employees')
    } catch (error) {
      toast.error('エラーが発生しました')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">従業員の新規登録</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">氏名 *</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス *</Label>
                <Input id="email" name="email" type="email" required />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">ロール *</Label>
                <select 
                  id="role" 
                  name="role" 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="MEMBER">一般社員 (MEMBER)</option>
                  <option value="MANAGER">マネージャー (MANAGER)</option>
                  <option value="ADMIN">管理者 (ADMIN)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="departmentId">部署ID</Label>
                <Input id="departmentId" name="departmentId" placeholder="部署IDを直接入力(仮)" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">役職</Label>
                <Input id="position" name="position" placeholder="例: 営業部長" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hireDate">入社日</Label>
                <Input id="hireDate" name="hireDate" type="date" />
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 pt-4">
              <Link href="/hr/employees">
                <Button variant="outline" type="button">キャンセル</Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? '登録中...' : '登録'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
