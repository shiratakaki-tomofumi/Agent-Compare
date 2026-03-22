'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createProject(data: {
  name: string
  description?: string
  departmentId: string
  startDate: Date
  endDate: Date
}) {
  const project = await prisma.project.create({
    data,
  })
  revalidatePath('/projects')
  return project
}

export async function deleteProject(id: string) {
  await prisma.project.update({
    where: { id },
    data: { isDeleted: true },
  })
  revalidatePath('/projects')
}
