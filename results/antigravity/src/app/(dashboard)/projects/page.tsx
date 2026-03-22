import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    where: { isDeleted: false },
    include: {
      department: true,
      tasks: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">案件一覧</h1>
        <Link href="/projects/new">
          <Button>新規作成</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>案件リスト</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>案件名</TableHead>
                <TableHead>部署</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>進捗率</TableHead>
                <TableHead>期限</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                    データがありません
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((p) => {
                  const totalTasks = p.tasks.length
                  const completedTasks = p.tasks.filter(t => t.status === 'DONE').length
                  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.department.name}</TableCell>
                      <TableCell>
                        <Badge variant={p.status === 'COMPLETED' ? 'default' : p.status === 'IN_PROGRESS' ? 'secondary' : 'outline'}>
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                          </div>
                          <span className="text-xs text-muted-foreground">{progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{p.endDate.toISOString().split('T')[0]}</TableCell>
                      <TableCell>
                        <Link href={`/projects/${p.id}`} className="text-indigo-600 hover:underline">
                          詳細
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
