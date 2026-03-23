'use client'

import React from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Edit, Trash2, Eye, CheckCircle, XCircle, Clock } from 'lucide-react'

interface Expense {
  id: string
  amount: number
  category: 'TRAVEL' | 'ENTERTAINMENT' | 'SUPPLIES' | 'OTHER'
  description: string
  expenseDate: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  applicant: {
    id: string
    name: string
    email: string
  }
  approver?: {
    id: string
    name: string
    email: string
  }
  approverComment?: string
  approvedAt?: string
  createdAt: string
}

export default function FinancePage() {
  const [expenses, setExpenses] = React.useState<Expense[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [filterStatus, setFilterStatus] = React.useState<string>('ALL')
  const [showCreateModal, setShowCreateModal] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<'my' | 'all' | 'pending'>('my')

  React.useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      const response = await fetch('/api/expenses')
      const data = await response.json()
      setExpenses(data)
    } catch (error) {
      console.error('Failed to fetch expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.applicant.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'ALL' || expense.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return '承認待ち'
      case 'APPROVED': return '承認済み'
      case 'REJECTED': return '却下'
      default: return status
    }
  }

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'TRAVEL': return '旅費交通費'
      case 'ENTERTAINMENT': return '交際費'
      case 'SUPPLIES': return '備品費'
      case 'OTHER': return 'その他'
      default: return category
    }
  }

  const handleApprove = async (expenseId: string, approved: boolean, comment?: string) => {
    try {
      const response = await fetch(`/api/expenses/${expenseId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: approved ? 'APPROVED' : 'REJECTED',
          approverComment: comment,
        }),
      })

      if (response.ok) {
        fetchExpenses()
      }
    } catch (error) {
      console.error('Failed to approve expense:', error)
    }
  }

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
        { label: '財務管理' },
      ]}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">財務管理</h1>
            <p className="text-muted-foreground">
              経費申請と承認を管理します
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            経費を申請
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'my'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('my')}
          >
            自分の申請
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'pending'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('pending')}
          >
            承認待ち
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('all')}
          >
            全て
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="経費を検索..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="ALL">全てのステータス</option>
            <option value="PENDING">承認待ち</option>
            <option value="APPROVED">承認済み</option>
            <option value="REJECTED">却下</option>
          </select>
        </div>

        {/* Expenses Table */}
        <Card>
          <CardHeader>
            <CardTitle>経費一覧</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">申請者</th>
                    <th className="text-left p-2">金額</th>
                    <th className="text-left p-2">カテゴリ</th>
                    <th className="text-left p-2">説明</th>
                    <th className="text-left p-2">日付</th>
                    <th className="text-left p-2">ステータス</th>
                    <th className="text-left p-2">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense) => (
                    <tr key={expense.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <div>
                          <p className="font-medium">{expense.applicant.name}</p>
                          <p className="text-sm text-gray-500">{expense.applicant.email}</p>
                        </div>
                      </td>
                      <td className="p-2 font-medium">¥{expense.amount.toLocaleString()}</td>
                      <td className="p-2">
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                          {getCategoryText(expense.category)}
                        </span>
                      </td>
                      <td className="p-2 max-w-xs truncate" title={expense.description}>
                        {expense.description}
                      </td>
                      <td className="p-2">
                        {new Date(expense.expenseDate).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(expense.status)}`}>
                          {getStatusText(expense.status)}
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {expense.status === 'PENDING' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApprove(expense.id, true)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApprove(expense.id, false)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredExpenses.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  経費が見つかりません
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Expense Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">経費を申請</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">金額 *</label>
                <Input type="number" placeholder="金額を入力" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">カテゴリ *</label>
                <select className="w-full p-2 border rounded-md">
                  <option value="TRAVEL">旅費交通費</option>
                  <option value="ENTERTAINMENT">交際費</option>
                  <option value="SUPPLIES">備品費</option>
                  <option value="OTHER">その他</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">説明 *</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  placeholder="経費の詳細を入力"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">経費発生日 *</label>
                <Input type="date" />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                キャンセル
              </Button>
              <Button>申請</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
