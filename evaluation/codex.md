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

**注記**: Server Actions方式のため、curlでの直接APIテストは不可。

### ブラウザ実操作テスト（追加検証）

- **顧客新規登録**: フォーム入力後「保存」→ **エラー**。Inputコンポーネントが`React.forwardRef`を使っていないため、react-hook-formの`register()`のrefが転送されず、フォーム値がundefinedになる。全フォーム（顧客/商談/案件/経費/従業員の作成・編集）で同様の問題が発生する見込み
- **案件詳細ページ（/projects/[id]）**: **ランタイムエラー** — Server Componentからアロー関数（`onCreate`, `onUpdate`, `onDelete`）をClient Componentにpropsとして渡しており、Next.jsの制約に違反。"Event handlers cannot be passed to Client Component props"
- **部署管理ページ（/hr/departments）**: 同上のServer→Client関数渡しエラー
- **リンク遷移**: メニューバー以外からの画面遷移が全てできない

## 致命的問題

1. **全フォームの入力値が取得できない** — `Input`コンポーネントが`React.forwardRef`未使用のため、`react-hook-form`の`register()`が返すrefが転送されない。全作成・編集フォームで送信値がundefinedになり、CRUDのCreate/Updateがブラウザから実行不可能
2. **案件詳細・部署管理がランタイムクラッシュ** — Server Componentから関数をClient Component propsに渡すNext.js違反。案件のタスク管理と部署管理が完全に使用不可

---

## 総合所見

Codexの実装は機能カバレッジが広く、認証/認可/バリデーションの設計は一貫している。しかし**ブラウザ実操作では致命的な問題が2つ発見された**。(1) InputコンポーネントのforwardRef欠如によりreact-hook-formのref転送が機能せず全フォーム送信不可、(2) Server ComponentからClient Componentへの関数props渡しによるランタイムエラーで案件詳細・部署管理がクラッシュ。コードレビューでは高品質に見えるが、実際にブラウザで操作すると基本的なCRUD操作が完走しない。

---

## A. タスク完了率: 14.5 / 25点

| 項目 | 配点 | 得点 | 備考 |
|------|------|------|------|
| A-1. 認証 | 3 | 3 | NextAuth Credentials + JWT。ログイン/ログアウト実装済み。RBAC: ADMIN > MANAGER > MEMBER のロール階層をmiddleware + Server Action両方で実施 |
| A-2. ダッシュボード | 3 | 3 | KPIカード4種（営業/案件/財務/人事）、月次売上チャート（Recharts BarChart）、商談ステータス別件数、アクティビティフィード（最新5件） |
| A-3. 営業管理 | 5 | 2.5 | 顧客CRUD（論理削除）、商談CRUD（物理削除）実装済みだが、**全フォームのref転送不可で作成・編集が不可能**。一覧・詳細の表示は正常。売上グラフあり |
| A-4. 案件管理 | 5 | 2 | 案件CRUD実装済みだがフォーム不可。タスクCRUD（案件詳細内）は**Server→Client関数渡しエラーでページごとクラッシュ** |
| A-5. 財務管理 | 5 | 2.5 | 経費CRUD・承認ワークフロー・収支サマリー実装済みだが、フォーム送信不可。一覧・サマリー表示は正常 |
| A-6. 人事管理 | 4 | 1.5 | 従業員CRUD実装済みだがフォーム不可。**部署管理はServer→Client関数渡しエラーでクラッシュ**。勤怠は従業員詳細に統合（横断ビューなし） |

## B. 操作品質: 5 / 15点

| 項目 | 配点 | 得点 | 備考 |
|------|------|------|------|
| B-1. CRUDフロー完走 | 5 | 0 | 全フォームでInputのref転送不可のため、Create/Updateが実行不可能。案件詳細・部署管理はランタイムクラッシュ。ログインのみFormDataベースで動作 |
| B-2. エッジケース耐性 | 4 | 2 | 空データ: EmptyStateコンポーネント配置済み。不正ID: notFound()呼び出し済み。権限不足: middleware + Server Actionでredirect/fail。ただしブラウザ操作不可のため部分的検証のみ |
| B-3. エラーハンドリングUI | 3 | 3 | error.tsx（ルート）、loading.tsx（ルート）、not-found.tsx配置。Toaster（sonner）でtost.success/toast.error表示 |
| B-4. バリデーション | 3 | 2 | クライアント: zodResolver + react-hook-formでリアルタイム検証。サーバー: 全Server ActionでZod parse。ただしLoginFormはHTML required属性のみでZod検証なし（-1） |

