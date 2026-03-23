'use client'

import React from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Edit, Trash2, Eye, Users, Building, Calendar } from 'lucide-react'

interface Employee {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'MANAGER' | 'MEMBER'
  position?: string
  hireDate?: string
  department?: {
    id: string
    name: string
  }
  createdAt: string
}

interface Department {
  id: string
  name: string
  description?: string
  _count: {
    users: number
    projects: number
  }
  createdAt: string
}

export default function HRPage() {
  const [employees, setEmployees] = React.useState<Employee[]>([])
  const [departments, setDepartments] = React.useState<Department[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [activeTab, setActiveTab] = React.useState<'employees' | 'departments'>('employees')
  const [showCreateModal, setShowCreateModal] = React.useState(false)

  React.useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [employeesRes, departmentsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/departments')
      ])
      
      const employeesData = await employeesRes.json()
      const departmentsData = await departmentsRes.json()
      
      setEmployees(employeesData)
      setDepartments(departmentsData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredDepartments = departments.filter(department =>
    department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    department.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800'
      case 'MANAGER': return 'bg-blue-100 text-blue-800'
      case 'MEMBER': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case 'ADMIN': return '管理者'
      case 'MANAGER': return 'マネージャー'
      case 'MEMBER': return 'メンバー'
      default: return role
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
        { label: '人事管理' },
      ]}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">人事管理</h1>
            <p className="text-muted-foreground">
              従業員と部署を管理します
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {activeTab === 'employees' ? '従業員を追加' : '部署を追加'}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">総従業員数</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employees.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">部署数</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{departments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">管理者</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {employees.filter(e => e.role === 'ADMIN').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">マネージャー</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {employees.filter(e => e.role === 'MANAGER').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'employees'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('employees')}
          >
            従業員管理
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'departments'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('departments')}
          >
            部署管理
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={activeTab === 'employees' ? '従業員を検索...' : '部署を検索...'}
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Employees Table */}
        {activeTab === 'employees' && (
          <Card>
            <CardHeader>
              <CardTitle>従業員一覧</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">氏名</th>
                      <th className="text-left p-2">メールアドレス</th>
                      <th className="text-left p-2">役職</th>
                      <th className="text-left p-2">部署</th>
                      <th className="text-left p-2">ロール</th>
                      <th className="text-left p-2">入社日</th>
                      <th className="text-left p-2">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((employee) => (
                      <tr key={employee.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{employee.name}</td>
                        <td className="p-2">{employee.email}</td>
                        <td className="p-2">{employee.position || '-'}</td>
                        <td className="p-2">{employee.department?.name || '-'}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${getRoleColor(employee.role)}`}>
                            {getRoleText(employee.role)}
                          </span>
                        </td>
                        <td className="p-2">
                          {employee.hireDate 
                            ? new Date(employee.hireDate).toLocaleDateString('ja-JP')
                            : '-'
                          }
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
                {filteredEmployees.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    従業員が見つかりません
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Departments Grid */}
        {activeTab === 'departments' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredDepartments.map((department) => (
              <Card key={department.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{department.name}</CardTitle>
                      {department.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {department.description}
                        </p>
                      )}
                    </div>
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>所属従業員</span>
                      <span className="font-medium">{department._count.users}人</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>担当案件</span>
                      <span className="font-medium">{department._count.projects}件</span>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredDepartments.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">部署が見つかりません</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {activeTab === 'employees' ? '新規従業員を追加' : '新規部署を追加'}
            </h2>
            {activeTab === 'employees' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">氏名 *</label>
                  <Input placeholder="氏名を入力" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">メールアドレス *</label>
                  <Input type="email" placeholder="メールアドレスを入力" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">パスワード *</label>
                  <Input type="password" placeholder="パスワードを入力" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">役職</label>
                  <Input placeholder="役職を入力" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">部署</label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="">部署を選択</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">ロール *</label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="MEMBER">メンバー</option>
                    <option value="MANAGER">マネージャー</option>
                    <option value="ADMIN">管理者</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">入社日</label>
                  <Input type="date" />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">部署名 *</label>
                  <Input placeholder="部署名を入力" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">説明</label>
                  <textarea
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    placeholder="部署の説明を入力"
                  />
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                キャンセル
              </Button>
              <Button>
                {activeTab === 'employees' ? '作成' : '作成'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
