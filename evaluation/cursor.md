# BizBoard 評価結果: Cursor

評価者: Claude Opus 4.6 (コードレビュー + 実行テスト)
評価日: 2026-03-25
使用モデル: Auto（無料版 — フロンティアモデルを自動選択）

## 実行テスト結果

- **npm install**: 成功
- **prisma migrate dev**: 成功（マイグレーション生成・適用OK）
- **prisma seed**: 成功（6ユーザー、5顧客、商談・案件・タスク・経費・予算・勤怠・売上データ投入）
- **npm run build**: 成功（Next.js 14、全ルートビルド完了）
- **ログイン（curl）**: admin@bizboard.jp / password123 → 200 OK、セッション取得成功
- **全ページ（認証済み）**: /, /sales/customers, /sales/deals, /projects, /finance/expenses, /finance/summary, /hr/employees, /hr/departments, /hr/attendance → 全て200 OK
- **未認証アクセス**: / → 307（リダイレクト）、API → 401（認証チェック正常）
- **API CRUD**: 顧客作成（Zodバリデーションでstatus必須を検出）、商談作成成功、経費作成成功、案件作成成功
- **不正ID**: APIは404、ページは200（Server Componentでの404表示がHTTPステータスに反映されない）
- **Memberロール経費承認**: PATCH → 405（承認はPATCHルートではなく別エンドポイント）

**注記**: curlでのAPI直接テストでは全機能正常動作。

### ブラウザ実操作テスト（追加検証）

- **ログイン**: **失敗** — メールアドレス・パスワードを入力して「ログイン」を押すと、両フィールドに "Invalid input: expected string, received undefined" と表示される。@base-ui/react InputがforwardRefでrefを転送しないため、react-hook-formの`register()`が値を取得できない
- **ログインできないため、以降の全画面操作はテスト不可能**

コードレビュー時の評価「ブラウザからの全フォーム操作が不可能」がブラウザ実操作で確認された。

## 致命的問題

**ブラウザからの全フォーム操作が不可能（Claude Codeと同一の問題）。** shadcn/ui v4系で生成された`@base-ui/react`の`Input`コンポーネントが`react-hook-form`の`register()`が返す`ref`をフォワードできず、全入力値が`undefined`になる。ログインを含む全フォームが影響を受け、ブラウザ操作でのCRUD・ログインが一切できない。

影響を受けるフォーム:
- ログイン
- 顧客作成/編集
- 商談作成/編集
- 案件作成/編集
- タスク作成/編集（Dialog内）
- 経費作成/編集
- 従業員作成/編集
- 部署作成/編集（Dialog内）

---

## A. タスク完了率: 16 / 25点

| 項目 | 配点 | 得点 | 備考 |
|------|------|------|------|
| A-1. 認証 | 3 | 1.5 | ログイン/ログアウト実装済み（API動作、ブラウザフォーム不可）。RBAC実装済み（layout・API両方でチェック） |
| A-2. ダッシュボード | 3 | 2 | KPIカード全項目実装（営業/案件/財務/人事）。アクティビティフィード実装。Server Componentでの直接DB取得は正常。ブラウザからログイン不可のため実質閲覧不可 |
| A-3. 営業管理 | 5 | 2.5 | 顧客CRUD、商談CRUD、フィルタ/検索/ページネーション全て実装。売上グラフ（月次棒グラフ/折れ線グラフ）は未実装（ダッシュボードにKPIカードのみ）。ブラウザフォーム不可のため半減 |
| A-4. 案件管理 | 5 | 3 | 案件CRUD、タスクCRUD（Dialog内で完結）、進捗率表示（プログレスバー付き）実装。ブラウザフォーム不可だがタスクステータス変更はSelectコンポーネント経由で動く可能性あり。API層は完動 |
| A-5. 財務管理 | 5 | 3.5 | 経費CRUD、承認ワークフロー（Dialog内コメント付き）、収支サマリー（月次・部門別予算vs実績・カテゴリ別Pieチャート）全て実装。収支サマリーはServer Componentなので表示は正常 |
| A-6. 人事管理 | 4 | 3.5 | 従業員CRUD、部署管理（Dialog内CRUD）、勤怠サマリー（月次・従業員別一覧）、従業員詳細に個別勤怠表示。ページが全て存在し表示系は正常動作 |

