import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(customers)
  } catch (error) {
    console.error('Customers fetch error:', error)
    return NextResponse.json(
      { error: '顧客一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const customer = await prisma.customer.create({
      data: {
        companyName: body.companyName,
        contactName: body.contactName,
        email: body.email,
        phone: body.phone,
        status: body.status || 'ACTIVE',
      },
    })

    return NextResponse.json(customer)
  } catch (error) {
    console.error('Customer creation error:', error)
    return NextResponse.json(
      { error: '顧客の作成に失敗しました' },
      { status: 500 }
    )
  }
}
