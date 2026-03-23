# BizBoard - 業務管理ダッシュボード

営業・案件・財務・人事を一元管理する業務管理システム。

## 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript 5.x
- **スタイリング**: Tailwind CSS 3.x + shadcn/ui スタイルコンポーネント
- **ORM**: Prisma 5.x
- **データベース**: PostgreSQL 15.x
- **認証**: NextAuth.js v5 (JWT 戦略)
- **フォーム管理**: React Hook Form + Zod
- **状態管理**: TanStack Query (React Query)
- **チャート**: Recharts

## 機能概要

### 営業管理 (Sales)
- 顧客管理（CRUD、フィルタリング）
- 商談管理（ステータス遷移：リード → 提案 → 交渉 → 成約/失注）
- 売上ダッシュボード（月次売上グラフ、商談件数サマリー）

### 案件管理 (Projects)
- 案件管理（CRUD）
- タスク管理（ステータス遷移：未着手 → 進行中 → レビュー → 完了）
- 進捗表示（進捗率、案件別サマリー）

### 財務管理 (Finance)
- 経費申請（CRUD）
- 承認ワークフロー（承認/却下、コメント付き）
- 収支管理（月次収支、予算 vs 実績）

### 人事管理 (HR)
- 従業員管理（CRUD）
- 部署管理（CRUD、所属人数表示）
- 勤怠サマリー（出勤日数、残業時間）

### 共通機能
- ロールベースアクセス制御（Admin / Manager / Member）
- ログイン/ログアウト
- レスポンシブデザイン

## 開発環境構築

### 前提条件
- Node.js 18.x 以上
- PostgreSQL 15.x 以上

### インストール手順

1. リポジトリをクローン
   ```bash
   git clone <repository-url>
   cd results/claude-code-local-llm
   ```

2. 依存パッケージをインストール
   ```bash
   npm install
   ```

3. 環境変数を設定
   ```bash
   cp .env.example .env
   ```
   `.env` ファイルの `DATABASE_URL` を実際のデータベース URL に書き換えてください。

4. データベースを作成
   ```bash
   # PostgreSQL で bizboard データベースを作成
   createdb bizboard
   ```

5. Prisma マigrate 実行（スキーマ適用）
   ```bash
   npx prisma migrate dev --name init
   ```

6. シードデータを実行（デモ用データ）
   ```bash
   npx prisma db seed
   ```

7. 開発サーバーを起動
   ```bash
   npm run dev
   ```

8. ブラウザで http://localhost:3000 にアクセス

## 開発コマンド

```bash
# 開発サーバー起動（ホットリロード付き）
npm run dev

# ビルド
npm run build

# 本番環境で実行
npm start

# ESLint チェック
npm run lint

# Prisma スキーマの整形
npx prisma format

# Prisma Studio (DB 可視化)
npx prisma studio
```

## シードデータ

開発用アカウント:
- **管理者**: demo@example.com / password123
- **マネージャー**: manager@example.com / password123
- **メンバー**: member@example.com / password123

シードデータには以下のサンプルが含まれます：
- 部署（5 つ）
- ユーザー（8 名、各ロール含む）
- 顧客（10 件）
- 商談（20 件）
- 案件（6 件）
- タスク（30 件）
- 経費申請（15 件）

## プロジェクト構造

```
src/
├── app/                    # Next.js App Router ルート
│   ├── api/auth/[...nextauth]/  # 認証 API
│   ├── login/              # ログインページ
│   ├── dashboard/          # ダッシュボード
│   ├── sales/              # 営業管理
│   ├── projects/           # 案件管理
│   ├── finance/            # 財務管理
│   └── hr/                 # 人事管理
├── components/             # React コンポーネント
│   ├── ui/                 # 共通 UI コンポーネント
│   ├── layout/             # レイアウトコンポーネント
│   ├── sales/              # 営業管理コンポーネント
│   ├── projects/           # 案件管理コンポーネント
│   ├── finance/            # 財務管理コンポーネント
│   └── hr/                 # 人事管理コンポーネント
├── lib/                    # 共通ライブラリ
│   ├── prisma.ts           # Prisma クライアント
│   ├── auth.ts             # NextAuth 設定
│   └── utils.ts            # ユティリティ関数
├── schemas/                # Zod スキーマ
├── constants/              # 定数定義
└── hooks/                  # カスタム React フック
prisma/
├── schema.prisma           # データベーススキーマ
├── seed.ts                 # シードデータ
└── migrations/             # マイグレーションファイル
```

## ライセンス

MIT License
