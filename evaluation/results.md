# BizBoard — AIエージェント比較評価結果

評価日: 2026-03-25
評価方法: コードレビュー + 実行テスト（npm install → prisma migrate → seed → build → dev起動 → curl/APIテスト）

---

## 使用モデル一覧

| エージェント | 使用モデル | プラン |
|---|---|---|
| Claude Code | Claude Opus 4.6 (Anthropic) | サブスクリプション |
| Codex | GPT-5.4 (OpenAI) | — |
| Kiro | Claude Sonnet 4.5 (Auto) | 無料版 + $5課金 |
| Cursor | Auto（フロンティアモデル自動選択） | 無料版 (Hobby) |
| GitHub Copilot | GPT-4o (OpenAI) | 無料版 |
| Windsurf | SWE-1 Lite (Codeium/OpenAI) | 無料版 |
| Antigravity | Gemini 3.1 Pro (Google) | 無料版 |

---

## 総合ランキング

| 順位 | エージェント | モデル | スコア | 一言評価 |
|:----:|---|---|:-----:|---|
| 1 | Codex | GPT-5.4 | **88** | 全機能実装、フォーム正常動作、認証/認可/バリデーション一貫。最高完成度 |
| 2 | Kiro | Claude Sonnet 4.5 | **84** | 堅実な認証/バリデーション。売上グラフ・勤怠のみ欠落 |
| 3 | Cursor | Auto | **70** | 機能カバレッジ広いが@base-ui/react問題でブラウザフォーム全滅 |
| 4 | Claude Code | Claude Opus 4.6 | **67** | Cursorと同じフォーム問題。バックエンド品質は高い |
| 5 | Antigravity | Gemini 3.1 Pro | **32** | 一覧+新規作成のみ。詳細/編集/削除/商談/部署が全て未実装 |
| 6 | GitHub Copilot | GPT-4o | **28** | ビルド失敗。認証チェックなし、大量の未実装ページ |
| 7 | Windsurf | SWE-1 Lite | **18** | ビルド失敗。認証未実装、フォーム送信不可、パスワード平文保存 |

---

## スコア比較表

| 評価軸 | Codex | Kiro | Cursor | Claude Code | Antigravity | GitHub Copilot | Windsurf |
|--------|:-----:|:----:|:------:|:-----------:|:-----------:|:--------------:|:--------:|
| A. タスク完了率 (/25) | 23 | 20 | 16 | 14 | 7 | 8.5 | 5 |
| B. 操作品質 (/15) | 12 | 12 | 5 | 5 | 4 | 2 | 1 |
| C. セキュリティ (/15) | 13 | 12 | 13 | 13 | 4 | 3 | 1 |
| D. パフォーマンス (/10) | 9 | 9 | 9 | 9 | 4 | 4 | 3 |
| E. 保守性・拡張性 (/10) | 9 | 9 | 8 | 7 | 3 | 2.5 | 2 |
| F. 設計判断 (/15) | 13 | 13 | 10 | 10 | 5 | 6 | 4 |
| G. セットアップ・DX (/10) | 9 | 9 | 9 | 9 | 5 | 2 | 2 |
| **合計 (/100)** | **88** | **84** | **70** | **67** | **32** | **28** | **18** |

---

## 実行テスト結果

| エージェント | npm install | migrate | seed | build | 起動 | ログイン |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Codex | OK | db push | OK | OK | OK | OK |
| Kiro | OK | OK | OK | OK | OK | OK |
| Cursor | OK | OK | OK | OK | OK | OK (curl) |
| Claude Code | OK | OK | OK | OK | OK | API only |
| Antigravity | OK | OK | OK | OK | — | — |
| GitHub Copilot | OK | OK | OK | **失敗** | — | — |
| Windsurf | OK | OK | seed無し | **失敗** | — | — |

---

## 軸別ベスト

| 評価軸 | ベストエージェント | 理由 |
|--------|-------------------|------|
| A. タスク完了率 | Codex (23/25) | 全4モジュールのCRUD + ダッシュボード + 売上グラフ + 承認ワークフロー + 部署管理を網羅 |
| B. 操作品質 | Codex / Kiro (12/15) | CRUDフロー完走、error.tsx/loading.tsx配置、Zodバリデーション |
| C. セキュリティ | Codex / Cursor / Claude Code (13/15) | 全API/Server Actionで認証・認可・Zodバリデーション一貫 |
| D. パフォーマンス | Codex / Kiro / Cursor / Claude Code (9/10) | N+1防止、ページネーション、Server/Client分離が適切 |
| E. 保守性・拡張性 | Codex / Kiro (9/10) | 共通コンポーネント充実、定数管理一元化、any/ts-ignoreゼロ |
| F. 設計判断 | Codex / Kiro (13/15) | 適切な技術選定と活用、堅実なフォーム実装（@base-ui/react問題を回避）|
| G. セットアップ・DX | Codex / Kiro / Cursor / Claude Code (9/10) | ビルド全ステップ成功、README充実、.env.example完備 |

