import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const applicantId = searchParams.get('applicantId')

    const where: any = {}
    if (status) where.status = status
    if (applicantId) where.applicantId = applicantId

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        applicant: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(expenses)
  } catch (error) {
    console.error('Expenses fetch error:', error)
    return NextResponse.json(
      { error: '経費一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { expenseDate, ...expenseData } = body
    
    // TODO: 認証から現在のユーザーを取得
    const currentUser = await prisma.user.findFirst({
      where: { email: 'user@example.com' },
    })

    if (!currentUser) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 }
      )
    }

    const expense = await prisma.expense.create({
      data: {
        ...expenseData,
        expenseDate: new Date(expenseDate),
        applicantId: currentUser.id,
      },
      include: {
        applicant: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(expense)
  } catch (error) {
    console.error('Expense creation error:', error)
    return NextResponse.json(
      { error: '経費申請の作成に失敗しました' },
      { status: 500 }
    )
  }
}