※ ブラウザのフォーム不可問題はあるが、表示系ページ（一覧・詳細・サマリー）はServer Componentで直接DB取得しているためログインさえ通ればSSR上は正常表示される。Claude Codeよりも勤怠サマリーと部署管理が完備しているため各項目やや高い評価。

## B. 操作品質: 5 / 15点

| 項目 | 配点 | 得点 | 備考 |
|------|------|------|------|
| B-1. CRUDフロー完走 | 5 | 0 | ブラウザからログイン不可のため全モジュールでCRUDフロー完走不可能 |
| B-2. エッジケース耐性 | 4 | 2 | API層: 不正ID→404、権限不足→403正常。論理削除済み→404。部署削除時の所属者チェック実装。ブラウザ操作不可 |
| B-3. エラーハンドリングUI | 3 | 2 | error.tsx配置（dashboard共通、再試行ボタン付き）、loading.tsx配置（Skeleton UI）。Toaster設置済み |
| B-4. バリデーション | 3 | 1 | サーバーサイドZod検証は全API実装済み。クライアントサイドもreact-hook-form+zodResolver設定済みだがフォーム自体が動作しないため検証不可 |

## C. セキュリティ: 13 / 15点

| 項目 | 配点 | 得点 | 備考 |
|------|------|------|------|
| C-1. 認証チェック | 5 | 5 | 全APIルートで`requireAuth()`呼び出し。ダッシュボードlayoutでセッションチェック→リダイレクト |
| C-2. 認可チェック | 4 | 3.5 | 顧客/商談/案件作成はMANAGER/ADMIN限定。従業員CRUDはADMIN限定。経費承認はMANAGER/ADMIN限定。経費の編集/削除は申請者本人かつPENDINGのみ。経費一覧GETでMemberに全件見える点は軽微な認可漏れ |
| C-3. 入力バリデーション | 3 | 3 | 全APIでZodスキーマ`safeParse`実装。型安全なバリデーション。承認APIにも個別Zodスキーマ |
| C-4. 情報漏洩防止 | 3 | 1.5 | パスワードbcryptハッシュ化(12rounds)。従業員API応答でpassword除外（select使用）。`.env.example`にNEXTAUTH_SECRETのプレースホルダ値が含まれる。エラー時にスタックトレース非露出（`handleApiError`で内部エラーを汎用メッセージ化） |

## D. パフォーマンス: 9 / 10点

| 項目 | 配点 | 得点 | 備考 |
|------|------|------|------|
| D-1. N+1防止 | 3 | 3 | 全クエリで`include`/`select`使用。ダッシュボードの13クエリも`Promise.all`で並列実行。リレーション取得は必要なフィールドのみ `select` |
| D-2. ページネーション | 3 | 3 | 全一覧画面（顧客/商談/案件/経費/従業員）で`take`/`skip`実装。`PAGE_SIZE`定数化 |
| D-3. Server/Client分離 | 2 | 2 | 一覧・詳細・サマリーページはServer Componentで直接Prismaクエリ。フォーム・フィルタ・ページネーションのみClient Component。`"use client"`ファイルにPrismaインポート無し |
| D-4. バンドル・キャッシュ | 2 | 1 | recharts使用（Pieチャートのみで全バンドル含む可能性）。`@base-ui/react`と`shadcn` CLIが依存に混入。`next-themes`はインストール済みだが未使用 |

## E. 保守性・拡張性: 8 / 10点

| 項目 | 配点 | 得点 | 備考 |
|------|------|------|------|
| E-1. 型定義一元管理 | 3 | 2 | Zodスキーマから`z.infer`で型生成、バリデーション型は一元管理。ページ内でのローカル型定義（`DealRow`, `ExpenseRow`等）が多数あるが、Prisma生成型の直接活用は限定的。`any`使用ゼロ、`ts-ignore`ゼロ |
| E-2. 共通コンポーネント | 3 | 2 | StatusBadge/EmptyState/Pagination/DataTable共通化。ただしPaginationラッパーが3重複（CustomerPagination/DealPagination/EmployeePagination）で中身がほぼ同一。DataTableは定義されているが実際にはほとんど使われていない |
| E-3. 定数・設定管理 | 2 | 2 | `constants.ts`に全ステータスラベル・ロールラベル・PAGE_SIZE一元管理。マジックナンバー排除。パンくずのpathNameMapも定数化 |
| E-4. 命名・構成一貫性 | 2 | 2 | `(auth)`/`(dashboard)`ルートグループ、ドメイン別（sales/projects/finance/hr）ディレクトリ構成が一貫。`lib/`にロジック集約。命名規則統一 |

