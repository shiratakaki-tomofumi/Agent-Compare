import {
  PrismaClient,
  Role,
  CustomerStatus,
  DealStatus,
  ProjectStatus,
  TaskPriority,
  TaskStatus,
  ExpenseCategory,
  ExpenseStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Departments
  const depts = await Promise.all([
    prisma.department.upsert({
      where: { name: "営業部" },
      update: {},
      create: { name: "営業部", description: "営業・顧客管理" },
    }),
    prisma.department.upsert({
      where: { name: "開発部" },
      update: {},
      create: { name: "開発部", description: "システム開発" },
    }),
    prisma.department.upsert({
      where: { name: "管理部" },
      update: {},
      create: { name: "管理部", description: "総務・経理" },
    }),
  ]);
  const [sales, dev, admin] = depts;

  // Users
  const hashedPw = await bcrypt.hash("password123", 12);
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@bizboard.example" },
      update: {},
      create: {
        email: "admin@bizboard.example",
        password: hashedPw,
        name: "管理者 太郎",
        role: Role.ADMIN,
        departmentId: admin.id,
        position: "部長",
        hireDate: new Date("2020-04-01"),
      },
    }),
    prisma.user.upsert({
      where: { email: "manager@bizboard.example" },
      update: {},
      create: {
        email: "manager@bizboard.example",
        password: hashedPw,
        name: "営業 花子",
        role: Role.MANAGER,
        departmentId: sales.id,
        position: "マネージャー",
        hireDate: new Date("2021-04-01"),
      },
    }),
    prisma.user.upsert({
      where: { email: "member@bizboard.example" },
      update: {},
      create: {
        email: "member@bizboard.example",
        password: hashedPw,
        name: "開発 次郎",
        role: Role.MEMBER,
        departmentId: dev.id,
        position: "エンジニア",
        hireDate: new Date("2023-04-01"),
      },
    }),
    prisma.user.upsert({
      where: { email: "member2@bizboard.example" },
      update: {},
      create: {
        email: "member2@bizboard.example",
        password: hashedPw,
        name: "営業 三郎",
        role: Role.MEMBER,
        departmentId: sales.id,
        position: "営業担当",
        hireDate: new Date("2024-04-01"),
      },
    }),
  ]);
  const [adminUser, managerUser, memberUser, member2User] = users;

  // Customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        companyName: "株式会社サンプル",
        contactName: "山田 一郎",
        email: "yamada@sample.example",
        phone: "03-1234-5678",
        status: CustomerStatus.ACTIVE,
      },
    }),
    prisma.customer.create({
      data: {
        companyName: "テスト商事",
        contactName: "鈴木 二郎",
        email: "suzuki@test.example",
        phone: "06-9876-5432",
        status: CustomerStatus.ACTIVE,
      },
    }),
    prisma.customer.create({
      data: {
        companyName: "デモ工業",
        contactName: "田中 三郎",
        email: "tanaka@demo.example",
        status: CustomerStatus.DORMANT,
      },
    }),
  ]);

  // Deals
  await Promise.all([
    prisma.deal.create({
      data: {
        title: "基幹システム刷新提案",
        customerId: customers[0].id,
        assigneeId: managerUser.id,
        amount: 5000000,
        probability: 70,
        status: DealStatus.PROPOSAL,
      },
    }),
    prisma.deal.create({
      data: {
        title: "クラウド移行支援",
        customerId: customers[1].id,
        assigneeId: member2User.id,
        amount: 2000000,
        probability: 50,
        status: DealStatus.NEGOTIATION,
      },
    }),
    prisma.deal.create({
      data: {
        title: "保守契約更新",
        customerId: customers[0].id,
        assigneeId: managerUser.id,
        amount: 1200000,
        probability: 90,
        status: DealStatus.WON,
        closedAt: new Date(),
      },
    }),
    prisma.deal.create({
      data: {
        title: "新規ERP導入",
        customerId: customers[2].id,
        assigneeId: member2User.id,
        amount: 8000000,
        probability: 20,
        status: DealStatus.LEAD,
      },
    }),
  ]);

  // Projects
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: "社内ポータル刷新",
        description: "既存ポータルのモダン化",
        departmentId: dev.id,
        status: ProjectStatus.IN_PROGRESS,
        startDate: new Date("2024-04-01"),
        endDate: new Date("2024-12-31"),
      },
    }),
    prisma.project.create({
      data: {
        name: "顧客管理システム開発",
        description: "CRMシステムの新規開発",
        departmentId: dev.id,
        status: ProjectStatus.PLANNING,
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-06-30"),
      },
    }),
    prisma.project.create({
      data: {
        name: "年次報告書作成",
        description: "2024年度年次報告",
        departmentId: admin.id,
        status: ProjectStatus.COMPLETED,
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-03-31"),
      },
    }),
  ]);

  // Tasks
  await Promise.all([
    prisma.task.create({
      data: {
        title: "要件定義",
        projectId: projects[0].id,
        assigneeId: memberUser.id,
        priority: TaskPriority.HIGH,
        status: TaskStatus.DONE,
        dueDate: new Date("2024-05-31"),
      },
    }),
    prisma.task.create({
      data: {
        title: "UI設計",
        projectId: projects[0].id,
        assigneeId: memberUser.id,
        priority: TaskPriority.HIGH,
        status: TaskStatus.DONE,
        dueDate: new Date("2024-06-30"),
      },
    }),
    prisma.task.create({
      data: {
        title: "フロントエンド実装",
        projectId: projects[0].id,
        assigneeId: memberUser.id,
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.IN_PROGRESS,
        dueDate: new Date("2024-10-31"),
      },
    }),
    prisma.task.create({
      data: {
        title: "バックエンド実装",
        projectId: projects[0].id,
        assigneeId: memberUser.id,
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.TODO,
        dueDate: new Date("2024-11-30"),
      },
    }),
    prisma.task.create({
      data: {
        title: "テスト",
        projectId: projects[0].id,
        assigneeId: memberUser.id,
        priority: TaskPriority.LOW,
        status: TaskStatus.TODO,
        dueDate: new Date("2024-12-15"),
      },
    }),
    prisma.task.create({
      data: {
        title: "要件ヒアリング",
        projectId: projects[1].id,
        assigneeId: managerUser.id,
        priority: TaskPriority.HIGH,
        status: TaskStatus.TODO,
        dueDate: new Date("2025-01-31"),
      },
    }),
  ]);

  // Expenses
  const now = new Date();
  await Promise.all([
    prisma.expense.create({
      data: {
        applicantId: memberUser.id,
        amount: 15000,
        category: ExpenseCategory.TRAVEL,
        description: "東京出張交通費",
        expenseDate: new Date(now.getFullYear(), now.getMonth(), 5),
        status: ExpenseStatus.PENDING,
      },
    }),
    prisma.expense.create({
      data: {
        applicantId: member2User.id,
        amount: 8000,
        category: ExpenseCategory.ENTERTAINMENT,
        description: "顧客接待費",
        expenseDate: new Date(now.getFullYear(), now.getMonth(), 10),
        status: ExpenseStatus.PENDING,
      },
    }),
    prisma.expense.create({
      data: {
        applicantId: memberUser.id,
        amount: 3000,
        category: ExpenseCategory.SUPPLIES,
        description: "文具購入",
        expenseDate: new Date(now.getFullYear(), now.getMonth() - 1, 20),
        status: ExpenseStatus.APPROVED,
        approverId: managerUser.id,
        approvedAt: new Date(now.getFullYear(), now.getMonth() - 1, 22),
        approverComment: "承認します",
      },
    }),
    prisma.expense.create({
      data: {
        applicantId: member2User.id,
        amount: 50000,
        category: ExpenseCategory.OTHER,
        description: "セミナー参加費",
        expenseDate: new Date(now.getFullYear(), now.getMonth() - 1, 15),
        status: ExpenseStatus.REJECTED,
        approverId: managerUser.id,
        approvedAt: new Date(now.getFullYear(), now.getMonth() - 1, 17),
        approverComment: "予算超過のため却下",
      },
    }),
  ]);

  // Budgets
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  await Promise.all([
    prisma.budget.upsert({
      where: {
        departmentId_year_month: { departmentId: sales.id, year, month },
      },
      update: {},
      create: { departmentId: sales.id, year, month, amount: 500000 },
    }),
    prisma.budget.upsert({
      where: { departmentId_year_month: { departmentId: dev.id, year, month } },
      update: {},
      create: { departmentId: dev.id, year, month, amount: 300000 },
    }),
    prisma.budget.upsert({
      where: {
        departmentId_year_month: { departmentId: admin.id, year, month },
      },
      update: {},
      create: { departmentId: admin.id, year, month, amount: 200000 },
    }),
  ]);

  // Revenue
  await Promise.all([
    prisma.revenue.upsert({
      where: { year_month: { year, month } },
      update: {},
      create: { year, month, amount: 12000000, target: 15000000 },
    }),
    prisma.revenue.upsert({
      where: { year_month: { year, month: month - 1 > 0 ? month - 1 : 12 } },
      update: {},
      create: {
        year: month - 1 > 0 ? year : year - 1,
        month: month - 1 > 0 ? month - 1 : 12,
        amount: 13500000,
        target: 15000000,
      },
    }),
  ]);

  console.log("Seeding complete.");
  console.log("Login accounts:");
  console.log("  Admin:   admin@bizboard.example / password123");
  console.log("  Manager: manager@bizboard.example / password123");
  console.log("  Member:  member@bizboard.example / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