## C. セキュリティ: 13 / 15点

| 項目 | 配点 | 得点 | 備考 |
|------|------|------|------|
| C-1. 認証チェック | 5 | 5 | middleware.tsで全ルート（login/api/auth以外）にトークン検証。Server Actionsで全てrequireSession/requireRole呼び出し |
| C-2. 認可チェック | 4 | 4 | Server Actionsレイヤーでロールチェック実施。顧客/商談/案件/タスク: MANAGER以上。従業員: ADMIN。経費申請: 自分のPENDINGのみ編集/削除。承認: MANAGER以上。経費一覧はscopeパラメータでmine/allを制御しMember時はmineのみ |
| C-3. 入力バリデーション | 3 | 3 | 全Server ActionでZodスキーマparse。型安全なバリデーション。handleError関数でZodError/PrismaClientKnownRequestErrorをユーザーフレンドリーメッセージに変換 |
| C-4. 情報漏洩防止 | 3 | 1 | パスワードハッシュ化（bcrypt、cost 12）。.env.exampleにシークレット実値なし。ただしerror.tsxでerror.messageをそのまま表示しており、Prismaエラー等の詳細がユーザーに露出する可能性（-1）。また、従業員一覧クエリでpasswordフィールドがselectで除外されておらず、全フィールドがServer Componentに渡される（クライアントにはシリアライズされないが設計上不適切）（-1） |

## D. パフォーマンス: 8 / 10点

| 項目 | 配点 | 得点 | 備考 |
|------|------|------|------|
| D-1. N+1防止 | 3 | 3 | 全クエリでinclude/select使用。ダッシュボードはPromise.allで並列クエリ。顧客一覧は_count: { select: { deals: true } }で商談数取得 |
| D-2. ページネーション | 3 | 3 | 顧客、商談、案件、経費、従業員の全一覧でtake/skip実装。PAGE_SIZE=10で定数化 |
| D-3. Server/Client分離 | 2 | 1 | ページは全てServer Component。しかし案件詳細・部署管理でServer→Client関数渡し違反あり。Client ComponentからPrisma直接アクセスはなし |
| D-4. バンドル・キャッシュ | 2 | 1 | protected layoutにforce-dynamic設定でキャッシュ無効化（認証状態依存のため妥当だが粒度が粗い）。rechartsは必要な分だけimport。revalidatePath使用でオンデマンド再検証は実装済み（-1: 全ページforce-dynamicで静的最適化の余地なし） |

## E. 保守性・拡張性: 9 / 10点

| 項目 | 配点 | 得点 | 備考 |
|------|------|------|------|
| E-1. 型定義一元管理 | 3 | 2.5 | Prisma生成型のenum（CustomerStatus, Role等）をconstants.tsやvalidators.tsで活用。next-auth.d.tsで型拡張。フォームコンポーネントのpropsは手書きだが、Prismaの型と整合している。ActionResult型がui.tsxとactions.tsで重複定義（-0.5） |
| E-2. 共通コンポーネント | 3 | 3 | Panel, PageHeader, DataTable, Pagination, SearchToolbar, StatusBadge, EmptyState, DescriptionList, KPIStat, ProgressBar, MutationButton, Breadcrumbsが共通化。FormShell, Field, Input, Textarea, Selectがフォーム共通部品。コピペなく再利用されている |
| E-3. 定数・設定管理 | 2 | 2 | constants.tsに全ステータスラベル、PAGE_SIZE、ROLE_ORDER一元管理。マジックナンバーなし |
| E-4. 命名・構成一貫性 | 2 | 1.5 | (protected)ルートグループで認証レイアウト共通化。lib/にqueries.ts, actions.ts, validators.ts, permissions.ts, constants.tsと役割別分離。ただしコンポーネントがui.tsx, forms.tsx, charts.tsx, shell.tsxの4ファイルに全て集約されており、ファイルが肥大化（forms.tsxは1156行）。ドメイン別分割が望ましい（-0.5） |

## F. 自律的設計判断: 11 / 15点

