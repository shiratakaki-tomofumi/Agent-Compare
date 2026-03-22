# BizBoard — 技術スタック・制約事項

## 必須技術スタック

| レイヤー | 技術 | バージョン指定 |
|---------|------|---------------|
| フロントエンド | Next.js (App Router) | 14.x 以上 |
| 言語 | TypeScript | 5.x |
| スタイリング | Tailwind CSS | 3.x 以上 |
| バックエンド | Next.js API Routes / Server Actions | - |
| ORM | Prisma | 5.x 以上 |
| データベース | PostgreSQL | 15.x 以上 |
| 認証 | NextAuth.js (Auth.js) | v4 または v5 |
| パッケージマネージャ | npm または yarn または pnpm | エージェントに委ねる |

## エージェントに委ねる技術選定（評価ポイント）

以下の技術選定はエージェントの自律的な判断に委ねます。選定の妥当性は評価対象です。

| 領域 | 選択肢の例 | 評価観点 |
|------|-----------|---------|
| 状態管理 | React Context, Zustand, Jotai, Redux Toolkit, TanStack Query 等 | プロジェクト規模に対する適切さ |
| UIコンポーネント | shadcn/ui, Radix UI, Headless UI, 自作 等 | 品質と生産性のバランス |
| フォーム管理 | React Hook Form, Formik, 自作 等 | バリデーション実装の妥当性 |
| チャートライブラリ | Recharts, Chart.js, Nivo, Tremor 等 | ダッシュボードの表現力 |
| バリデーション | Zod, Yup, 自作 等 | 型安全性との連携 |
| テーブル/データグリッド | TanStack Table, 自作 等 | ページネーション・ソート対応 |

## 制約事項

### 必須制約
1. **TypeScript strict mode** を有効にすること
2. **`any` 型の使用は禁止**（やむを得ない場合は `unknown` + 型ガードを使用）
3. **App Router** を使用すること（Pages Router は不可）
4. **Server Components** と **Client Components** を適切に使い分けること
5. **Prisma** を使用してDBアクセスすること（Raw SQL直書きは不可）
6. **環境変数** はすべて `.env` ファイルで管理すること

### 推奨事項
- ESLint / Prettier の設定を含めること
- 適切なディレクトリ構成を採用すること（構成自体は評価対象）
- エラーハンドリングを適切に実装すること
- ローディング状態を表示すること
- レスポンシブデザインを実装すること

### 禁止事項
- JavaScript（.js, .jsx）ファイルの使用（設定ファイルを除く）
- `@ts-ignore` / `@ts-nocheck` の使用
- インラインスタイル（style属性）の多用（Tailwind CSSを使用すること）

## ディレクトリ構成

エージェントの自律的判断に委ねる（構成自体が評価対象）。
