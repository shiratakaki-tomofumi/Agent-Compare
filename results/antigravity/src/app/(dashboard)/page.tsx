import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Users, Briefcase, FolderKanban, Receipt } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/login')
  }

  const [customerCount, projectCount, expenseCount, userCount] = await Promise.all([
    prisma.customer.count({ where: { isDeleted: false } }),
    prisma.project.count({ where: { status: 'IN_PROGRESS', isDeleted: false } }),
    prisma.expense.count({ where: { status: 'PENDING' } }),
    prisma.user.count({ where: { isActive: true } }),
  ])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Sales KPI */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">顧客数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerCount} 社</div>
          </CardContent>
        </Card>

        {/* Projects KPI */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">進行中案件</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectCount} 件</div>
          </CardContent>
        </Card>

        {/* Finance KPI */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">承認待ち経費</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expenseCount} 件</div>
          </CardContent>
        </Card>

        {/* HR KPI */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">従業員数</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount} 名</div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed placeholder */}
      <h2 className="text-lg font-semibold mt-8 mb-4">最近のアクティビティ</h2>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">アクティビティはまだありません</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
