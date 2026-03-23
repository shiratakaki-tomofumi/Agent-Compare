'use client'

import React from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react'

interface Customer {
  id: string
  companyName: string
  contactName: string
  email: string
  phone?: string
  status: 'ACTIVE' | 'DORMANT'
  createdAt: string
}

export default function SalesPage() {
  const [customers, setCustomers] = React.useState<Customer[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [showCreateModal, setShowCreateModal] = React.useState(false)

  React.useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers')
      const data = await response.json()
      setCustomers(data)
    } catch (error) {
      console.error('Failed to fetch customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(customer =>
    customer.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <DashboardLayout
      breadcrumbItems={[
        { label: 'ダッシュボード', href: '/' },
        { label: '営業管理' },
      ]}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">営業管理</h1>
            <p className="text-muted-foreground">
              顧客と商談を管理します
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            顧客を追加
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="顧客を検索..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Customers Table */}
        <Card>
          <CardHeader>
            <CardTitle>顧客一覧</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">会社名</th>
                    <th className="text-left p-2">担当者名</th>
                    <th className="text-left p-2">メールアドレス</th>
                    <th className="text-left p-2">電話番号</th>
                    <th className="text-left p-2">ステータス</th>
                    <th className="text-left p-2">作成日</th>
                    <th className="text-left p-2">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{customer.companyName}</td>
                      <td className="p-2">{customer.contactName}</td>
                      <td className="p-2">{customer.email}</td>
                      <td className="p-2">{customer.phone || '-'}</td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            customer.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {customer.status === 'ACTIVE' ? 'アクティブ' : '休眠'}
                        </span>
                      </td>
                      <td className="p-2">
                        {new Date(customer.createdAt).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="p-2">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredCustomers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  顧客が見つかりません
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Customer Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">新規顧客を追加</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">会社名 *</label>
                <Input placeholder="会社名を入力" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">担当者名 *</label>
                <Input placeholder="担当者名を入力" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">メールアドレス *</label>
                <Input type="email" placeholder="メールアドレスを入力" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">電話番号</label>
                <Input placeholder="電話番号を入力" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ステータス</label>
                <select className="w-full p-2 border rounded-md">
                  <option value="ACTIVE">アクティブ</option>
                  <option value="DORMANT">休眠</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                キャンセル
              </Button>
              <Button>作成</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
