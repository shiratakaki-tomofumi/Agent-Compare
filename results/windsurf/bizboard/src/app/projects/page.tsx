'use client'

import React from 'react'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Edit, Trash2, Eye, CheckCircle, Clock } from 'lucide-react'

interface Project {
  id: string
  name: string
  description?: string
  status: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD'
  startDate: string
  endDate: string
  completedTasks: number
  totalTasks: number
  department: {
    id: string
    name: string
  }
  createdAt: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = React.useState<Project[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [showCreateModal, setShowCreateModal] = React.useState(false)

  React.useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      const data = await response.json()
      setProjects(data)
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.department.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNING': return 'bg-gray-100 text-gray-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'ON_HOLD': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PLANNING': return '計画中'
      case 'IN_PROGRESS': return '進行中'
      case 'COMPLETED': return '完了'
      case 'ON_HOLD': return '保留'
      default: return status
    }
  }

  const getProgressPercentage = (completed: number, total: number) => {
    if (total === 0) return 0
    return Math.round((completed / total) * 100)
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
        { label: '案件管理' },
      ]}
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">案件管理</h1>
            <p className="text-muted-foreground">
              案件とタスクを管理します
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            案件を追加
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="案件を検索..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {project.department.name}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(project.status)}`}>
                    {getStatusText(project.status)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {project.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {project.description}
                  </p>
                )}
                
                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>進捗</span>
                    <span>{project.completedTasks}/{project.totalTasks} タスク</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${getProgressPercentage(project.completedTasks, project.totalTasks)}%`
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {getProgressPercentage(project.completedTasks, project.totalTasks)}% 完了
                  </p>
                </div>

                {/* Dates */}
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    開始: {new Date(project.startDate).toLocaleDateString('ja-JP')}
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    終了: {new Date(project.endDate).toLocaleDateString('ja-JP')}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-2 mt-4">
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
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">案件が見つかりません</p>
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">新規案件を追加</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">案件名 *</label>
                <Input placeholder="案件名を入力" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">説明</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  placeholder="案件の説明を入力"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">部署 *</label>
                <select className="w-full p-2 border rounded-md">
                  <option value="">部署を選択</option>
                  <option value="1">開発部</option>
                  <option value="2">営業部</option>
                  <option value="3">人事部</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">開始日 *</label>
                <Input type="date" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">終了予定日 *</label>
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
              <Button>作成</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
