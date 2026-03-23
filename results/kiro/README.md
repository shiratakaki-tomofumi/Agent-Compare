# BizBoard

業務管理ダッシュボードアプリ。営業・案件・財務・人事の4モジュールを統合した社内向けWebアプリケーション。

## 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript 5 (strict mode)
- **スタイリング**: Tailwind CSS + shadcn/ui (Radix UI)
- **ORM**: Prisma 5
- **データベース**: PostgreSQL 15
- **認証**: NextAuth.js v4
- **フォーム**: React Hook Form + Zod
- **チャート**: Recharts

## セットアップ

### 前提条件

- Node.js 18以上
- PostgreSQL 15以上

### 手順

```bash
# 1. 依存関係インストール
npm install

# 2. 環境変数設定
cp .env.example .env
# .env を編集して DATABASE_URL と NEXTAUTH_SECRET を設定

# 3. データベースセットアップ
npx prisma migrate dev --name init

# 4. シードデータ投入
npm run db:seed

# 5. 開発サーバー起動
npm run dev
```

ブラウザで http://localhost:3000 を開く。

## テストアカウント

| ロール | メール | パスワード |
|--------|--------|-----------|
| Admin | admin@bizboard.example | password123 |
| Manager | manager@bizboard.example | password123 |
| Member | member@bizboard.example | password123 |

## 機能一覧

### 営業管理
- 顧客一覧・詳細・作成・編集・削除（論理削除）
- 商談一覧・詳細・作成・編集・削除（ステータス管理）

### 案件管理
- 案件一覧・詳細・作成・編集・削除（論理削除）
- タスク管理（案件詳細内でCRUD）
- 進捗率表示（完了タスク数 / 全タスク数）

### 財務管理
- 経費申請一覧・作成・編集・削除（未承認のみ）
- 経費承認ワークフロー（Manager/Admin）
- 収支サマリー（月次切替・予算vs実績・カテゴリ別グラフ）

### 人事管理
- 従業員一覧・詳細・作成・編集・削除（論理削除）
- 部署管理（インライン作成・編集・削除）

### 共通
- ロールベースアクセス制御（Admin / Manager / Member）
- レスポンシブデザイン（モバイル対応）
- トースト通知
- ページネーション（10件/ページ）
- テキスト検索・ステータスフィルタ

## ディレクトリ構成

```
src/
├── app/
│   ├── (auth)/login/          # ログイン画面
│   ├── (dashboard)/           # 認証済みレイアウト
│   │   ├── page.tsx           # ダッシュボード
│   │   ├── sales/             # 営業モジュール
│   │   ├── projects/          # 案件モジュール
│   │   ├── finance/           # 財務モジュール
│   │   └── hr/                # 人事モジュール
│   └── api/auth/              # NextAuth API
├── components/
│   ├── ui/                    # 基本UIコンポーネント
│   ├── layout/                # レイアウトコンポーネント
│   ├── shared/                # 共通コンポーネント
│   ├── sales/                 # 営業モジュールコンポーネント
│   ├── projects/              # 案件モジュールコンポーネント
│   ├── finance/               # 財務モジュールコンポーネント
│   └── hr/                    # 人事モジュールコンポーネント
├── lib/
│   ├── actions/               # Server Actions
│   ├── auth.ts                # NextAuth設定
│   ├── prisma.ts              # Prismaクライアント
│   ├── constants.ts           # 定数定義
│   └── utils.ts               # ユーティリティ
├── hooks/
│   └── use-toast.ts           # トースト hook
├── types/
│   └── next-auth.d.ts         # NextAuth型拡張
└── middleware.ts              # 認証ミドルウェア
prisma/
├── schema.prisma              # スキーマ定義
└── seed.ts                    # シードデータ
```

## 環境変数

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `DATABASE_URL` | PostgreSQL接続URL | `postgresql://user:pass@localhost:5432/bizboard` |
| `NEXTAUTH_URL` | アプリのURL | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | JWTシークレット（本番は必ず変更） | ランダム文字列 |

## ロール権限

| 機能 | Member | Manager | Admin |
|------|--------|---------|-------|
| 一覧・詳細閲覧 | ✓ | ✓ | ✓ |
| 顧客・商談・案件 作成/編集 | - | ✓ | ✓ |
| 経費申請 作成/編集/削除 | ✓ | ✓ | ✓ |
| 経費承認 | - | ✓ | ✓ |
| 収支サマリー | - | ✓ | ✓ |
| 従業員詳細閲覧 | - | ✓ | ✓ |
| 従業員 作成/編集/削除 | - | - | ✓ |
| 部署管理 | - | ✓ | ✓ |
