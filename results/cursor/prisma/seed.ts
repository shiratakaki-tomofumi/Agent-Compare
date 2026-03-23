import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data in correct order (respecting foreign keys)
  await prisma.attendance.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.revenue.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.user.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.department.deleteMany();

  // --- Departments ---
  const [deptSales, deptDev, deptAccounting, deptHR] = await Promise.all([
    prisma.department.create({
      data: { name: "営業部", description: "営業活動・顧客管理を担当" },
    }),
    prisma.department.create({
      data: { name: "開発部", description: "システム開発・技術支援を担当" },
    }),
    prisma.department.create({
      data: { name: "経理部", description: "経理・財務管理を担当" },
    }),
    prisma.department.create({
      data: { name: "人事部", description: "人事・総務管理を担当" },
    }),
  ]);

  console.log("Departments created");

  // --- Users ---
  const passwordHash = await hash("password123", 12);

  const [admin, manager1, manager2, member1, member2, member3] =
    await Promise.all([
      prisma.user.create({
        data: {
          email: "admin@bizboard.jp",
          password: passwordHash,
          name: "管理太郎",
          role: "ADMIN",
          departmentId: deptHR.id,
          position: "代表取締役",
          hireDate: new Date("2020-04-01"),
        },
      }),
      prisma.user.create({
        data: {
          email: "manager1@bizboard.jp",
          password: passwordHash,
          name: "営業花子",
          role: "MANAGER",
          departmentId: deptSales.id,
          position: "営業部長",
          hireDate: new Date("2021-04-01"),
        },
      }),
      prisma.user.create({
        data: {
          email: "manager2@bizboard.jp",
          password: passwordHash,
          name: "開発次郎",
          role: "MANAGER",
          departmentId: deptDev.id,
          position: "開発部長",
          hireDate: new Date("2021-06-01"),
        },
      }),
      prisma.user.create({
        data: {
          email: "member1@bizboard.jp",
          password: passwordHash,
          name: "田中一郎",
          role: "MEMBER",
          departmentId: deptSales.id,
          position: "営業担当",
          hireDate: new Date("2022-04-01"),
        },
      }),
      prisma.user.create({
        data: {
          email: "member2@bizboard.jp",
          password: passwordHash,
          name: "鈴木二郎",
          role: "MEMBER",
          departmentId: deptDev.id,
          position: "エンジニア",
          hireDate: new Date("2023-01-15"),
        },
      }),
      prisma.user.create({
        data: {
          email: "member3@bizboard.jp",
          password: passwordHash,
          name: "佐藤三郎",
          role: "MEMBER",
          departmentId: deptAccounting.id,
          position: "経理担当",
          hireDate: new Date("2023-04-01"),
        },
      }),
    ]);

  console.log("Users created");

  // --- Customers ---
  const [custTech, custABC, custGlobal, custFuture, custDigital] =
    await Promise.all([
      prisma.customer.create({
        data: {
          companyName: "株式会社テクノロジー",
          contactName: "山田太郎",
          email: "yamada@technology.co.jp",
          phone: "03-1234-5678",
          status: "ACTIVE",
        },
      }),
      prisma.customer.create({
        data: {
          companyName: "ABC商事",
          contactName: "佐々木花子",
          email: "sasaki@abc-trading.co.jp",
          phone: "03-2345-6789",
          status: "ACTIVE",
        },
      }),
      prisma.customer.create({
        data: {
          companyName: "グローバルソリューションズ",
          contactName: "高橋一郎",
          email: "takahashi@global-solutions.co.jp",
          phone: "03-3456-7890",
          status: "ACTIVE",
        },
      }),
      prisma.customer.create({
        data: {
          companyName: "フューチャーイノベーション",
          contactName: "中村美咲",
          email: "nakamura@future-innovation.co.jp",
          phone: "03-4567-8901",
          status: "DORMANT",
        },
      }),
      prisma.customer.create({
        data: {
          companyName: "デジタルフロンティア",
          contactName: "小林健太",
          email: "kobayashi@digital-frontier.co.jp",
          phone: "03-5678-9012",
          status: "ACTIVE",
        },
      }),
    ]);

  console.log("Customers created");

  // --- Deals ---
  await Promise.all([
    prisma.deal.create({
      data: {
        title: "基幹システムリプレース案件",
        customerId: custTech.id,
        assigneeId: manager1.id,
        amount: 15000000,
        probability: 80,
        status: "NEGOTIATION",
        note: "来月中に決裁予定",
      },
    }),
    prisma.deal.create({
      data: {
        title: "ECサイト構築プロジェクト",
        customerId: custTech.id,
        assigneeId: member1.id,
        amount: 5000000,
        probability: 100,
        status: "WON",
        closedAt: new Date("2026-02-15"),
      },
    }),
    prisma.deal.create({
      data: {
        title: "業務効率化コンサルティング",
        customerId: custABC.id,
        assigneeId: manager1.id,
        amount: 3000000,
        probability: 60,
        status: "PROPOSAL",
      },
    }),
    prisma.deal.create({
      data: {
        title: "データ分析基盤導入",
        customerId: custGlobal.id,
        assigneeId: member1.id,
        amount: 8000000,
        probability: 30,
        status: "LEAD",
      },
    }),
    prisma.deal.create({
      data: {
        title: "セキュリティ監査",
        customerId: custFuture.id,
        assigneeId: manager1.id,
        amount: 2000000,
        probability: 0,
        status: "LOST",
        closedAt: new Date("2026-01-20"),
      },
    }),
    prisma.deal.create({
      data: {
        title: "クラウド移行支援",
        customerId: custDigital.id,
        assigneeId: member1.id,
        amount: 10000000,
        probability: 50,
        status: "NEGOTIATION",
      },
    }),
  ]);

  console.log("Deals created");

  // --- Projects ---
  const [projSales, projDev, projAccounting] = await Promise.all([
    prisma.project.create({
      data: {
        name: "新規顧客開拓キャンペーン",
        description: "Q1の新規顧客獲得を目指す営業プロジェクト",
        departmentId: deptSales.id,
        status: "IN_PROGRESS",
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-03-31"),
      },
    }),
    prisma.project.create({
      data: {
        name: "社内ツール開発",
        description: "業務効率化のための社内ツールの開発",
        departmentId: deptDev.id,
        status: "PLANNING",
        startDate: new Date("2026-04-01"),
        endDate: new Date("2026-09-30"),
      },
    }),
    prisma.project.create({
      data: {
        name: "決算業務効率化",
        description: "四半期決算の自動化推進",
        departmentId: deptAccounting.id,
        status: "COMPLETED",
        startDate: new Date("2025-10-01"),
        endDate: new Date("2026-01-31"),
      },
    }),
  ]);

  console.log("Projects created");

  // --- Tasks ---
  await Promise.all([
    // projSales tasks
    prisma.task.create({
      data: {
        title: "ターゲットリスト作成",
        description: "新規開拓先のリストアップ",
        projectId: projSales.id,
        assigneeId: member1.id,
        priority: "HIGH",
        status: "DONE",
        dueDate: new Date("2026-01-15"),
      },
    }),
    prisma.task.create({
      data: {
        title: "初回訪問スケジュール調整",
        projectId: projSales.id,
        assigneeId: member1.id,
        priority: "MEDIUM",
        status: "IN_PROGRESS",
        dueDate: new Date("2026-03-20"),
      },
    }),
    prisma.task.create({
      data: {
        title: "営業資料アップデート",
        projectId: projSales.id,
        assigneeId: manager1.id,
        priority: "LOW",
        status: "TODO",
        dueDate: new Date("2026-03-25"),
      },
    }),
    // projDev tasks
    prisma.task.create({
      data: {
        title: "要件定義書作成",
        description: "社内ツールの要件定義",
        projectId: projDev.id,
        assigneeId: manager2.id,
        priority: "HIGH",
        status: "REVIEW",
        dueDate: new Date("2026-04-15"),
      },
    }),
    prisma.task.create({
      data: {
        title: "技術選定",
        projectId: projDev.id,
        assigneeId: member2.id,
        priority: "HIGH",
        status: "TODO",
        dueDate: new Date("2026-04-20"),
      },
    }),
    prisma.task.create({
      data: {
        title: "プロトタイプ開発",
        projectId: projDev.id,
        assigneeId: member2.id,
        priority: "MEDIUM",
        status: "TODO",
        dueDate: new Date("2026-05-30"),
      },
    }),
    // projAccounting tasks
    prisma.task.create({
      data: {
        title: "自動仕訳ルール設定",
        projectId: projAccounting.id,
        assigneeId: member3.id,
        priority: "HIGH",
        status: "DONE",
        dueDate: new Date("2025-12-15"),
      },
    }),
    prisma.task.create({
      data: {
        title: "レポート自動生成機能テスト",
        projectId: projAccounting.id,
        assigneeId: member3.id,
        priority: "MEDIUM",
        status: "DONE",
        dueDate: new Date("2026-01-20"),
      },
    }),
  ]);

  console.log("Tasks created");

  // --- Expenses ---
  await Promise.all([
    prisma.expense.create({
      data: {
        applicantId: member1.id,
        amount: 15000,
        category: "TRAVEL",
        description: "顧客訪問交通費（大阪出張）",
        expenseDate: new Date("2026-03-05"),
        status: "APPROVED",
        approverId: manager1.id,
        approvedAt: new Date("2026-03-06"),
      },
    }),
    prisma.expense.create({
      data: {
        applicantId: member1.id,
        amount: 8000,
        category: "ENTERTAINMENT",
        description: "顧客接待費（ABC商事）",
        expenseDate: new Date("2026-03-10"),
        status: "PENDING",
      },
    }),
    prisma.expense.create({
      data: {
        applicantId: member2.id,
        amount: 45000,
        category: "SUPPLIES",
        description: "開発用モニター購入",
        expenseDate: new Date("2026-02-20"),
        status: "APPROVED",
        approverId: manager2.id,
        approvedAt: new Date("2026-02-21"),
      },
    }),
    prisma.expense.create({
      data: {
        applicantId: member3.id,
        amount: 3000,
        category: "SUPPLIES",
        description: "事務用品購入",
        expenseDate: new Date("2026-03-01"),
        status: "APPROVED",
        approverId: admin.id,
        approvedAt: new Date("2026-03-02"),
      },
    }),
    prisma.expense.create({
      data: {
        applicantId: manager1.id,
        amount: 25000,
        category: "TRAVEL",
        description: "取引先訪問交通費（名古屋）",
        expenseDate: new Date("2026-03-12"),
        status: "PENDING",
      },
    }),
    prisma.expense.create({
      data: {
        applicantId: member2.id,
        amount: 12000,
        category: "OTHER",
        description: "技術書籍購入",
        expenseDate: new Date("2026-02-15"),
        status: "REJECTED",
        approverId: manager2.id,
        approverComment: "個人的な書籍は対象外です",
        approvedAt: new Date("2026-02-16"),
      },
    }),
  ]);

  console.log("Expenses created");

  // --- Budgets (current month for each department) ---
  await Promise.all([
    prisma.budget.create({
      data: {
        departmentId: deptSales.id,
        year: 2026,
        month: 3,
        amount: 5000000,
      },
    }),
    prisma.budget.create({
      data: {
        departmentId: deptDev.id,
        year: 2026,
        month: 3,
        amount: 3000000,
      },
    }),
    prisma.budget.create({
      data: {
        departmentId: deptAccounting.id,
        year: 2026,
        month: 3,
        amount: 1500000,
      },
    }),
    prisma.budget.create({
      data: {
        departmentId: deptHR.id,
        year: 2026,
        month: 3,
        amount: 2000000,
      },
    }),
  ]);

  console.log("Budgets created");

  // --- Attendance (current month, several entries) ---
  const attendanceDates = [
    new Date("2026-03-10"),
    new Date("2026-03-11"),
    new Date("2026-03-12"),
    new Date("2026-03-13"),
    new Date("2026-03-14"),
  ];

  const attendanceUsers = [member1, member2, member3];

  for (const user of attendanceUsers) {
    for (const date of attendanceDates) {
      const checkIn = new Date(date);
      checkIn.setHours(9, 0, 0, 0);
      const checkOut = new Date(date);
      checkOut.setHours(18, 0, 0, 0);
      const overtime = Math.random() > 0.5 ? Math.round(Math.random() * 3 * 10) / 10 : 0;

      await prisma.attendance.create({
        data: {
          userId: user.id,
          date,
          checkIn,
          checkOut,
          overtimeHours: overtime,
        },
      });
    }
  }

  console.log("Attendance created");

  // --- Revenue (past 6 months) ---
  const revenueData = [
    { year: 2025, month: 10, amount: 12000000, target: 15000000 },
    { year: 2025, month: 11, amount: 14500000, target: 15000000 },
    { year: 2025, month: 12, amount: 18000000, target: 16000000 },
    { year: 2026, month: 1, amount: 11000000, target: 14000000 },
    { year: 2026, month: 2, amount: 16500000, target: 15000000 },
    { year: 2026, month: 3, amount: 13000000, target: 16000000 },
  ];

  await Promise.all(
    revenueData.map((r) => prisma.revenue.create({ data: r }))
  );

  console.log("Revenue created");

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
