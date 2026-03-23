import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  // 部署を作成
  const departments = await Promise.all([
    prisma.department.upsert({
      where: { name: "営業部" },
      update: {},
      create: {
        id: "d1",
        name: "営業部",
        description: "営業活動を行う部門",
      },
    }),
    prisma.department.upsert({
      where: { name: "開発部" },
      update: {},
      create: {
        id: "d2",
        name: "開発部",
        description: "システム開発を行う部門",
      },
    }),
    prisma.department.upsert({
      where: { name: "人事部" },
      update: {},
      create: {
        id: "d3",
        name: "人事部",
        description: "人事・採用担当部門",
      },
    }),
    prisma.department.upsert({
      where: { name: "财务部" },
      update: {},
      create: {
        id: "d4",
        name: "财务部",
        description: "財務・経理担当部門",
      },
    }),
    prisma.department.upsert({
      where: { name: "総務部" },
      update: {},
      create: {
        id: "d5",
        name: "総務部",
        description: "総務・法務担当部門",
      },
    }),
  ]);

  // ユーザーを作成
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "demo@example.com" },
      update: {},
      create: {
        id: "u1",
        email: "demo@example.com",
        password: hashedPassword,
        name: "山田 太郎",
        role: "ADMIN",
        departmentId: departments[0].id,
        position: "部長",
        hireDate: new Date("2020-04-01"),
      },
    }),
    prisma.user.upsert({
      where: { email: "manager@example.com" },
      update: {},
      create: {
        id: "u2",
        email: "manager@example.com",
        password: hashedPassword,
        name: "佐藤 花子",
        role: "MANAGER",
        departmentId: departments[0].id,
        position: "課長",
        hireDate: new Date("2021-04-01"),
      },
    }),
    prisma.user.upsert({
      where: { email: "member@example.com" },
      update: {},
      create: {
        id: "u3",
        email: "member@example.com",
        password: hashedPassword,
        name: "鈴木 一郎",
        role: "MEMBER",
        departmentId: departments[0].id,
        position: "営業担当",
        hireDate: new Date("2022-04-01"),
      },
    }),
    prisma.user.upsert({
      where: { email: "dev@example.com" },
      update: {},
      create: {
        id: "u4",
        email: "dev@example.com",
        password: hashedPassword,
        name: "田中 次郎",
        role: "MEMBER",
        departmentId: departments[1].id,
        position: "エンジニア",
        hireDate: new Date("2021-04-01"),
      },
    }),
    prisma.user.upsert({
      where: { email: "hr@example.com" },
      update: {},
      create: {
        id: "u5",
        email: "hr@example.com",
        password: hashedPassword,
        name: "高橋 美咲",
        role: "MANAGER",
        departmentId: departments[2].id,
        position: "人事課長",
        hireDate: new Date("2020-10-01"),
      },
    }),
    prisma.user.upsert({
      where: { email: "finance@example.com" },
      update: {},
      create: {
        id: "u6",
        email: "finance@example.com",
        password: hashedPassword,
        name: "伊藤 健太",
        role: "MEMBER",
        departmentId: departments[3].id,
        position: "経理担当",
        hireDate: new Date("2022-01-01"),
      },
    }),
    prisma.user.upsert({
      where: { email: "admin@example.com" },
      update: {},
      create: {
        id: "u7",
        email: "admin@example.com",
        password: hashedPassword,
        name: "渡辺 雅子",
        role: "ADMIN",
        departmentId: departments[4].id,
        position: "総務部長",
        hireDate: new Date("2019-04-01"),
      },
    }),
    prisma.user.upsert({
      where: { email: "test@example.com" },
      update: {},
      create: {
        id: "u8",
        email: "test@example.com",
        password: hashedPassword,
        name: "中村 大輔",
        role: "MEMBER",
        departmentId: departments[1].id,
        position: "エンジニア",
        hireDate: new Date("2023-04-01"),
      },
    }),
  ]);

  // 顧客を作成
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        id: "c1",
        companyName: "株式会社サンプル",
        contactName: "山本 健一",
        email: "yamamoto@example.com",
        phone: "03-1234-5678",
        status: "ACTIVE",
      },
    }),
    prisma.customer.create({
      data: {
        id: "c2",
        companyName: "テクノロジー株式会社",
        contactName: "鈴木 美咲",
        email: "suzuki@tech-example.com",
        phone: "06-9876-5432",
        status: "ACTIVE",
      },
    }),
    prisma.customer.create({
      data: {
        id: "c3",
        companyName: "グローバル商事",
        contactName: "田中 健太",
        email: "tanaka@global-trade.com",
        phone: "090-1234-5678",
        status: "ACTIVE",
      },
    }),
    prisma.customer.create({
      data: {
        id: "c4",
        companyName: "イノベーション社",
        contactName: "佐藤 雅子",
        email: "sato@innovation.co.jp",
        phone: "080-9876-5432",
        status: "DORMANT",
      },
    }),
    prisma.customer.create({
      data: {
        id: "c5",
        companyName: "フューチャー工業",
        contactName: "高橋 大輔",
        email: "takahashi@future-ind.co.jp",
        phone: "070-1234-5678",
        status: "ACTIVE",
      },
    }),
  ]);

  // 商談を作成（各ステータスを含む）
  const deals = await Promise.all([
    prisma.deal.create({
      data: {
        id: "d1",
        title: "CRM システム導入案件",
        customerId: customers[0].id,
        assigneeId: users[2].id,
        amount: 5000000,
        probability: 70,
        status: "NEGOTIATION",
        note: "来月中に契約締結見込み",
      },
    }),
    prisma.deal.create({
      data: {
        id: "d2",
        title: "クラウド移行プロジェクト",
        customerId: customers[1].id,
        assigneeId: users[3].id,
        amount: 8000000,
        probability: 50,
        status: "PROPOSAL",
      },
    }),
    prisma.deal.create({
      data: {
        id: "d3",
        title: "DX コンサルティング",
        customerId: customers[2].id,
        assigneeId: users[2].id,
        amount: 3000000,
        probability: 90,
        status: "WON",
        closedAt: new Date("2024-01-15"),
      },
    }),
    prisma.deal.create({
      data: {
        id: "d4",
        title: "セキュリティ対策導入",
        customerId: customers[3].id,
        assigneeId: users[3].id,
        amount: 2000000,
        probability: 30,
        status: "LEAD",
      },
    }),
    prisma.deal.create({
      data: {
        id: "d5",
        title: "AI 導入プロジェクト",
        customerId: customers[4].id,
        assigneeId: users[2].id,
        amount: 10000000,
        probability: 60,
        status: "NEGOTIATION",
      },
    }),
    prisma.deal.create({
      data: {
        id: "d6",
        title: "モバイルアプリ開発",
        customerId: customers[0].id,
        assigneeId: users[3].id,
        amount: 6000000,
        probability: 100,
        status: "LOST",
        closedAt: new Date("2024-01-10"),
      },
    }),
  ]);

  // 案件を作成
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        id: "p1",
        name: "EC サイトリデザイン",
        description: "既存 EC サイトの UI/UX リニューアル",
        departmentId: departments[1].id,
        status: "IN_PROGRESS",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-06-30"),
      },
    }),
    prisma.project.create({
      data: {
        id: "p2",
        name: "社内 HR システム構築",
        description: "従業員管理システムの導入",
        departmentId: departments[2].id,
        status: "IN_PROGRESS",
        startDate: new Date("2024-02-01"),
        endDate: new Date("2024-05-31"),
      },
    }),
    prisma.project.create({
      data: {
        id: "p3",
        name: "マーケティング自動化",
        description: "MA ツールの導入と運用設計",
        departmentId: departments[0].id,
        status: "PLANNING",
        startDate: new Date("2024-03-01"),
        endDate: new Date("2024-08-31"),
      },
    }),
    prisma.project.create({
      data: {
        id: "p4",
        name: "基盤システム刷新",
        description: "レガシーシステムのクラウド移行",
        departmentId: departments[1].id,
        status: "COMPLETED",
        startDate: new Date("2023-10-01"),
        endDate: new Date("2024-01-31"),
      },
    }),
  ]);

  // タスクを作成
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        id: "t1",
        title: "要件定義書の作成",
        description: "ステークホルダーヒアリングに基づく要件定義",
        projectId: projects[0].id,
        assigneeId: users[3].id,
        priority: "HIGH",
        status: "DONE",
        dueDate: new Date("2024-01-15"),
      },
    }),
    prisma.task.create({
      data: {
        id: "t2",
        title: "UI デザインの作成",
        description: "ワイヤーフレームとモックアップ制作",
        projectId: projects[0].id,
        assigneeId: users[3].id,
        priority: "HIGH",
        status: "IN_PROGRESS",
        dueDate: new Date("2024-02-15"),
      },
    }),
    prisma.task.create({
      data: {
        id: "t3",
        title: "フロントエンド実装",
        description: "React による UI 実装",
        projectId: projects[0].id,
        assigneeId: users[7].id,
        priority: "MEDIUM",
        status: "TODO",
        dueDate: new Date("2024-03-15"),
      },
    }),
    prisma.task.create({
      data: {
        id: "t4",
        title: "バックエンド実装",
        description: "API 開発とデータベース設計",
        projectId: projects[0].id,
        assigneeId: users[3].id,
        priority: "MEDIUM",
        status: "TODO",
        dueDate: new Date("2024-03-15"),
      },
    }),
    prisma.task.create({
      data: {
        id: "t5",
        title: "テストケース作成",
        description: "QA チームとの連携によるテスト設計",
        projectId: projects[0].id,
        assigneeId: users[7].id,
        priority: "LOW",
        status: "TODO",
        dueDate: new Date("2024-04-15"),
      },
    }),
    prisma.task.create({
      data: {
        id: "t6",
        title: "従業員データマイグレーション",
        description: "旧システムからのデータ移行",
        projectId: projects[1].id,
        assigneeId: users[4].id,
        priority: "HIGH",
        status: "REVIEW",
        dueDate: new Date("2024-02-28"),
      },
    }),
    prisma.task.create({
      data: {
        id: "t7",
        title: "勤怠管理機能の実装",
        description: "出退記・残業時間の入力機能",
        projectId: projects[1].id,
        assigneeId: users[3].id,
        priority: "HIGH",
        status: "IN_PROGRESS",
        dueDate: new Date("2024-03-15"),
      },
    }),
  ]);

  // 経費申請を作成
  const expenses = await Promise.all([
    prisma.expense.create({
      data: {
        id: "e1",
        applicantId: users[2].id,
        amount: 50000,
        category: "TRAVEL",
        description: "東京営業先訪問の交通費",
        expenseDate: new Date("2024-01-10"),
        status: "APPROVED",
        approverId: users[1].id,
        approvedAt: new Date("2024-01-12"),
      },
    }),
    prisma.expense.create({
      data: {
        id: "e2",
        applicantId: users[3].id,
        amount: 35000,
        category: "ENTERTAINMENT",
        description: "顧客先との打ち上げ会場費",
        expenseDate: new Date("2024-01-15"),
        status: "PENDING",
      },
    }),
    prisma.expense.create({
      data: {
        id: "e3",
        applicantId: users[7].id,
        amount: 12000,
        category: "SUPPLIES",
        description: "開発資材購入（書籍・ツール）",
        expenseDate: new Date("2024-01-20"),
        status: "REJECTED",
        approverId: users[3].id,
        approvedAt: new Date("2024-01-22"),
        approverComment: "個人利用の書籍は経費計上不可",
      },
    }),
  ]);

  // 予算を作成
  await Promise.all([
    prisma.budget.create({
      data: {
        id: "b1",
        departmentId: departments[0].id,
        year: 2024,
        month: 1,
        amount: 500000,
      },
    }),
    prisma.budget.create({
      data: {
        id: "b2",
        departmentId: departments[0].id,
        year: 2024,
        month: 2,
        amount: 500000,
      },
    }),
    prisma.budget.create({
      data: {
        id: "b3",
        departmentId: departments[1].id,
        year: 2024,
        month: 1,
        amount: 800000,
      },
    }),
  ]);

  // 売上データを作成
  await Promise.all([
    prisma.revenue.create({
      data: {
        id: "r1",
        year: 2024,
        month: 1,
        amount: 35000000,
        target: 30000000,
      },
    }),
    prisma.revenue.create({
      data: {
        id: "r2",
        year: 2024,
        month: 2,
        amount: 28000000,
        target: 35000000,
      },
    }),
  ]);

  // 勤怠データを作成
  await Promise.all([
    prisma.attendance.create({
      data: {
        id: "a1",
        userId: users[2].id,
        date: new Date("2024-01-22"),
        checkIn: new Date("2024-01-22T09:00:00Z"),
        checkOut: new Date("2024-01-22T18:00:00Z"),
        overtimeHours: 2.5,
      },
    }),
    prisma.attendance.create({
      data: {
        id: "a2",
        userId: users[3].id,
        date: new Date("2024-01-22"),
        checkIn: new Date("2024-01-22T09:00:00Z"),
        checkOut: new Date("2024-01-22T17:30:00Z"),
        overtimeHours: 0,
      },
    }),
  ]);

  console.log({
    departments: departments.length,
    users: users.length,
    customers: customers.length,
    deals: deals.length,
    projects: projects.length,
    tasks: tasks.length,
    expenses: expenses.length,
    budgets: 3,
    revenues: 2,
    attendances: 2,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