---

## 詳細評価

### 1. Codex — 88点

**モデル**: GPT-5.4 (OpenAI)

| 軸 | スコア | 特記事項 |
|----|--------|---------|
| A. タスク完了率 | 23/25 | 全モジュール完備。売上チャート・承認ワークフロー・収支サマリー・部署管理あり |
| B. 操作品質 | 12/15 | CRUDフロー完走。notFound()で404表示。error.tsx/loading.tsx配置 |
| C. セキュリティ | 13/15 | 全Server Actionに認証/認可/Zodバリデーション。error.tsxのerror.message露出が懸念 |
| D. パフォーマンス | 9/10 | N+1防止、ページネーション、Server/Client分離適切 |
| E. 保守性・拡張性 | 9/10 | 12+共通コンポーネント。any/ts-ignoreゼロ。forms.tsxの肥大化(1156行)が課題 |
| F. 設計判断 | 13/15 | react-hook-form + 標準HTML要素で互換性問題なし。UIライブラリなし(Tailwind直書き) |
| G. セットアップ・DX | 9/10 | ビルド全成功。README充実。db pushベース（マイグレーション履歴なし） |

**技術選定**: Server Actions / react-hook-form + zodResolver / Tailwind CSS直書き / Recharts

**強み**: 機能カバレッジ最広、フォーム確実動作、セキュリティ一貫、共通コンポーネント充実
**弱み**: error.tsxでエラー詳細露出、employeeクエリでpassword除外なし、コンポーネントファイル肥大化

---

### 2. Kiro — 84点

**モデル**: Claude Sonnet 4.5 (Auto) / 無料版+$5課金

| 軸 | スコア | 特記事項 |
|----|--------|---------|
| A. タスク完了率 | 20/25 | 売上グラフ・勤怠サマリーが未実装（-5点）。他は全機能完備 |
| B. 操作品質 | 12/15 | CRUDフロー完走。空データ表示・notFound()・トースト通知 |
| C. セキュリティ | 12/15 | requireAuth()/requireRole()一貫。経費一覧のuserIdフィルタが軽微な認可漏れ |
| D. パフォーマンス | 9/10 | N+1防止、ページネーション。SearchFilterのデバウンスなしが懸念 |
| E. 保守性・拡張性 | 9/10 | Pagination/SearchFilter/DeleteButton共通化。constants.ts充実。any/ts-ignoreゼロ |
| F. 設計判断 | 13/15 | shadcn/ui (Radix UI) + forwardRefで互換性問題なし。Recharts活用 |
| G. セットアップ・DX | 9/10 | ビルド全成功。README非常に充実（テストアカウント・権限表・ディレクトリ構成） |

**技術選定**: Server Actions / react-hook-form + zodResolver / shadcn/ui (Radix UI) / Recharts

**強み**: 認証/バリデーション堅実、README品質最高、shadcn/ui正しく活用、middleware認証
**弱み**: 売上グラフ・勤怠サマリー欠落、検索デバウンスなし、コメント皆無

---

### 3. Cursor — 70点

**モデル**: Auto（フロンティアモデル自動選択）/ 無料版

| 軸 | スコア | 特記事項 |
|----|--------|---------|
| A. タスク完了率 | 16/25 | 全モジュール実装済みだがフォーム不可で半減。部署管理・勤怠あり |
| B. 操作品質 | 5/15 | @base-ui/react問題でブラウザCRUD不可。API層は正常 |
| C. セキュリティ | 13/15 | 全APIでrequireAuth()+Zodバリデーション。認証チェック正常（401確認済み） |
| D. パフォーマンス | 9/10 | N+1防止、ページネーション、Server/Client分離適切 |
| E. 保守性・拡張性 | 8/10 | constants.ts充実。Paginationが3重複 |
| F. 設計判断 | 10/15 | @base-ui/react + react-hook-formの非互換を見落とし。月次売上グラフ未実装 |
| G. セットアップ・DX | 9/10 | ビルド全成功。README・.env.example完備 |

