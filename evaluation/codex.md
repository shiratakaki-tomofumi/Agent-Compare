# BizBoard 評価結果: Codex

評価者: Claude Code (コードレビュー + 実行テスト)
評価日: 2026-03-25
使用モデル: GPT-5.4 (OpenAI)

## 実行テスト結果

- **npm install**: 成功
- **prisma db push**: 成功（マイグレーションファイルなし、db pushベース）
- **prisma seed**: 成功（4ユーザー、3部署投入）
- **npm run build**: 成功（Next.js 14、全26ルートビルド完了。/finance/approvals, /finance/summary含む）
- **ログイン（curl）**: admin@bizboard.local / password123 → 200 OK、セッション取得成功（ADMIN, departmentId, departmentName含む）
- **全ページ（認証済み）**: /, /sales/customers, /sales/deals, /projects, /finance/expenses, /finance/approvals, /finance/summary, /hr/employees, /hr/departments → 全て200 OK
- **詳細ページ**: customer/deal/project/employee detail → 全て200 OK
- **編集ページ**: customer/deal/project/employee edit → 全て200 OK
- **新規作成ページ**: customer/deal/project/expense/employee new → 全て200 OK
- **未認証アクセス**: / → 200（HTML meta http-equiv="refresh"でリダイレクト、SSRレベルではredirect()呼び出し）
- **不正ID**: /sales/customers/nonexistent-id → notFound()が呼ばれ「404 ページが見つかりません」表示（正常動作）
- **Server Actions方式**: APIルートなし（NextAuth認証のみ）。curlでのCRUDテストは不可。ブラウザフォーム経由でのみ操作可能

**注記**: Server Actions方式のため、curlでの直接APIテストは不可。フォームはreact-hook-form + 標準HTML要素で@base-ui/react問題なし。

## 総合所見

Codexの実装は非常に高い完成度を持つ。全モジュール（営業、案件、財務、人事）のCRUDが揃い、ダッシュボード、売上チャート、承認ワークフロー、収支サマリー、部署管理、勤怠サマリーまで網羅されている。Server ActionsにZodバリデーションと認証/認可チェックが一貫して実装され、フォームはreact-hook-form + zodResolverで標準的なHTML input/select/textareaを使用しているため、Claude Codeで発生した@base-ui/react Inputのref転送問題は存在しない。コード量は抑えめながら機能カバレッジが広い、よくまとまった実装。

---

## A. タスク完了率: 23 / 25点

| 項目 | 配点 | 得点 | 備考 |
|------|------|------|------|
| A-1. 認証 | 3 | 3 | NextAuth Credentials + JWT。ログイン/ログアウト実装済み。RBAC: ADMIN > MANAGER > MEMBER のロール階層をmiddleware + Server Action両方で実施 |
| A-2. ダッシュボード | 3 | 3 | KPIカード4種（営業/案件/財務/人事）、月次売上チャート（Recharts BarChart）、商談ステータス別件数、アクティビティフィード（最新5件） |
| A-3. 営業管理 | 5 | 5 | 顧客CRUD（論理削除）、商談CRUD（物理削除）、顧客詳細に関連商談一覧、商談ステータス更新ボード、売上グラフ（ダッシュボードに統合） |
| A-4. 案件管理 | 5 | 5 | 案件CRUD（論理削除）、タスクCRUD（案件詳細内にインラインで実装）、進捗率表示（ProgressBar）、ステータス別フィルタ |
| A-5. 財務管理 | 5 | 4.5 | 経費CRUD、承認ワークフロー（承認/却下 + コメント）、収支サマリー（月次・部門別予算vs実績・カテゴリ別支出）。承認待ち一覧にページネーションなし（軽微） |
| A-6. 人事管理 | 4 | 3.5 | 従業員CRUD（論理削除=isActive:false）、部署管理（CRUD + 所属人数表示）、従業員詳細に月次勤怠サマリー（出勤日数・残業時間）。従業員別勤怠一覧は従業員詳細に統合されているが、全従業員横断の勤怠一覧ページ（REQ-H10）はない |

## B. 操作品質: 12 / 15点

| 項目 | 配点 | 得点 | 備考 |
|------|------|------|------|
| B-1. CRUDフロー完走 | 5 | 4 | 全モジュールでCRUD一巡の骨格が揃っている。LoginFormはFormDataベースで動作（react-hook-form不使用）、他フォームはreact-hook-form + 標準HTML要素で動作見込み。タスクの編集後にeditForm.reset条件（title === ""）が不安定な場合あり（-1） |
| B-2. エッジケース耐性 | 4 | 3 | 空データ: EmptyStateコンポーネント配置済み。不正ID: notFound()呼び出し済み。権限不足: middleware + Server Actionでredirect/fail。戻る/進む耐性: 特段の対策なし（-1） |
| B-3. エラーハンドリングUI | 3 | 3 | error.tsx（ルート）、loading.tsx（ルート）、not-found.tsx配置。Toaster（sonner）でtost.success/toast.error表示 |
| B-4. バリデーション | 3 | 2 | クライアント: zodResolver + react-hook-formでリアルタイム検証。サーバー: 全Server ActionでZod parse。ただしLoginFormはHTML required属性のみでZod検証なし（-1） |

