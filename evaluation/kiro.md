# BizBoard 評価結果: Kiro

評価者: Claude Code (コードレビュー + 実行テスト)
評価日: 2026-03-25
使用モデル: Auto（無料版+$5課金 — Claude Sonnet 4.5ベース）

## 実行テスト結果

- **npm install**: 成功
- **prisma migrate dev**: 成功（マイグレーション生成・適用OK）
- **prisma seed**: 成功（ログインアカウント表示あり: admin/manager/member@bizboard.example）
- **npm run build**: 成功（Next.js 14、全26ルート + Middleware）
- **ログイン（curl）**: admin@bizboard.example / password123 → 200 OK、セッション取得成功（ADMIN）
- **全ページ（認証済み）**: /, /sales/customers, /sales/deals, /projects, /finance/expenses, /finance/approvals, /finance/summary, /hr/employees, /hr/departments → 全て200 OK
- **詳細ページ**: customer/deal/project detail → 全て200 OK
- **未認証アクセス**: / → 307, /sales/customers → 307（middleware.tsでリダイレクト、正常動作）
- **不正ID**: /sales/customers/nonexistent → 200（notFound()の可能性あるがHTTPステータスは200）
- **Memberロールテスト**: member@bizboard.example でログイン成功。/hr/departments → 200, /finance/approvals → 200（ページアクセスは許可、Server Action側でロール制御の方針）
- **Prismaクエリログ**: ダッシュボードで14クエリ発行（groupBy, aggregate, findMany等）。N+1は確認されず

**注記**: Server Actions方式でAPIルートなし。フォームはreact-hook-form + shadcn/ui (Radix UI forwardRef)で@base-ui/react問題なし。

### ブラウザ実操作テスト（追加検証）

- **ログイン**: 正常動作
- **新規作成（顧客/商談/案件/経費/従業員）**: 正常動作
- **一覧表示・詳細表示**: 正常動作
- **編集ページ**: **全5画面でランタイムエラー** — Server Componentからアロー関数 `(fd) => updateXxx(params.id, fd)` をClient Componentのaction propsに渡しており、Next.jsの"Event handlers cannot be passed to Client Component props"エラーが発生。顧客編集・商談編集・案件編集・経費編集・従業員編集の全てが影響
- **削除**: 正常動作
- **承認/却下**: 正常動作
- **それ以外**: 問題なし

## 致命的問題

**全編集ページがランタイムクラッシュ。** 新規作成ページではServer Action関数を直接渡しているため正常動作するが、編集ページでは `(fd) => updateXxx(params.id, fd)` というアロー関数でIDをバインドしてClient Componentに渡しており、Next.jsのServer/Client境界制約に違反する。5画面（顧客・商談・案件・経費・従業員の編集）が影響。

影響を受けるページ:
- `/sales/customers/[id]/edit`
- `/sales/deals/[id]/edit`
- `/projects/[id]/edit`
- `/finance/expenses/[id]/edit`
- `/hr/employees/[id]/edit`

その他の未実装:
- 売上ダッシュボード（月次売上グラフ）が存在しない
- 勤怠サマリーページが存在しない
- Attendanceモデルはスキーマに定義されているが、一切使用されていない

---

## A. タスク完了率: 17.5 / 25点

| 項目 | 配点 | 得点 | 備考 |
|------|------|------|------|
| A-1. 認証 | 3 | 3 | NextAuth Credentials + JWT。ログイン/ログアウト実装済み。middleware.tsで未認証リダイレクト。RBAC: requireRole()で全Server Actionにロールチェック。サイドバーのロール別表示出し分けあり |
| A-2. ダッシュボード | 3 | 3 | KPIカード4種（営業・案件・財務・人事）。アクティビティフィード（直近5件: 商談・経費・案件の複合ソート）。財務カードはManager/Admin限定表示 |
| A-3. 営業管理 | 5 | 3 | 顧客・商談の作成/一覧/詳細/削除は正常動作。**編集ページがServer→Client関数渡しエラーでクラッシュ**（-0.5）。売上グラフ未実装（-1）。商談ステータス別サマリーなし（-0.5） |
| A-4. 案件管理 | 5 | 4.5 | 案件の作成/一覧/詳細/削除、タスクCRUD（ダイアログ内）、進捗率表示は正常動作。**案件編集ページのみクラッシュ**（-0.5） |
| A-5. 財務管理 | 5 | 4.5 | 経費の作成/一覧/承認/却下/削除は正常動作。収支サマリー正常。**経費編集ページのみクラッシュ**（-0.5） |
| A-6. 人事管理 | 4 | 2.5 | 従業員の作成/一覧/詳細/削除、部署管理は正常動作。**従業員編集ページクラッシュ**（-0.5）。勤怠サマリー未実装（-1） |