**技術選定**: REST API / react-hook-form + zodResolver / shadcn/ui v4 (@base-ui/react) / Recharts (Pie only)

**強み**: バックエンド品質高い、機能カバレッジ広い（部署・勤怠含む）、セキュリティ堅実
**弱み**: @base-ui/react Input問題でブラウザフォーム全滅、月次売上グラフ欠落

---

### 4. Claude Code — 67点

**モデル**: Claude Opus 4.6 (Anthropic)

| 軸 | スコア | 特記事項 |
|----|--------|---------|
| A. タスク完了率 | 14/25 | Cursorと同じフォーム問題で半減。部署ページ404、勤怠未確認 |
| B. 操作品質 | 5/15 | ブラウザCRUD不可。API層は正常（エッジケース耐性あり） |
| C. セキュリティ | 13/15 | 全APIで401/403確認済み。経費一覧の認可漏れあり |
| D. パフォーマンス | 9/10 | N+1防止、ページネーション、Server/Client分離適切 |
| E. 保守性・拡張性 | 7/10 | constants.ts充実だがPrisma生成型未活用。ページネーション3重複 |
| F. 設計判断 | 10/15 | @base-ui/react + react-hook-formの非互換が致命的 |
| G. セットアップ・DX | 9/10 | ビルド全成功。README・.env.example完備 |

**技術選定**: REST API / react-hook-form + zodResolver / shadcn/ui v4 (@base-ui/react) / Recharts (未使用)

**強み**: バックエンド設計・セキュリティ・パフォーマンスは実務レベル
**弱み**: @base-ui/react問題でフォーム全滅、部署ページ404、Prisma生成型未活用

---

### 5. Antigravity — 32点

**モデル**: Gemini 3.1 Pro (Google)

| 軸 | スコア | 特記事項 |
|----|--------|---------|
| A. タスク完了率 | 7/25 | 一覧+新規作成のみ。詳細/編集/削除UI・商談・部署・グラフ全て未実装 |
| B. 操作品質 | 4/15 | Create→一覧反映は動作。詳細リンク先が全て404 |
| C. セキュリティ | 4/15 | Server Actionに認証チェックほぼなし。createEmployeeで権限エスカレーション可能 |
| D. パフォーマンス | 4/10 | include使用あり。ページネーション未実装 |
| E. 保守性・拡張性 | 3/10 | 定数ファイルなし。テーブル構造コピペ |
| F. 設計判断 | 5/15 | DBスキーマは忠実だがシードデータ最小限。未使用依存多数 |
| G. セットアップ・DX | 5/10 | ビルド成功。READMEデフォルト、.env.exampleなし |

**技術選定**: Server Actions / useState + FormData / shadcn/ui v4 / Recharts (未使用)

**強み**: ビルド成功、DBスキーマ設計は忠実、Server/Client分離適切
**弱み**: 要件カバー率約3割、認証/認可欠如、部署IDを生UUID手入力

---

### 6. GitHub Copilot — 28点

**モデル**: GPT-4o (OpenAI) / 無料版

| 軸 | スコア | 特記事項 |
|----|--------|---------|
| A. タスク完了率 | 8.5/25 | 顧客CRUD程度。商談詳細・案件CRUD・タスク・経費申請・従業員CRUDが未実装 |
| B. 操作品質 | 2/15 | SessionProvider未接続でAppShell表示崩壊。error.tsx/loading.tsxなし |
| C. セキュリティ | 3/15 | 全APIルートに認証チェックなし。`as any`多用(15箇所+) |
| D. パフォーマンス | 4/10 | 案件一覧にN+1あり。API側のみページネーション |
| E. 保守性・拡張性 | 2.5/10 | `as any`多用、定数ハードコード、テーブル構造コピペ |
| F. 設計判断 | 6/15 | Revenueモデル欠落でダッシュボードクラッシュ。未使用依存多数 |
| G. セットアップ・DX | 2/10 | **ビルド失敗**（route.tsのexportエラー）。READMEデフォルト、.env.exampleなし |

**技術選定**: REST API + Server Component混在 / useState + FormData / Tailwind CSS直書き / Recharts (未使用)

**強み**: Prismaスキーマは概ね妥当、顧客CRUDは一通り存在
**弱み**: ビルド失敗、ダッシュボードクラッシュ、認証/認可/バリデーション皆無、`as any`多用

