import { hash } from "bcryptjs";
import {
  CustomerStatus,
  DealStatus,
  ExpenseCategory,
  ExpenseStatus,
  ProjectStatus,
  Role,
  TaskPriority,
  TaskStatus
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

async function main() {
  await prisma.attendance.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.revenue.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  const sales = await prisma.department.create({
    data: { name: "営業部", description: "顧客開拓と売上管理を担当" }
  });
  const delivery = await prisma.department.create({
    data: { name: "開発部", description: "案件推進と開発を担当" }
  });
  const backoffice = await prisma.department.create({
    data: { name: "管理部", description: "財務と人事を担当" }
  });

  const defaultPassword = await hash("password123", 12);

  const [admin, manager, memberA, memberB] = await Promise.all([
    prisma.user.create({
      data: {
        email: "admin@bizboard.local",
        password: defaultPassword,
        name: "佐藤 管理者",
        role: Role.ADMIN,
        departmentId: backoffice.id,
        position: "経営管理室長",
        hireDate: new Date("2022-04-01")
      }
    }),
    prisma.user.create({
      data: {
        email: "manager@bizboard.local",
        password: defaultPassword,
        name: "田中 マネージャー",
        role: Role.MANAGER,
        departmentId: sales.id,
        position: "営業マネージャー",
        hireDate: new Date("2023-02-01")
      }
    }),
    prisma.user.create({
      data: {
        email: "member1@bizboard.local",
        password: defaultPassword,
        name: "鈴木 花子",
        role: Role.MEMBER,
        departmentId: delivery.id,
        position: "プロジェクトリーダー",
        hireDate: new Date("2025-03-03")
      }
    }),
    prisma.user.create({
      data: {
        email: "member2@bizboard.local",
        password: defaultPassword,
        name: "高橋 太郎",
        role: Role.MEMBER,
        departmentId: sales.id,
        position: "営業担当",
        hireDate: new Date("2024-08-20")
      }
    })
  ]);

  const [customerA, customerB, customerC] = await Promise.all([
    prisma.customer.create({
      data: {
        companyName: "Aster Works",
        contactName: "青木 一郎",
        email: "aoki@aster.example",
        phone: "03-1111-2222",
        status: CustomerStatus.ACTIVE
      }
    }),
    prisma.customer.create({
      data: {
        companyName: "Northwind Partners",
        contactName: "中村 未来",
        email: "nakamura@northwind.example",
        phone: "06-3333-4444",
        status: CustomerStatus.ACTIVE
      }
    }),
    prisma.customer.create({
      data: {
        companyName: "Dormant Labs",
        contactName: "小林 進",
        email: "kobayashi@dormant.example",
        status: CustomerStatus.DORMANT
      }
    })
  ]);

  await prisma.deal.createMany({
    data: [
      {
        title: "営業分析ダッシュボード導入",
        customerId: customerA.id,
        assigneeId: manager.id,
        amount: 3200000,
        probability: 80,
        status: DealStatus.NEGOTIATION
      },
      {
        title: "既存 CRM リプレイス",
        customerId: customerB.id,
        assigneeId: memberB.id,
        amount: 1800000,
        probability: 55,
        status: DealStatus.PROPOSAL
      },
      {
        title: "保守契約更新",
        customerId: customerA.id,
        assigneeId: manager.id,
        amount: 950000,
        probability: 100,
        status: DealStatus.WON,
        closedAt: new Date()
      }
    ]
  });

  const websiteProject = await prisma.project.create({
    data: {
      name: "顧客向けポータル刷新",
      description: "契約顧客向けの新ポータルを構築",
      departmentId: delivery.id,
      status: ProjectStatus.IN_PROGRESS,
      startDate: new Date("2026-03-01"),
      endDate: new Date("2026-06-30")
    }
  });

  const opsProject = await prisma.project.create({
    data: {
      name: "営業オペレーション改善",
      description: "提案プロセスの標準化とレポート整備",
      departmentId: sales.id,
      status: ProjectStatus.PLANNING,
      startDate: new Date("2026-03-10"),
      endDate: new Date("2026-05-20")
    }
  });

  await prisma.task.createMany({
    data: [
      {
        title: "情報設計レビュー",
        description: "主要導線のレビュー",
        projectId: websiteProject.id,
        assigneeId: memberA.id,
        priority: TaskPriority.HIGH,
        status: TaskStatus.IN_PROGRESS,
        dueDate: new Date("2026-03-28")
      },
      {
        title: "営業ヒアリング",
        description: "現行課題の棚卸し",
        projectId: opsProject.id,
        assigneeId: memberB.id,
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.TODO,
        dueDate: new Date("2026-03-30")
      },
      {
        title: "画面モック作成",
        description: "重要画面のモックアップ",
        projectId: websiteProject.id,
        assigneeId: memberA.id,
        priority: TaskPriority.HIGH,
        status: TaskStatus.DONE,
        dueDate: new Date("2026-03-18")
      }
    ]
  });

  await prisma.expense.createMany({
    data: [
      {
        applicantId: memberB.id,
        amount: 18000,
        category: ExpenseCategory.TRAVEL,
        description: "関西出張の交通費",
        expenseDate: new Date("2026-03-08"),
        status: ExpenseStatus.PENDING
      },
      {
        applicantId: memberA.id,
        amount: 7200,
        category: ExpenseCategory.SUPPLIES,
        description: "検証端末アクセサリ",
        expenseDate: new Date("2026-03-14"),
        status: ExpenseStatus.APPROVED,
        approverId: admin.id,
        approverComment: "予算内のため承認",
        approvedAt: new Date("2026-03-15")
      }
    ]
  });

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  await prisma.revenue.createMany({
    data: [
      { year: currentYear, month: currentMonth - 1 > 0 ? currentMonth - 1 : 12, amount: 4200000, target: 5000000 },
      { year: currentYear, month: currentMonth, amount: 5100000, target: 5500000 }
    ],
    skipDuplicates: true
  });

  for (const month of [currentMonth - 1 > 0 ? currentMonth - 1 : 12, currentMonth]) {
    await prisma.budget.createMany({
      data: [
        { departmentId: sales.id, year: currentYear, month, amount: 250000 },
        { departmentId: delivery.id, year: currentYear, month, amount: 320000 },
        { departmentId: backoffice.id, year: currentYear, month, amount: 150000 }
      ],
      skipDuplicates: true
    });
  }

  const attendanceDays = [1, 2, 3, 4, 5, 8, 9, 10];
  for (const day of attendanceDays) {
    const date = new Date(`${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}T00:00:00+09:00`);
    await prisma.attendance.createMany({
      data: [
        {
          userId: memberA.id,
          date,
          checkIn: new Date(`${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}T09:05:00+09:00`),
          checkOut: new Date(`${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}T18:20:00+09:00`),
          overtimeHours: day % 2 === 0 ? 1.5 : 0.5
        },
        {
          userId: memberB.id,
          date,
          checkIn: new Date(`${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}T09:15:00+09:00`),
          checkOut: new Date(`${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}T18:00:00+09:00`),
          overtimeHours: day % 3 === 0 ? 2 : 0
        }
      ],
      skipDuplicates: true
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
