# BizBoard 評価結果: GitHub Copilot

評価者: Claude Code (コードレビュー + 実行テスト)
評価日: 2026-03-25
使用モデル: GPT-4o（無料版デフォルト）

## 実行テスト結果

- **npm install**: 成功
- **prisma migrate dev**: 成功（Already in sync）
- **prisma seed**: 成功（Seed completed.）
- **npm run build**: **失敗** — `app/api/auth/[...nextauth]/route.ts` で `export { handler as GET, handler as POST } from "@/lib/auth"` が `lib/auth.ts` 内の `handler` エクスポートとダブルエクスポート衝突。Turbopackビルドエラー: "Export handler doesn't exist in target module"
- **原因**: `lib/auth.ts` が `export { handler as GET, handler as POST }` としてGET/POSTを直接エクスポートしているが、`route.ts`は `handler` 名でre-exportしようとしている。`handler` という名前のexportは存在せず、`GET` と `POST` のみ。

**ビルドが通らないため、起動・動作テストは実施不可。**

## 致命的問題

1. **ダッシュボード（`/`）がランタイムクラッシュする。** `prisma.revenue.findMany()` を呼んでいるが、Prismaスキーマに `Revenue` モデルが存在しない。ビルドは通る可能性があるが実行時に即エラー。
2. **`SessionProvider` がアプリを包んでいない。** `app/providers.tsx` にSessionProviderを定義しているが、`app/layout.tsx` で使用していない。そのため、`AppShell` 内の `useSession()` が機能せず、サイドバーのロール制御やユーザー名表示が動作しない。
3. **全APIルートに認証チェックなし。** `/api/customers` と `/api/deals` のGET/POST/PUT/DELETEで `getServerSession` を呼んでおらず、未認証ユーザーが直接APIを叩ける。

---

## A. タスク完了率: 8.5 / 25点

| 項目 | 配点 | 得点 | 備考 |
|------|------|------|------|
| A-1. 認証 | 3 | 1.5 | ログイン/ログアウトUI実装済み（1点）。ページレベルではgetServerSession使用。ただしSessionProvider未接続でAppShellのuseSessionが機能しない。RBAC実装はUI出し分けのみ（API認可なし）→ 0.5点 |
| A-2. ダッシュボード | 3 | 1 | KPIカード実装あるがRevenue未定義でランタイムクラッシュ（0.5点）。アクティビティフィードはハードコード（0.5点） |
| A-3. 営業管理 | 5 | 3 | 顧客CRUD：一覧・詳細・作成・編集・削除(API)完備（2点）。商談CRUD：一覧・作成・編集あるが詳細ページ欠落（1点）。売上グラフ未実装（0点） |
| A-4. 案件管理 | 5 | 1 | 案件一覧のみ。作成・詳細・編集・削除ページ未実装。タスクCRUD未実装。進捗バー表示はあるがN+1あり（1点） |
| A-5. 財務管理 | 5 | 1 | 経費一覧のみ。経費作成・編集・削除ページなし。承認ワークフローUI（承認待ちページ）未実装。収支サマリー未実装 |
| A-6. 人事管理 | 4 | 1 | 部署一覧表示のみ（所属人数表示あり=0.5点）。従業員CRUD未実装。部署の編集・削除ボタンはあるが動作しない（0.5点）。勤怠サマリー未実装 |

## B. 操作品質: 2 / 15点

| 項目 | 配点 | 得点 | 備考 |
|------|------|------|------|
| B-1. CRUDフロー完走 | 5 | 1 | 顧客のみフロー一巡の可能性あり（ただしSessionProvider未接続でAppShell表示に問題）。他モジュールはページ欠落で不可 |
| B-2. エッジケース耐性 | 4 | 1 | 空データ表示「データがありません」実装（1点）。不正ID→顧客詳細で「見つかりません」表示あり。ただしダッシュボードのRevenue参照でアプリ全体がクラッシュ |
| B-3. エラーハンドリングUI | 3 | 0 | error.tsx未配置（0点）、loading.tsx未配置（0点）、トースト未実装（alertのみ） |
| B-4. バリデーション | 3 | 0.5 | HTML required属性のみ（0.5点）。サーバーサイドバリデーション未実装。Zod依存あるが未使用 |

## C. セキュリティ: 3 / 15点

| 項目 | 配点 | 得点 | 備考 |
|------|------|------|------|
| C-1. 認証チェック | 5 | 1 | ページ（Server Component）ではgetServerSession実装。しかし全APIルート（customers, deals）に認証チェックなし。未認証で直接API操作可能 |
| C-2. 認可チェック | 4 | 0 | APIレイヤーでのロールチェック皆無。UI出し分けのみ（canEdit変数でボタン表示/非表示）でAPIは誰でも呼べる |
| C-3. 入力バリデーション | 3 | 0 | サーバーサイドバリデーション未実装。APIルートでrequest.json()をそのままPrismaに渡している。Zod依存あるが未使用 |
| C-4. 情報漏洩防止 | 3 | 2 | パスワードハッシュ化bcrypt（1点）。.env.example未配置（0点）。エラー詳細はPrismaエラーがそのまま返る可能性あるが、大きな漏洩はない（1点） |

## D. パフォーマンス: 4 / 10点