---

### 7. Windsurf — 18点

**モデル**: SWE-1 Lite (Codeium/OpenAI) / 無料版

| 軸 | スコア | 特記事項 |
|----|--------|---------|
| A. タスク完了率 | 5/25 | 一覧表示のみ。フォーム送信・商談・タスクが完全未実装 |
| B. 操作品質 | 1/15 | 全ボタンにonClickなし。CRUDのC/U/Dが不可能 |
| C. セキュリティ | 1/15 | 認証完全未実装。パスワード平文保存（TODO記載のみ） |
| D. パフォーマンス | 3/10 | 全ページ`use client`。Server Component未活用 |
| E. 保守性・拡張性 | 2/10 | 手書きinterface多数、定数ファイルなし |
| F. 設計判断 | 4/15 | 11+の未使用依存。全ページSPA的パターン |
| G. セットアップ・DX | 2/10 | **ビルド失敗**（Prisma include/select同時使用エラー）。シードなし、READMEデフォルト |

**技術選定**: REST API / useState + useEffect (SPA) / Tailwind CSS直書き / 未使用依存多数

**強み**: Prismaスキーマ設計は充実（全モデル・enum・リレーション定義済み）
**弱み**: ビルド失敗、認証未実装、全フォーム非機能、パスワード平文保存、シードなし

---

## 総合分析

### 明暗を分けた3つの要因

#### 1. フォーム実装の選択（最大の差別化要因）

上位2エージェント（Codex・Kiro）は **react-hook-form + 標準HTML要素 / Radix UI forwardRef** を選択し、フォームが正常動作した。一方、Cursor・Claude Codeは **shadcn/ui v4 (@base-ui/react)** を選択し、Inputコンポーネントがreact-hook-formの`register()`のrefを転送できず、ブラウザからの全フォーム操作が不可能になった。

この1つの技術選択の差が、操作品質（B軸）で7点の差を生み、総合スコアに約20点の影響を与えた。

#### 2. 実装の完成度（スコープ管理）

Codex・Kiro・Cursorは全モジュール（営業・案件・財務・人事）のCRUDを一通り実装した。Antigravity・GitHub Copilot・Windsurfは一覧画面で止まり、詳細・編集・削除のUIが存在しない。設計書が「中途半端より完全」を求めていた通り、実装範囲の広さがスコアに直結した。

#### 3. ビルドの成否

GitHub CopilotとWindsurfはnpm run buildが失敗し、アプリケーションとして起動すらできなかった。「成果物がそのまま動く」という要件を最低限満たせていない。自己検証（ビルドエラーの確認）を行わなかった可能性が高い。

### モデル性能との相関

| ティア | エージェント | モデル | スコア |
|---|---|---|---|
| 上位 | Codex | GPT-5.4 | 88 |
| 上位 | Kiro | Claude Sonnet 4.5 | 84 |
| 中位 | Cursor | Auto (非公開) | 70 |
| 中位 | Claude Code | Claude Opus 4.6 | 67 |
| 下位 | Antigravity | Gemini 3.1 Pro | 32 |
| 下位 | GitHub Copilot | GPT-4o | 28 |
| 下位 | Windsurf | SWE-1 Lite | 18 |

最新の大規模モデル（GPT-5.4, Claude Sonnet 4.5）を使用したエージェントが上位を占めたが、**モデル単体の性能だけでなく、エージェントのツール実装（自己検証、ビルド確認、ライブラリ互換性チェック）が結果を大きく左右した**。Claude Opus 4.6はモデル性能では最上位クラスだが、@base-ui/react の互換性問題を検出できずスコアが伸び悩んだ。

### 共通して良かった点

- 全エージェントがNext.js App Router + Prisma + NextAuth構成を選択（技術スタック指定に従った）
- Prismaスキーマ設計は全エージェントで概ね妥当（enum活用、リレーション定義）
- Server/Client Component分離の概念は上位4エージェントで正しく実装

### 共通して課題だった点

- コード内コメントが全エージェントでほぼ皆無
- XSS入力（`<script>`タグ）がDBにそのまま保存される（Reactの自動エスケープに依存）
- 従業員クエリでpasswordフィールドを明示的に除外していないエージェントが多い
- 削除戦略（論理削除/物理削除）の一貫性が欠ける実装が多い

---

*各エージェントの詳細評価は `evaluation/{agent-name}.md` を参照。*
