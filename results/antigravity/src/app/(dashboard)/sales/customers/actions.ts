'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createCustomer(data: {
  companyName: string
  contactName: string
  email: string
  phone?: string
}) {
  const customer = await prisma.customer.create({
    data,
  })
  revalidatePath('/sales/customers')
  return customer
}

export async function deleteCustomer(id: string) {
  await prisma.customer.update({
    where: { id },
    data: { isDeleted: true },
  })
  revalidatePath('/sales/customers')
}
