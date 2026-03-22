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

export default async function EmployeesPage() {
  const employees = await prisma.user.findMany({
    where: { isActive: true },
    include: { department: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">従業員一覧</h1>
        <Link href="/hr/employees/new">
          <Button>新規登録</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>従業員リスト</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>氏名</TableHead>
                <TableHead>メールアドレス</TableHead>
                <TableHead>部署</TableHead>
                <TableHead>役職</TableHead>
                <TableHead>ロール</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                    データがありません
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.name}</TableCell>
                    <TableCell>{e.email}</TableCell>
                    <TableCell>{e.department?.name || '-'}</TableCell>
                    <TableCell>{e.position || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={e.role === 'ADMIN' ? 'destructive' : e.role === 'MANAGER' ? 'default' : 'secondary'}>
                        {e.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/hr/employees/${e.id}`} className="text-indigo-600 hover:underline">
                        詳細
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
