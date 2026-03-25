# BizBoard 評価結果: Windsurf

評価者: Claude Code (コードレビュー + 実行テスト)
評価日: 2026-03-25
使用モデル: SWE-1 Lite（無料版デフォルト — Codeium/OpenAI）

## 実行テスト結果

- **npm install**: 成功
- **prisma migrate dev**: 成功（マイグレーション生成・適用OK）
- **prisma seed**: **シードファイルなし**（prisma/seed.ts 不在）
- **npm run build**: **失敗** — TypeScriptエラー: `src/app/api/users/route.ts` で Prisma の `include` と `select` を同時に使用。"Please either choose `select` or `include`." というPrisma型エラー

**ビルドが通らないため、起動・動作テストは実施不可。**

## 致命的問題

**実装が極めて不完全。** プロジェクトは初期段階で止まっており、以下の根本的な問題がある:

1. **ダッシュボード（トップページ）が未実装** — `/` はcreate-next-appのデフォルトテンプレートのまま
2. **認証が完全に未実装** — ログインページ、NextAuth設定、middleware、API認証チェックが一切存在しない（`next-auth`はpackage.jsonに入っているが未使用）
3. **全モーダルフォームの送信が不可能** — 作成ボタンにonClickハンドラが一切なく、フォーム送信ができない
4. **編集・削除ボタンが全て非機能** — Eye/Edit/Trash2アイコンボタンにonClickハンドラがない
5. **商談管理（Deal）が完全に未実装** — UIもAPIルートも存在しない
6. **タスク管理が完全に未実装** — UIもAPIルートも存在しない
7. **シードデータなし** — prisma/seed.tsが存在しない
8. **マイグレーションなし** — prisma/migrationsが存在しない

---

## A. タスク完了率: 5 / 25点

| 項目 | 配点 | 得点 | 備考 |
|------|------|------|------|
| A-1. 認証 | 3 | 0 | ログインページ・NextAuth設定・middleware全て未実装。SidebarにsignOut呼び出しがあるがSessionProvider未設定 |
| A-2. ダッシュボード | 3 | 0.5 | トップページはcreate-next-appデフォルト。ダッシュボードAPIルートは存在するが接続されていない。アクティビティフィード未実装 |
| A-3. 営業管理 | 5 | 1 | 顧客一覧表示のみ（API GET実装）。作成フォームのsubmitハンドラなし。編集・削除ボタン非機能。商談CRUD完全未実装。売上グラフ未実装 |
| A-4. 案件管理 | 5 | 1 | 案件一覧表示のみ（API GET実装、進捗率計算あり）。作成フォームsubmitなし。タスクCRUD完全未実装 |
| A-5. 財務管理 | 5 | 1.5 | 経費一覧表示（API GET実装）。承認ボタンはhandleApprove関数があるが対応APIルート `/api/expenses/[id]/approve` が存在しない。作成フォームsubmitなし。収支サマリー未実装 |
| A-6. 人事管理 | 4 | 1 | 従業員一覧・部署一覧表示のみ。作成・編集・削除全て非機能。勤怠サマリー未実装 |

## B. 操作品質: 1 / 15点

| 項目 | 配点 | 得点 | 備考 |
|------|------|------|------|
| B-1. CRUDフロー完走 | 5 | 0 | 全モジュールでCreate/Update/Deleteが非機能。Read(一覧表示)のみ部分的に動作可能 |
| B-2. エッジケース耐性 | 4 | 0.5 | 空データ表示は一部対応（「見つかりません」メッセージ）。不正ID処理なし（詳細ページ自体がない）。権限制御なし |
| B-3. エラーハンドリングUI | 3 | 0 | error.tsx未配置。loading.tsx未配置。トースト通知未実装（@radix-ui/react-toastはpackage.jsonに入っているが未使用） |
| B-4. バリデーション | 3 | 0.5 | HTMLのtype属性(email, number, date)のみ。required属性すら付いていない。サーバーサイドバリデーション未実装（Zodはpackage.jsonに入っているが未使用） |

## C. セキュリティ: 1 / 15点

| 項目 | 配点 | 得点 | 備考 |
|------|------|------|------|
| C-1. 認証チェック | 5 | 0 | 全APIルートに認証チェックなし。middlewareなし。全APIが未認証でアクセス可能 |
| C-2. 認可チェック | 4 | 0 | ロールチェック一切なし |
| C-3. 入力バリデーション | 3 | 0 | サーバーサイドバリデーション未実装。APIルートはrequest.json()の結果をそのままPrismaに渡している |
| C-4. 情報漏洩防止 | 3 | 1 | パスワード平文保存（TODOコメントで「本当はbcryptなどでハッシュ化」と記載）。.env.exampleなし。APIエラーメッセージは日本語の一般的な文言で情報漏洩は少ない |

## D. パフォーマンス: 3 / 10点

| 項目 | 配点 | 得点 | 備考 |
|------|------|------|------|
| D-1. N+1防止 | 3 | 2 | 一部のクエリでinclude/select使用（departments, expenses, projects, users）。ただしcustomers APIはリレーション取得なしのため評価対象外 |
| D-2. ページネーション | 3 | 0 | 全一覧APIでtake/skipなし。全件取得 |
| D-3. Server/Client分離 | 2 | 0 | 全ページが`'use client'`。データ取得をuseEffect + fetchで行っており、Server Componentの利点を全く活かしていない |
| D-4. バンドル・キャッシュ | 2 | 1 | 巨大な未使用依存(recharts, @tanstack/react-table等)がpackage.jsonにあるがimportされていないためtree-shakeされる。revalidation設定なし |

