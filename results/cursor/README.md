# BizBoard - 業務管理ダッシュボード

営業・案件・財務・人事を一元管理する業務管理ダッシュボードアプリケーション。

## 技術スタック

- **フロントエンド**: Next.js 14 (App Router) / TypeScript / Tailwind CSS
- **UIコンポーネント**: shadcn/ui
- **バックエンド**: Next.js API Routes
- **ORM**: Prisma
- **データベース**: PostgreSQL
- **認証**: NextAuth.js v4
- **チャート**: Recharts
- **フォーム**: React Hook Form + Zod

## セットアップ手順

### 1. 依存パッケージのインストール

```bash
cd bizboard
npm install
```

### 2. 環境変数の設定

```bash
cp .env.example .env
```

`.env` ファイルを編集し、PostgreSQL の接続情報を設定してください。

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/bizboard?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
```

### 3. データベースの作成

```bash
createdb bizboard
```

### 4. マイグレーション

```bash
npx prisma migrate dev --name init
```

### 5. シードデータの投入

```bash
npx prisma db seed
```

### 6. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 にアクセスしてください。

## デモアカウント

| ロール | メールアドレス | パスワード |
|--------|---------------|-----------|
| Admin | admin@bizboard.jp | password123 |
| Manager | manager1@bizboard.jp | password123 |
| Manager | manager2@bizboard.jp | password123 |
| Member | member1@bizboard.jp | password123 |
| Member | member2@bizboard.jp | password123 |
| Member | member3@bizboard.jp | password123 |

## 機能一覧

### 営業管理
- 顧客管理（CRUD、検索、フィルタ、ページネーション）
- 商談管理（ステータス管理、顧客紐付け）
- 売上ダッシュボード

### 案件管理
- 案件管理（CRUD、進捗率表示）
- タスク管理（案件内でのCRUD、ステータス管理）

### 財務管理
- 経費申請（申請、編集、削除）
- 承認ワークフロー（Manager/Admin による承認・却下）
- 収支サマリー（月次、部門別、カテゴリ別）

### 人事管理
- 従業員管理（CRUD、ロール管理）
- 部署管理

### 共通機能
- ロールベースアクセス制御（Admin / Manager / Member）
- KPIダッシュボード
- レスポンシブデザイン
- パンくずリスト
- トースト通知

## ロール権限

| 機能 | Admin | Manager | Member |
|------|-------|---------|--------|
| ダッシュボード閲覧 | ○ | ○ | ○ |
| 顧客・商談の閲覧 | ○ | ○ | ○ |
| 顧客・商談の作成/編集/削除 | ○ | ○ | × |
| 案件の閲覧 | ○ | ○ | ○ |
| 案件の作成/編集/削除 | ○ | ○ | × |
| 経費申請（自分の） | ○ | ○ | ○ |
| 経費承認 | ○ | ○ | × |
| 収支サマリー閲覧 | ○ | ○ | × |
| 従業員閲覧 | ○ | ○ | ○（一覧のみ） |
| 従業員作成/編集/削除 | ○ | × | × |
| 部署管理 | ○ | ○ | × |