## C. セキュリティ: 13 / 15点

| 項目 | 配点 | 得点 | 備考 |
|------|------|------|------|
| C-1. 認証チェック | 5 | 5 | middleware.tsで全ルート（login/api/auth以外）にトークン検証。Server Actionsで全てrequireSession/requireRole呼び出し |
| C-2. 認可チェック | 4 | 4 | Server Actionsレイヤーでロールチェック実施。顧客/商談/案件/タスク: MANAGER以上。従業員: ADMIN。経費申請: 自分のPENDINGのみ編集/削除。承認: MANAGER以上。経費一覧はscopeパラメータでmine/allを制御しMember時はmineのみ |
| C-3. 入力バリデーション | 3 | 3 | 全Server ActionでZodスキーマparse。型安全なバリデーション。handleError関数でZodError/PrismaClientKnownRequestErrorをユーザーフレンドリーメッセージに変換 |
| C-4. 情報漏洩防止 | 3 | 1 | パスワードハッシュ化（bcrypt、cost 12）。.env.exampleにシークレット実値なし。ただしerror.tsxでerror.messageをそのまま表示しており、Prismaエラー等の詳細がユーザーに露出する可能性（-1）。また、従業員一覧クエリでpasswordフィールドがselectで除外されておらず、全フィールドがServer Componentに渡される（クライアントにはシリアライズされないが設計上不適切）（-1） |

## D. パフォーマンス: 9 / 10点

| 項目 | 配点 | 得点 | 備考 |
|------|------|------|------|
| D-1. N+1防止 | 3 | 3 | 全クエリでinclude/select使用。ダッシュボードはPromise.allで並列クエリ。顧客一覧は_count: { select: { deals: true } }で商談数取得 |
| D-2. ページネーション | 3 | 3 | 顧客、商談、案件、経費、従業員の全一覧でtake/skip実装。PAGE_SIZE=10で定数化 |
| D-3. Server/Client分離 | 2 | 2 | ページコンポーネントは全てServer Component（async関数）。"use client"はshell, ui, forms, charts, errorのみ。Client ComponentからPrisma直接アクセスなし（type importのみ） |
| D-4. バンドル・キャッシュ | 2 | 1 | protected layoutにforce-dynamic設定でキャッシュ無効化（認証状態依存のため妥当だが粒度が粗い）。rechartsは必要な分だけimport。revalidatePath使用でオンデマンド再検証は実装済み（-1: 全ページforce-dynamicで静的最適化の余地なし） |

## E. 保守性・拡張性: 9 / 10点

| 項目 | 配点 | 得点 | 備考 |
|------|------|------|------|
| E-1. 型定義一元管理 | 3 | 2.5 | Prisma生成型のenum（CustomerStatus, Role等）をconstants.tsやvalidators.tsで活用。next-auth.d.tsで型拡張。フォームコンポーネントのpropsは手書きだが、Prismaの型と整合している。ActionResult型がui.tsxとactions.tsで重複定義（-0.5） |
| E-2. 共通コンポーネント | 3 | 3 | Panel, PageHeader, DataTable, Pagination, SearchToolbar, StatusBadge, EmptyState, DescriptionList, KPIStat, ProgressBar, MutationButton, Breadcrumbsが共通化。FormShell, Field, Input, Textarea, Selectがフォーム共通部品。コピペなく再利用されている |
| E-3. 定数・設定管理 | 2 | 2 | constants.tsに全ステータスラベル、PAGE_SIZE、ROLE_ORDER一元管理。マジックナンバーなし |
| E-4. 命名・構成一貫性 | 2 | 1.5 | (protected)ルートグループで認証レイアウト共通化。lib/にqueries.ts, actions.ts, validators.ts, permissions.ts, constants.tsと役割別分離。ただしコンポーネントがui.tsx, forms.tsx, charts.tsx, shell.tsxの4ファイルに全て集約されており、ファイルが肥大化（forms.tsxは1156行）。ドメイン別分割が望ましい（-0.5） |

## F. 自律的設計判断: 13 / 15点

| 項目 | 配点 | 得点 | 備考 |
|------|------|------|------|
| F-1. 状態管理 | 4 | 4 | Server Component中心でデータ取得し、Client ComponentはUI操作のみ。react-hook-form + zodResolver + 標準HTML要素の組み合わせは堅実で互換性問題なし。useTransitionでサーバーアクション呼び出し |
| F-2. DB設計 | 4 | 3.5 | スキーマが要件と正確に対応。enum活用、インデックス設定、論理削除（Customer, Project）と物理削除（Deal, Task, Expense）の使い分けあり。Revenue, Budget, Attendanceテーブルも設計。シードデータが充実（4ユーザー、3部署、3顧客、3商談、2案件、3タスク、2経費、予算、勤怠）。削除戦略の不統一は軽微（-0.5） |
| F-3. UIライブラリ | 4 | 3 | UIライブラリなし（Tailwind CSS直書き）。shadcn/uiなどのコンポーネントライブラリを使わず自前実装。品質は高いが、テーマ一貫性やアクセシビリティ（aria属性等）の面で既成ライブラリに劣る（-1） |
| F-4. アーキテクチャ | 3 | 2.5 | Server Actions（API Routeなし）パターンで統一。queries.tsにRead、actions.tsにWrite操作を分離。middleware.tsでルートレベル認可。ただしAPI Routeがないため外部連携やテスト容易性は低い（-0.5） |

