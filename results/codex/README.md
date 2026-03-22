# BizBoard

BizBoard は、営業、案件、財務、人事を横断して管理できる業務ダッシュボードです。Next.js App Router、Prisma、PostgreSQL、NextAuth を使って構築しています。

## 主な機能

- ダッシュボード
  - 売上、案件、財務、人事の KPI 表示
  - 月次売上チャート
  - 最新アクティビティ一覧
- Sales
  - 顧客一覧、詳細、作成、編集、論理削除
  - 商談一覧、詳細、作成、編集、削除
  - 商談ステータス更新
- Projects
  - 案件一覧、詳細、作成、編集、論理削除
  - 案件ごとの進捗率表示
  - タスクの追加、編集、削除、担当者アサイン、ステータス更新
- Finance
  - 経費申請一覧、作成、編集、削除
  - 承認待ち一覧、承認、却下
  - 月次収支サマリー、予算 vs 実績、カテゴリ別支出
- HR
  - 従業員一覧、詳細、作成、編集、論理削除
  - 部署管理
  - 月次勤怠サマリー

## 技術スタック

- Next.js 14 App Router
- TypeScript strict mode
- Tailwind CSS
- Prisma
- PostgreSQL
- NextAuth (Credentials)
- Zod
- React Hook Form
- Recharts

## セットアップ

1. 環境変数を設定します。

```bash
cp .env.example .env
```

2. PostgreSQL を起動し、`.env` の `DATABASE_URL` を接続先に合わせます。

3. Prisma Client を生成し、スキーマを反映します。

```bash
npm install
npm run prisma:push
```

4. シードデータを投入します。

```bash
npm run prisma:seed
```

5. 開発サーバーを起動します。

```bash
npm run dev
```

## ログインアカウント

シード投入後は以下を利用できます。

- Admin: `admin@bizboard.local / password123`
- Manager: `manager@bizboard.local / password123`
- Member: `member1@bizboard.local / password123`

## 主要コマンド

```bash
npm run dev
npm run lint
npx tsc --noEmit
npm run build
npm run prisma:push
npm run prisma:seed
```

## ディレクトリ構成

```text
src/
  app/          画面ルーティング
  components/   レイアウト、共通 UI、フォーム、チャート
  lib/          認証、Prisma、権限、クエリ、更新処理
prisma/
  schema.prisma
  seed.ts
```

## 補足

- 認証は Credentials Provider を使ったメールアドレス + パスワード方式です。
- ロールによって画面表示と更新操作を制御しています。
- `.env.example` には本番値ではなくサンプル値のみを記載しています。
