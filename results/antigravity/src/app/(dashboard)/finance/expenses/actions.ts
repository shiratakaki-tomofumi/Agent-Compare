'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function createExpense(data: {
  amount: number
  category: 'TRAVEL' | 'ENTERTAINMENT' | 'SUPPLIES' | 'OTHER'
  description: string
  expenseDate: Date
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error('Unauthorized')

  const expense = await prisma.expense.create({
    data: {
      ...data,
      applicantId: session.user.id,
      status: 'PENDING',
    },
  })
  revalidatePath('/finance/expenses')
  return expense
}

export async function approveExpense(id: string, comment?: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role === 'MEMBER') throw new Error('Unauthorized')

  await prisma.expense.update({
    where: { id },
    data: {
      status: 'APPROVED',
      approverId: session.user.id,
      approverComment: comment,
      approvedAt: new Date(),
    },
  })
  revalidatePath('/finance/expenses')
}

export async function rejectExpense(id: string, comment?: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role === 'MEMBER') throw new Error('Unauthorized')

  await prisma.expense.update({
    where: { id },
    data: {
      status: 'REJECTED',
      approverId: session.user.id,
      approverComment: comment,
      approvedAt: new Date(),
    },
  })
  revalidatePath('/finance/expenses')
}