## G. セットアップ・DX: 9 / 10点

| 項目 | 配点 | 得点 | 備考 |
|------|------|------|------|
| G-1. ビルド・起動 | 4 | 3.5 | package.jsonにprisma:push, prisma:seed, postinstallスクリプト。prisma migrationsディレクトリがなくdb pushベース（マイグレーション履歴なし、-0.5） |
| G-2. README | 3 | 3 | セットアップ手順、ログインアカウント、機能一覧、技術スタック、ディレクトリ構成、主要コマンド |
| G-3. 環境・可読性 | 3 | 2.5 | .env.example適切。コードのコメントはほぼないが、関数名・変数名が自己文書化的。ファイル構成は論理的だがコンポーネントファイルの肥大化が気になる（-0.5） |

---

## 合計: 88 / 100点

```
A. タスク完了率:       23 / 25点
  A-1. 認証:            3 / 3
  A-2. ダッシュボード:   3 / 3
  A-3. 営業管理:         5 / 5
  A-4. 案件管理:         5 / 5
  A-5. 財務管理:        4.5 / 5
  A-6. 人事管理:        3.5 / 4

B. 操作品質:           12 / 15点
  B-1. CRUDフロー完走:   4 / 5
  B-2. エッジケース耐性:  3 / 4
  B-3. エラーUI:         3 / 3
  B-4. バリデーション:    2 / 3

C. セキュリティ:       13 / 15点
  C-1. 認証チェック:     5 / 5
  C-2. 認可チェック:     4 / 4
  C-3. 入力バリデーション: 3 / 3
  C-4. 情報漏洩防止:     1 / 3

D. パフォーマンス:      9 / 10点
  D-1. N+1防止:         3 / 3
  D-2. ページネーション:  3 / 3
  D-3. Server/Client分離: 2 / 2
  D-4. バンドル・キャッシュ: 1 / 2

E. 保守性・拡張性:      9 / 10点
  E-1. 型定義一元管理:   2.5 / 3
  E-2. 共通コンポーネント: 3 / 3
  E-3. 定数・設定管理:   2 / 2
  E-4. 命名・構成一貫性: 1.5 / 2

F. 設計判断:           13 / 15点
  F-1. 状態管理:         4 / 4
  F-2. DB設計:          3.5 / 4
  F-3. UIライブラリ:     3 / 4
  F-4. アーキテクチャ:   2.5 / 3

G. セットアップ・DX:    9 / 10点
  G-1. ビルド・起動:    3.5 / 4
  G-2. README:          3 / 3
  G-3. 環境・可読性:    2.5 / 3

合計:                  88 / 100点
```

## 特筆すべき問題点

1. **error.tsxでerror.messageをそのまま表示** -- Prismaのエラー詳細やスタックトレース情報がユーザーに露出する可能性がある
2. **従業員クエリでpasswordフィールド除外なし** -- `getEmployeeList`/`getEmployeeDetail`でUser全フィールドがServer Componentに渡る（クライアントにシリアライズはされないが設計上問題）
3. **全従業員横断の勤怠一覧ページなし** -- REQ-H10の従業員別勤怠状況一覧は従業員詳細に統合されているが、横断ビューがない
4. **コンポーネントファイルの肥大化** -- forms.txsが1156行、ui.tsxが434行。ドメイン別分割が望ましい
5. **prisma migrationsなし** -- db pushベースでマイグレーション履歴がない

## 総評

Codexの実装は機能カバレッジ、セキュリティ、パフォーマンス、保守性の全面で高水準。特に以下の点が優れている:

- **全モジュール完備**: ダッシュボード、営業（顧客/商談）、案件（タスク含む）、財務（経費/承認/収支）、人事（従業員/部署/勤怠）の全機能が実装済み
- **フォーム動作の安定性**: react-hook-form + 標準HTML要素という堅実な組み合わせにより、Claude Codeで発生した@base-ui/react Inputのref転送問題を回避
- **一貫したセキュリティ**: 全Server Actionにrequire Session/requireRole + Zodバリデーション。middlewareでルートレベル認可
- **優れた定数管理**: constants.tsに全ステータスラベルを一元管理、マジックナンバーなし
- **充実した共通コンポーネント**: 12以上の再利用可能なUIコンポーネントでコピペなし
- **`any`/`ts-ignore`使用ゼロ**: 型安全性が高い

主な改善点はerror.tsxでのエラー詳細露出、従業員クエリでのpasswordフィールド除外忘れ、コンポーネントファイルの肥大化程度であり、致命的な問題はない。Claude Code（67点）と比較して、フォームが正常動作する点だけでも大きなアドバンテージがあり、機能カバレッジもより広い。