| 項目 | 配点 | 得点 | 備考 |
|------|------|------|------|
| F-1. 状態管理 | 4 | 2 | Server Component中心でデータ取得は適切。しかしInputのforwardRef欠如でreact-hook-formのref転送不可（全フォーム）、Server→Client関数渡し違反（案件詳細・部署）の2つの設計ミス |
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

## 合計: 69.5 / 100点

```
A. タスク完了率:       14.5 / 25点
  A-1. 認証:            3 / 3
  A-2. ダッシュボード:   3 / 3
  A-3. 営業管理:        2.5 / 5
  A-4. 案件管理:         2 / 5
  A-5. 財務管理:        2.5 / 5
  A-6. 人事管理:        1.5 / 4

B. 操作品質:            5 / 15点
  B-1. CRUDフロー完走:   0 / 5
  B-2. エッジケース耐性:  2 / 4
  B-3. エラーUI:         3 / 3
  B-4. バリデーション:    0 / 3 ※ref不可でバリデーション自体が発火しない

C. セキュリティ:       13 / 15点
  C-1. 認証チェック:     5 / 5
  C-2. 認可チェック:     4 / 4
  C-3. 入力バリデーション: 3 / 3
  C-4. 情報漏洩防止:     1 / 3

D. パフォーマンス:      8 / 10点
  D-1. N+1防止:         3 / 3
  D-2. ページネーション:  3 / 3
  D-3. Server/Client分離: 1 / 2
  D-4. バンドル・キャッシュ: 1 / 2

E. 保守性・拡張性:      9 / 10点
  E-1. 型定義一元管理:   2.5 / 3
  E-2. 共通コンポーネント: 3 / 3
  E-3. 定数・設定管理:   2 / 2
  E-4. 命名・構成一貫性: 1.5 / 2

F. 設計判断:           11 / 15点
  F-1. 状態管理:         2 / 4
  F-2. DB設計:          3.5 / 4
  F-3. UIライブラリ:     3 / 4
  F-4. アーキテクチャ:   2.5 / 3

G. セットアップ・DX:    9 / 10点
  G-1. ビルド・起動:    3.5 / 4
  G-2. README:          3 / 3
  G-3. 環境・可読性:    2.5 / 3

合計:                  69.5 / 100点
```

## 特筆すべき問題点

1. **【致命的】全フォームの入力値が取得できない** — `Input`コンポーネントが`React.forwardRef`を使わず `function Input(props)` で定義されているため、`react-hook-form`の`register()`が返すrefが転送されない。全作成・編集フォームでフィールド値がundefinedになり、ブラウザからのCreate/Updateが一切不可能
2. **【致命的】案件詳細・部署管理がランタイムクラッシュ** — `projects/[id]/page.tsx`と`hr/departments/page.tsx`（Server Component）からアロー関数をClient Componentのpropsに渡しており、Next.jsの"Event handlers cannot be passed to Client Component props"エラーが発生
3. **メニューバー以外からの画面遷移不可** — リンク遷移が全般的に機能しない
4. **error.tsxでerror.messageをそのまま表示** — Prismaエラー等の詳細がユーザーに露出する可能性
5. **従業員クエリでpasswordフィールド除外なし** — 設計上不適切
6. **コンポーネントファイルの肥大化** — forms.tsxが1156行

## 総評

Codexの実装はコードレビューレベルでは高品質に見える。機能カバレッジは全エージェント中最も広く、認証/認可/Zodバリデーションが一貫し、定数管理・共通コンポーネント・型安全性（any/ts-ignoreゼロ）も優秀。

しかし**ブラウザで実際に操作すると、基本的なCRUD操作が一切完走しない**。InputコンポーネントのforwardRef欠如とServer→Client関数渡し違反という2つの設計ミスにより、「見た目は完璧だが触ると動かない」という状態。これはClaude Code/Cursorの@base-ui/react問題と本質的に同じ構造（コードレビュー/ビルドは通るがブラウザ操作で発覚する問題）であり、**自己検証（実際にブラウザで操作する）の欠如**が共通の根本原因である。

Claude Code（67点）とほぼ同水準のスコア（69.5点）に修正。バックエンド設計・セキュリティ・保守性ではCodexが優位だが、ブラウザ操作の致命的バグにより操作品質で大きく減点された。
