import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      include: {
        department: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        position: true,
        hireDate: true,
        department: true,
        createdAt: true,
      },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Users fetch error:', error)
    return NextResponse.json(
      { error: 'ユーザー一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, ...userData } = body

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に登録されています' },
        { status: 400 }
      )
    }

    // TODO: パスワードをハッシュ化
    const hashedPassword = password // 本当はbcryptなどでハッシュ化

    const user = await prisma.user.create({
      data: {
        ...userData,
        email,
        password: hashedPassword,
      },
      include: {
        department: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        position: true,
        hireDate: true,
        department: true,
        createdAt: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('User creation error:', error)
    return NextResponse.json(
      { error: 'ユーザーの作成に失敗しました' },
      { status: 500 }
    )
  }
}