## F. 自律的設計判断: 10 / 15点

| 項目 | 配点 | 得点 | 備考 |
|------|------|------|------|
| F-1. 状態管理 | 4 | 3 | Server Component中心の設計は適切。タスク管理はDialog内でのインラインCRUDを選択（ページ遷移なし）。ただしreact-hook-form + @base-ui/react Inputの非互換を見落とし |
| F-2. DB設計 | 4 | 3.5 | スキーマ正確でenum豊富。Budget/Revenue/Attendanceモデル完備。シードデータ充実（6部署、6ユーザー、5顧客、6商談、3案件、8タスク、6経費、4予算、15勤怠、6月分売上）。論理削除（Customer/Project/User）一貫。Dealは物理削除で不統一 |
| F-3. UIライブラリ | 4 | 1 | shadcn/ui v4系（@base-ui/react）導入したがInputとreact-hook-formの非互換が致命的。rechartsはPieChartのみ使用で活用不足（月次売上グラフ未実装） |
| F-4. アーキテクチャ | 3 | 2.5 | REST API一貫、auth-guard共通化、ルートグループ設計適切。ダッシュボードのデータ取得がAPI経由とServer Component直接の2パターン混在（重複コードあり） |

## G. セットアップ・DX: 9 / 10点

| 項目 | 配点 | 得点 | 備考 |
|------|------|------|------|
| G-1. ビルド・起動 | 4 | 4 | npm install, migrate, seed, build 想定通り成功（Next.js 14 + Prisma構成） |
| G-2. README | 3 | 3 | セットアップ手順（6ステップ）、デモアカウント表、機能一覧、ロール権限表が充実 |
| G-3. 環境・可読性 | 3 | 2 | `.env.example`あり（ただしシークレットのプレースホルダ値あり）。コメントが少ない。構造は分かりやすい |

## 合計: 70 / 100点

## 特筆すべき問題点

1. **【致命的】全フォーム動作不可** — Claude Codeと同一。`@base-ui/react`（shadcn/ui v4系）のInputがreact-hook-formのregister()のrefを転送できず、ブラウザからの全入力操作が不可能（ログイン含む）
2. **売上グラフ未実装** — REQ-S12（月次売上グラフ）に対応するBarChart/LineChartが存在しない。ダッシュボードにKPIカードはあるがグラフなし
3. **経費一覧の認可漏れ** — MemberロールでGET /api/finance/expensesが`mine`パラメータなしで全件返却される
4. **ダッシュボードのデータ取得重複** — `/api/dashboard` のAPIルートと `(dashboard)/page.tsx` のServer Component直接取得が同一ロジックで重複
5. **Paginationコンポーネント3重複** — CustomerPagination/DealPagination/EmployeePaginationがほぼ同一コード
6. **未使用依存** — `next-themes`がpackage.jsonにあるが未使用。`shadcn` CLIが本番依存に含まれる

## 総評

Cursorの実装はClaude Codeとほぼ同一の技術基盤（Next.js 14 + shadcn/ui v4 + @base-ui/react + Prisma + NextAuth v4）を選択しており、同一の致命的バグ（@base-ui/react Input × react-hook-form ref転送不可）を抱えている。

一方で、Claude Codeが未実装だった**部署管理ページ**、**勤怠サマリーページ（全員一覧）**、**従業員詳細ページ内の個別勤怠表示**が全て実装されており、タスク完了率がやや高い。財務サマリーページも収支カード・部門別予算vs実績テーブル・カテゴリ別Pieチャートの3構成で充実している。

バックエンド品質は高く、全APIでZodバリデーション・認証/認可チェック・適切なエラーハンドリングが実装されている。N+1防止・ページネーション・Server/Client分離も適切。定数管理・ディレクトリ構成も整っている。

ただし、**月次売上グラフ（REQ-S12）が完全に欠落**しており、rechartsをインストールしながらPieチャート1箇所でしか使っていない点は設計判断として不十分。また、ダッシュボードのAPIルートとServer Componentでの直接DB取得が重複しており、保守性に懸念がある。

全体として「バックエンド・設計は実務レベルだが、致命的なUI互換性問題でブラウザから操作できない」という構造はClaude Codeと酷似しており、選定ライブラリの検証不足が共通の課題である。
