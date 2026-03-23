import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.expense.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  const [sales, engineering, finance, hr] = await Promise.all([
    prisma.department.create({
      data: { name: "Sales", description: "営業部" },
    }),
    prisma.department.create({
      data: { name: "Engineering", description: "開発部" },
    }),
    prisma.department.create({
      data: { name: "Finance", description: "財務部" },
    }),
    prisma.department.create({ data: { name: "HR", description: "人事部" } }),
  ]);

  const [admin, manager, member] = await Promise.all([
    prisma.user.create({
      data: {
        email: "admin@example.com",
        password: await bcrypt.hash("Password123!", 10),
        name: "Admin User",
        role: "ADMIN",
        departmentId: hr.id,
      },
    }),
    prisma.user.create({
      data: {
        email: "manager@example.com",
        password: await bcrypt.hash("Password123!", 10),
        name: "Manager User",
        role: "MANAGER",
        departmentId: sales.id,
      },
    }),
    prisma.user.create({
      data: {
        email: "member@example.com",
        password: await bcrypt.hash("Password123!", 10),
        name: "Member User",
        role: "MEMBER",
        departmentId: engineering.id,
      },
    }),
  ]);

  const customerA = await prisma.customer.create({
    data: {
      companyName: "Acme Corp",
      contactName: "Taro Yamada",
      email: "taro@acme.com",
      phone: "080-0000-0000",
      status: "ACTIVE",
    },
  });
  const customerB = await prisma.customer.create({
    data: {
      companyName: "FooBar Inc",
      contactName: "Hanako Sato",
      email: "hanako@foobar.com",
      phone: "080-1111-1111",
      status: "ACTIVE",
    },
  });

  const dealA = await prisma.deal.create({
    data: {
      title: "Q2 Sales Opportunity",
      customerId: customerA.id,
      assigneeId: manager.id,
      amount: 1500000,
      probability: 70,
      status: "NEGOTIATION",
      note: "Follow up next week",
    },
  });
  const dealB = await prisma.deal.create({
    data: {
      title: "Enterprise License",
      customerId: customerB.id,
      assigneeId: manager.id,
      amount: 2900000,
      probability: 45,
      status: "PROPOSAL",
      note: "Pending legal",
    },
  });

  const projectA = await prisma.project.create({
    data: {
      name: "Website Revamp",
      description: "リニューアルプロジェクト",
      departmentId: engineering.id,
      status: "IN_PROGRESS",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-04-30"),
    },
  });

  await prisma.task.createMany({
    data: [
      {
        title: "デザイン作成",
        projectId: projectA.id,
        assigneeId: member.id,
        priority: "HIGH",
        status: "IN_PROGRESS",
        dueDate: new Date("2026-02-28"),
      },
      {
        title: "実装",
        projectId: projectA.id,
        assigneeId: member.id,
        priority: "MEDIUM",
        status: "TODO",
        dueDate: new Date("2026-03-31"),
      },
    ],
  });

  await prisma.expense.create({
    data: {
      applicantId: member.id,
      amount: 12000,
      category: "TRAVEL",
      description: "移動費",
      expenseDate: new Date(),
      status: "PENDING",
    },
  });

  await prisma.budget.create({
    data: { departmentId: sales.id, year: 2026, month: 3, amount: 5000000 },
  });

  await prisma.attendance.create({
    data: {
      userId: member.id,
      date: new Date("2026-03-20"),
      checkIn: new Date("2026-03-20T09:00:00Z"),
      checkOut: new Date("2026-03-20T18:20:00Z"),
      overtimeHours: 1.5,
    },
  });

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
