import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      where: { isDeleted: false },
      include: {
        department: true,
        tasks: {
          select: {
            id: true,
            status: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const projectsWithProgress = projects.map((project: any) => ({
      ...project,
      completedTasks: project.tasks.filter((task: any) => task.status === 'DONE').length,
      totalTasks: project._count.tasks,
    }))

    return NextResponse.json(projectsWithProgress)
  } catch (error) {
    console.error('Projects fetch error:', error)
    return NextResponse.json(
      { error: '案件一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { startDate, endDate, ...projectData } = body

    const project = await prisma.project.create({
      data: {
        ...projectData,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
      include: {
        department: true,
        tasks: true,
      },
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error('Project creation error:', error)
    return NextResponse.json(
      { error: '案件の作成に失敗しました' },
      { status: 500 }
    )
  }
}