## E. 保守性・拡張性: 2 / 10点

| 項目 | 配点 | 得点 | 備考 |
|------|------|------|------|
| E-1. 型定義一元管理 | 3 | 0.5 | Prisma生成型を全く使わず各ページにinterface手書き。スキーマとの乖離リスク大。ただしPrismaスキーマ自体はenum定義が適切 |
| E-2. 共通コンポーネント | 3 | 1 | Button/Card/Input/DashboardLayout/Sidebarは共通化。しかしテーブル構造が各ページでコピペ。ステータスバッジも各ページで個別実装 |
| E-3. 定数・設定管理 | 2 | 0 | 定数ファイルなし。ステータスラベル（'計画中'等）が各ページのswitch文にハードコード。ナビゲーション項目はsidebar.tsxに定数化されている点は良い |
| E-4. 命名・構成一貫性 | 2 | 0.5 | ディレクトリ構成はNext.js App Routerの規約に沿っているが、ルートグループ未使用。命名は概ね一貫しているが、metadata.titleがデフォルトの「Create Next App」のまま |

## F. 自律的設計判断: 4 / 15点

| 項目 | 配点 | 得点 | 備考 |
|------|------|------|------|
| F-1. 状態管理 | 4 | 1 | 全ページ`'use client'` + useState + useEffectのSPA的パターン。Server Componentを全く活用していない。next-authをpackage.jsonに入れたがSessionProviderすら設定していない |
| F-2. DB設計 | 4 | 2 | Prismaスキーマは充実。全モデル・enum・リレーション・@@map定義が適切。Revenue/Budget/Attendanceモデルも含む。しかしシードデータ・マイグレーションが一切ない |
| F-3. UIライブラリ | 4 | 1 | package.jsonに多数のUI依存(@radix-ui/*, @tanstack/react-table, recharts等)を追加したが、実際に使用しているのはButton/Card/Inputの手書きコンポーネントのみ。依存関係の大半が死んでいる |
| F-4. アーキテクチャ | 3 | 0 | APIルートに認証なし、バリデーションなし。ダッシュボードAPIは実装したがUIと未接続。全体的にフロントエンドとバックエンドの接続が不完全 |

## G. セットアップ・DX: 1 / 10点

| 項目 | 配点 | 得点 | 備考 |
|------|------|------|------|
| G-1. ビルド・起動 | 4 | 1 | npm install成功（1点）。prisma migrate成功。シードファイルなし。**npm run buildが失敗**（Prisma include/select同時使用の型エラー）。起動不可 |
| G-2. README | 3 | 0 | create-next-appのデフォルトREADMEのまま。プロジェクト固有の情報なし |
| G-3. 環境・可読性 | 3 | 1 | .env.exampleなし。コードコメントは最小限。ディレクトリ構造は標準的で読みやすい |

## 合計: 18 / 100点

## 特筆すべき問題点

1. **【致命的】認証が完全に未実装** — next-auth, bcryptjs, @auth/prisma-adapterをpackage.jsonに追加しただけで、実際のコードは一切書かれていない
2. **【致命的】全フォームの送信が不可能** — 作成モーダルの「作成」ボタンにonClickハンドラがなく、入力値の収集・API呼び出しが一切行われない
3. **【致命的】商談(Deal)・タスク(Task)が完全未実装** — UIもAPIも存在しない
4. **【致命的】ダッシュボードが未実装** — トップページがcreate-next-appデフォルトのまま
5. **パスワード平文保存** — users APIのPOSTでパスワードをハッシュ化せずそのまま保存（bcryptjsはpackage.jsonにあるが未使用）
6. **Prismaクエリエラーの可能性** — users APIでincludeとselectを同時に使用しており、Prismaの仕様上エラーになる
7. **大量の未使用依存** — recharts, @tanstack/react-table, @radix-ui/react-dialog, @radix-ui/react-dropdown-menu, @radix-ui/react-select, @radix-ui/react-tabs, @radix-ui/react-toast, react-hook-form, @hookform/resolvers, zodがpackage.jsonに存在するが一切使用されていない
8. **handleApproveのAPIルート不在** — フロントエンドで`/api/expenses/${expenseId}/approve`を呼び出すコードがあるが、対応するAPIルートが存在しない

## 総評

Windsurf の BizBoard 実装は、プロジェクトの初期段階で大幅に止まっている。Prisma スキーマの設計は比較的充実しており（全モデル・enum・リレーション定義済み）、DB設計の理解度は示されている。しかし、そこから先の実装がほとんど完了していない。

具体的には: (1) 認証機能が完全に欠落、(2) 全フォームの送信ハンドラが未実装で CRUD の C/U/D が不可能、(3) 商談・タスクという主要機能が丸ごと欠落、(4) ダッシュボードUIが未実装（デフォルトテンプレートのまま）、(5) バリデーション・ページネーション・エラーハンドリングが一切ない。

package.json には多数の依存（next-auth, zod, react-hook-form, recharts, @radix-ui/*, @tanstack/react-table 等）が追加されているが、実際にインポート・使用されているものは極めて少なく、「依存を追加したが実装しなかった」状態である。全ページが `'use client'` で Server Component の利点を活かしておらず、Next.js App Router のアーキテクチャ的なメリットが失われている。

READMEがcreate-next-appデフォルト、.env.example なし、シードデータなし、マイグレーションなしで、開発者がプロジェクトをセットアップして動かすこと自体が困難である。業務アプリケーションとして最低限の機能を満たしているとは言えない。
