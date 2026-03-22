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
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function ExpensesPage() {
  const session = await getServerSession(authOptions)
  
  // Members only see their own, Managers/Admins see all (or their dept)
  // To keep it simple, Managers see all for now.
  const isManagerOrAdmin = session?.user?.role === 'MANAGER' || session?.user?.role === 'ADMIN'

  const expenses = await prisma.expense.findMany({
    where: isManagerOrAdmin ? undefined : { applicantId: session?.user?.id },
    include: { applicant: true, approver: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">経費申請一覧</h1>
        <Link href="/finance/expenses/new">
          <Button>新規申請</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>経費リスト {isManagerOrAdmin && '(全体)'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>申請日</TableHead>
                <TableHead>申請者</TableHead>
                <TableHead>カテゴリ</TableHead>
                <TableHead>説明</TableHead>
                <TableHead className="text-right">金額</TableHead>
                <TableHead>ステータス</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                    データがありません
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{e.createdAt.toISOString().split('T')[0]}</TableCell>
                    <TableCell>{e.applicant.name}</TableCell>
                    <TableCell>{e.category}</TableCell>
                    <TableCell className="max-w-xs truncate">{e.description}</TableCell>
                    <TableCell className="text-right">¥{e.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={e.status === 'APPROVED' ? 'default' : e.status === 'REJECTED' ? 'destructive' : 'secondary'}
                      >
                        {e.status}
                      </Badge>
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