## B. 操作品質: 10 / 15点

| 項目 | 配点 | 得点 | 備考 |
|------|------|------|------|
| B-1. CRUDフロー完走 | 5 | 2 | 作成→一覧→詳細→削除は全モジュールで正常動作（ブラウザ実操作確認済み）。ただし**全5モジュールの編集ページがクラッシュ**するため、CRUDの「U」が全滅。タスクはダイアログ内編集のため影響なし |
| B-2. エッジケース耐性 | 4 | 3 | 空データ表示: 全テーブルに「データがありません」表示あり。不正ID: notFound()で404。権限不足: requireRole()がthrowし、error.tsxで捕捉。戻る/進む耐性: 特別な対策なし（-1点） |
| B-3. エラーハンドリングUI | 3 | 3 | error.tsx（dashboardレイアウト）、loading.tsx（dashboardレイアウト）、not-found.tsx（アプリルート）、トースト通知（全フォーム操作で成功/エラー表示） |
| B-4. バリデーション | 3 | 2 | 必須項目の空送信防止: react-hook-form + Zodで実装。形式チェック: メールアドレス、金額範囲（0以上/1以上）、パスワード8文字以上。サーバーサイドバリデーション: 全Server ActionでZod safeParse実施。ただし検索フィルタのonChangeが即時発火でデバウンスなし（UX問題）。部署管理のバリデーションがZodスキーマではなく手動（`!name.trim()`）で統一性に欠ける（-1点） |

## C. セキュリティ: 12 / 15点

| 項目 | 配点 | 得点 | 備考 |
|------|------|------|------|
| C-1. 認証チェック | 5 | 5 | 全Server Actionで`requireAuth()`または`requireRole()`を呼び出し。middleware.tsで未認証を/loginにリダイレクト。ページレベルでもgetSession()によるチェックあり |
| C-2. 認可チェック | 4 | 3 | Server Actionレベルでロールチェック実施。顧客/商談/案件の作成・編集はManager/Admin。従業員の作成・編集・削除はAdmin。経費承認はManager/Admin。経費の編集・削除は申請者本人+未承認チェック。ただし経費一覧(getExpenses)でuserIdフィルタはUIからのパラメータに依存し、Server Action内でセッションユーザーに基づく強制フィルタではない。Memberが`?all=1`パラメータをURLに手動追加しても、UI側の`isManagerOrAdmin`チェックはあるが、getExpenses自体は全件返す（-1点） |
| C-3. 入力バリデーション | 3 | 3 | 全Server ActionでZod safeParse。nativeEnumでenum型の厳密な検証。z.coerce.number()で数値変換。email()でメール形式検証 |
| C-4. 情報漏洩防止 | 3 | 1 | パスワードハッシュ化: bcryptjs（cost=12）。従業員クエリでuserSelectにpasswordを含めない。.env.exampleに実値なし。ただしerror.tsxでconsole.error(error)によりクライアントコンソールにエラー詳細が露出する。XSS対策: Reactが自動エスケープするためHTMLレンダリングは防がれるが、`<script>` タグがDBにそのまま保存される。サーバーエラー時に「作成に失敗しました」等の汎用メッセージを返すのは良い。環境変数管理は適切（-2点: console.errorでのエラー詳細露出、入力サニタイズなし） |

## D. パフォーマンス: 9 / 10点

