import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: {
            users: true,
            projects: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(departments)
  } catch (error) {
    console.error('Departments fetch error:', error)
    return NextResponse.json(
      { error: '部署一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const department = await prisma.department.create({
      data: {
        name: body.name,
        description: body.description,
      },
      include: {
        _count: {
          select: {
            users: true,
            projects: true,
          },
        },
      },
    })

    return NextResponse.json(department)
  } catch (error) {
    console.error('Department creation error:', error)
    return NextResponse.json(
      { error: '部署の作成に失敗しました' },
      { status: 500 }
    )
  }
}