| 項目 | 配点 | 得点 | 備考 |
|------|------|------|------|
| D-1. N+1防止 | 3 | 1.5 | 商談一覧でinclude使用、部署でcount使用。しかし案件一覧でmap内にprisma.task.countを呼ぶN+1あり。ダッシュボードは全件findMany |
| D-2. ページネーション | 3 | 1 | APIルート（customers, deals）にtake/skip実装。しかしページUI側（Server Component）ではページネーションなし（全件取得） |
| D-3. Server/Client分離 | 2 | 1.5 | 一覧・詳細はServer Component。フォームはClient Component。ただしAppShellがuse clientでuseSession使用（SessionProvider未接続で機能しない） |
| D-4. バンドル・キャッシュ | 2 | 0 | recharts, zod, @hookform/resolvers がインストール済みだが未使用（バンドル肥大化）。revalidation設定なし |

## E. 保守性・拡張性: 2.5 / 10点

| 項目 | 配点 | 得点 | 備考 |
|------|------|------|------|
| E-1. 型定義一元管理 | 3 | 0.5 | Prisma生成型の活用なし。`as any` が15箇所以上。`useState<any>` 使用あり。手書きtype定義（DealFormPropsなど）がPrisma型と乖離リスク |
| E-2. 共通コンポーネント | 3 | 1 | AppShellのみ共通化。テーブル構造は各ページでコピペ。DetailItemは顧客詳細ローカル。DealFormは再利用可能だが1箇所のみ |
| E-3. 定数・設定管理 | 2 | 0.5 | ステータス値がリテラル文字列でハードコード（"ACTIVE", "WON"等）。ページサイズもAPIで`const limit = 10`とマジックナンバー。メニュー定義のみ定数化 |
| E-4. 命名・構成一貫性 | 2 | 0.5 | ディレクトリ構成は論理的（sales/customers, sales/deals等）。ただしlib/auth.tsにNextAuthハンドラ定義とauthOptions混在。命名は概ね統一 |

## F. 自律的設計判断: 6 / 15点

| 項目 | 配点 | 得点 | 備考 |
|------|------|------|------|
| F-1. 状態管理 | 4 | 2 | Server Component中心の設計は適切。react-hook-form使用は1箇所のみ（顧客新規）、他はuseState/FormData混在で一貫性なし |
| F-2. DB設計 | 4 | 2.5 | スキーマは要件を概ね網羅（Customer, Deal, Project, Task, Expense, Budget, Attendance, Department）。enum活用。ただしRevenue モデル欠落がダッシュボードクラッシュの原因。シードデータは最低限 |
| F-3. UIライブラリ | 4 | 0.5 | tailwindcssのみで素のHTML要素。recharts依存あるが未使用。lucide-react依存あるが未使用。UIライブラリの選定と活用が不十分 |
| F-4. アーキテクチャ | 3 | 1 | APIルートとServer Component直接Prisma呼出しが混在（一覧はServer Component直接、フォームはfetch→API）。データフロー不統一。ディレクトリ構成は妥当 |

## G. セットアップ・DX: 2 / 10点

| 項目 | 配点 | 得点 | 備考 |
|------|------|------|------|
| G-1. ビルド・起動 | 4 | 1 | npm install成功（1点）。prisma migrate成功。seed成功。しかし**npm run buildが失敗**（route.tsのexportエラー）。起動不可 |
| G-2. README | 3 | 0 | READMEはcreate-next-appのデフォルト。セットアップ手順なし、機能説明なし、デモアカウント情報なし。SETUP.mdはCopilot利用手順であってアプリのREADMEではない |
| G-3. 環境・可読性 | 3 | 1 | .env.exampleなし（0点）。コメントほぼなし（0点）。ディレクトリ構造は分かりやすい（1点） |

## 合計: 28 / 100点

## 特筆すべき問題点

1. **【致命的】ダッシュボードがランタイムクラッシュ** — `prisma.revenue.findMany()` を呼んでいるが `Revenue` モデルがPrismaスキーマに存在しない
2. **【致命的】SessionProvider未接続** — `app/providers.tsx` を定義しているが `app/layout.tsx` で使用していないため、全ページのAppShellでuseSession()が機能しない
3. **【致命的】全APIルートに認証なし** — `/api/customers` と `/api/deals` で getServerSession を呼んでいない。未認証ユーザーがデータの読取・作成・更新・削除を実行可能
4. **大量の未実装ページ** — 商談詳細、案件CRUD、タスクCRUD、経費作成/編集、承認ワークフロー、従業員CRUD、勤怠サマリー、売上グラフ、収支サマリーが全て欠落
5. **未使用依存が多数** — zod, recharts, @hookform/resolvers, lucide-react がpackage.jsonにあるが実際のコードで使用されていない
6. **サーバーサイドバリデーション皆無** — APIルートでリクエストボディをそのままPrismaに渡している
7. **案件一覧にN+1クエリ** — map内で各プロジェクトごとにprisma.task.countを呼んでいる

## 総評

GitHub Copilotによる実装は、プロジェクトの骨格（認証基盤、Prismaスキーマ、基本的なページ構成）は作成されているが、**実装の完成度が非常に低い**。全体のおよそ30-40%程度しか実装されておらず、実装済み部分にも致命的なバグ（Revenue未定義、SessionProvider未接続、API認証なし）がある。

Prismaスキーマは要件をほぼ網羅しており、顧客CRUDは一通りのフローが存在する点は評価できる。しかし、商談以降のモジュールは一覧表示のみで止まっており、タスク管理、経費申請/承認、従業員管理、売上グラフなど要件の大半が未実装。セキュリティ面では全APIルートに認証・認可・バリデーションがなく、業務アプリとして最低限の品質を満たしていない。依存パッケージ（zod, recharts等）をインストールしたが活用せずに放置されている点も、実装の途中で中断した印象を強める。