| 項目 | 配点 | 得点 | 備考 |
|------|------|------|------|
| D-1. N+1防止 | 3 | 3 | 全クエリでinclude/selectを適切に使用。顧客詳細ではdeals+assigneeをinclude。商談一覧ではcustomer+assigneeをselect。案件一覧ではdepartment+_count+tasksをinclude。従業員一覧ではdepartmentをselect。経費一覧ではapplicant+approverをinclude。Dashboard: groupBy+aggregate使用 |
| D-2. ページネーション | 3 | 3 | 全一覧ページでtake/skip実装。PAGE_SIZE=10定数化。共通Paginationコンポーネントで前へ/次へナビゲーション。totalPagesの計算あり |
| D-3. Server/Client分離 | 2 | 2 | データ取得は全てServer Component（ページ）またはServer Action。"use client"ファイルにPrismaインポートなし。フォーム・インタラクションのみClient Component |
| D-4. バンドル・キャッシュ | 2 | 1 | rechartsはfinance-summary-viewのみで使用。lucide-reactは個別importでtree-shake可能。revalidatePathによるキャッシュ無効化あり。ただしSearchFilterのonChangeが即時router.pushでサーバーリクエストが大量発生する可能性あり。明示的なrevalidation設定（revalidate定数）なし（-1点） |

## E. 保守性・拡張性: 9 / 10点

| 項目 | 配点 | 得点 | 備考 |
|------|------|------|------|
| E-1. 型定義一元管理 | 3 | 2.5 | Prisma生成型をenum（Role, CustomerStatus, DealStatus等）で活用。next-auth.d.tsでセッション型を拡張。TaskPanelやDepartmentManagerで手書きinterface（Task, Department）があるが、これはPropsの型定義として妥当な範囲。`type DealRow = NonNullable<Awaited<ReturnType<typeof getCustomer>>>["deals"][number]` のようにPrismaの戻り値型を再利用している箇所もある。`any`使用ゼロ、`ts-ignore`ゼロ。ただしApprovalListのExpense interfaceなどは重複定義（-0.5点） |
| E-2. 共通コンポーネント | 3 | 3 | Pagination, SearchFilter, DeleteButtonが共通化。Badge（success/warning/info等のvariant拡張）。shadcn/ui系のButton, Input, Select, Dialog, Label, Textarea, Toastが再利用可能。フォームは各ドメインごとに専用コンポーネント（CustomerForm, DealForm, ProjectForm等）で再利用可能な設計 |
| E-3. 定数・設定管理 | 2 | 2 | constants.tsに全ステータスラベル（7種）を一元管理。PAGE_SIZE定数化。ROLE_LABELS定義。マジックナンバーなし。ステータスの色マッピングはページ内で定義されているがvariant名を使用しており許容範囲 |
| E-4. 命名・構成一貫性 | 2 | 1.5 | ルートグループ(auth)/(dashboard)、ドメイン別ディレクトリ（sales/projects/finance/hr）が一貫。components/はui/layout/shared/ドメイン別。lib/actionsにServer Action集約。命名は日本語ラベルと英語コードの混在はなく統一。ただし商談の削除がhard deleteで顧客・案件はsoft delete（論理削除）と不統一（-0.5点） |

## F. 自律的設計判断: 13 / 15点

