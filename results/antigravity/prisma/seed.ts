import { PrismaClient, Role, Department } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Clear existing
  await prisma.deal.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.task.deleteMany()
  await prisma.project.deleteMany()
  await prisma.expense.deleteMany()
  await prisma.attendance.deleteMany()
  await prisma.user.deleteMany()
  await prisma.department.deleteMany()

  // Create Departments
  const deptSales = await prisma.department.create({ data: { name: 'Sales' } })
  const deptEng = await prisma.department.create({ data: { name: 'Engineering' } })
  const deptHr = await prisma.department.create({ data: { name: 'HR' } })
  const deptFin = await prisma.department.create({ data: { name: 'Finance' } })

  // Admin User
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      role: Role.ADMIN,
      departmentId: deptHr.id,
      position: 'Administrator',
    },
  })

  // Manager in Sales
  const manager = await prisma.user.create({
    data: {
      email: 'manager@example.com',
      password: hashedPassword,
      name: 'Sales Manager',
      role: Role.MANAGER,
      departmentId: deptSales.id,
      position: 'Sales Head',
    },
  })

  // Member in Sales
  const member = await prisma.user.create({
    data: {
      email: 'member@example.com',
      password: hashedPassword,
      name: 'Sales Rep',
      role: Role.MEMBER,
      departmentId: deptSales.id,
      position: 'Account Executive',
    },
  })

  // Customers
  const customerA = await prisma.customer.create({
    data: {
      companyName: 'Acme Corp',
      contactName: 'John Doe',
      email: 'john@acme.com',
      phone: '123-456-7890',
    },
  })

  // Deals
  await prisma.deal.create({
    data: {
      title: 'Acme Software License',
      customerId: customerA.id,
      assigneeId: member.id,
      amount: 1000000,
      probability: 80,
      status: 'NEGOTIATION',
    },
  })

  console.log('Seed data created successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
