'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'

export async function createEmployee(data: {
  name: string
  email: string
  password?: string
  role: 'ADMIN' | 'MANAGER' | 'MEMBER'
  departmentId?: string
  position?: string
  hireDate?: Date
}) {
  const hashedPassword = await bcrypt.hash(data.password || 'password123', 10)

  const user = await prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
    },
  })
  revalidatePath('/hr/employees')
  return user
}

export async function deleteEmployee(id: string) {
  await prisma.user.update({
    where: { id },
    data: { isActive: false },
  })
  revalidatePath('/hr/employees')
}