| 項目 | 配点 | 得点 | 備考 |
|------|------|------|------|
| F-1. 状態管理 | 4 | 4 | Server Component中心のデータフェッチ + Server Actionのパターンが適切。react-hook-form + zodResolverでクライアントバリデーション。Server Actionでもサーバーサイドバリデーション（二重チェック）。フォームのonSubmitでFormDataを手動構築してServer Actionに渡す設計は堅実。revalidatePath/router.refreshによる適切なキャッシュ無効化 |
| F-2. DB設計 | 4 | 3 | スキーマが要件を正確に反映。enum活用（7種のenum定義）。Budget, Revenue, Attendanceモデルも定義。複合ユニーク制約（Budget: departmentId+year+month、Attendance: userId+date、Revenue: year+month）。インデックス定義あり。シードデータは3部署・4ユーザー・3顧客・4商談・3案件・6タスク・4経費・3予算・2売上と充実。ただしAttendanceモデルが使用されていない（-1点） |
| F-3. UIライブラリ | 4 | 4 | shadcn/ui (Radix UIベース) + Tailwind CSSの組み合わせが適切。Inputコンポーネントが標準的なforwardRefで実装されており、react-hook-formとの互換性問題なし。Badgeコンポーネントにsuccess/warning/infoバリアントを追加。Dialog, Select, Toast等を適切に活用。Recharts（finance-summary-viewのBarChart）も適切に使用 |
| F-4. アーキテクチャ | 3 | 2 | Server Action中心のAPI設計（REST APIルートなし）。auth.tsでrequireAuth/requireRoleヘルパー。ルートグループによるレイアウト分離。delete-actions.tsでredirect付き削除アクションを分離。ただしAPI endpointがなくServer Actionのみのため、外部連携やモバイルアプリからのアクセスには不向き（-1点） |

## G. セットアップ・DX: 9 / 10点

| 項目 | 配点 | 得点 | 備考 |
|------|------|------|------|
| G-1. ビルド・起動 | 4 | 4 | package.jsonにdb:generate, db:push, db:migrate, db:seed, db:studioの全スクリプト定義。prisma/seed.tsでupsertベースの冪等なシード。依存関係は全て実際に使用されている（未使用パッケージなし） |
| G-2. README | 3 | 3 | セットアップ手順（5ステップ）、テストアカウント表、機能一覧（4モジュール+共通）、ディレクトリ構成図、環境変数説明表、ロール権限表。非常に充実 |
| G-3. 環境・可読性 | 3 | 2 | .env.exampleあり（DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET）。ディレクトリ構成が論理的で分かりやすい。ただしコード内のコメントがほぼゼロ（employees.tsの`// Select without password`が唯一の実質的コメント）。SETUP.mdも存在するが重複（-1点） |

## 合計: 79.5 / 100点

## 特筆すべき問題点

1. **【重大】全編集ページがランタイムクラッシュ** — 5つの編集ページ（顧客・商談・案件・経費・従業員）でServer Componentからアロー関数`(fd) => updateXxx(params.id, fd)`をClient Componentに渡しており、Next.jsの"Event handlers cannot be passed to Client Component props"エラーが発生。新規作成はServer Actionを直接渡しているため正常動作
2. **売上ダッシュボード未実装** — REQ-S12（月次売上グラフ）、REQ-S13（商談ステータス別件数サマリー）、REQ-S14（目標vs実績）の独立ページがない
3. **勤怠サマリー未実装** — Attendanceモデルはスキーマに定義されているが、REQ-H09/H10の勤怠表示機能が一切ない
4. **経費一覧の認可漏れ** — getExpenses Server ActionはuserIdパラメータを受け取るが、Server Action内でセッションユーザーに基づく強制フィルタがない
5. **検索フィルタにデバウンスなし** — 文字入力のたびにサーバーリクエストが発生する
6. **コメントの欠如** — コード内にほぼコメントがない

## 総評

Kiro実装は高い完成度を持つ。認証/認可がServer Actionレベルで一貫して実装され、Zodによるサーバーサイドバリデーション、Prismaのinclude/selectによるN+1防止、ページネーション、適切なServer/Client分離がなされている。UIはshadcn/ui (Radix UI) を正しく採用しており、Claude Code実装で致命的だった@base-ui/react Inputの互換性問題が存在しない。フォーム操作が正常に機能する構成である点は大きな差別化要因。

定数管理（constants.ts）、共通コンポーネント（Pagination, SearchFilter, DeleteButton）、型安全性（any/ts-ignoreゼロ）も優秀。README、.env.example、シードデータの品質も高い。

主な減点要因は、売上ダッシュボードと勤怠サマリーの未実装、経費一覧の軽微な認可漏れ、コメント不足の3点。全体として「バックエンドもフロントエンドも実用レベルで動作する」実装であり、業務アプリとして必要な品質を概ね満たしている。
