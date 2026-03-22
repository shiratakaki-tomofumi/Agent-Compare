# Cursor セットアップ手順

## 使い方

1. このフォルダの内容を作業ディレクトリにコピー
2. `design/` フォルダも同じディレクトリにコピー
3. Cursor でフォルダを開き、Agent mode で実装指示を出す

```bash
cp -r results/cursor/ /path/to/workspace/
cp -r design/ /path/to/workspace/design/
```

Cursor が `.cursor/rules/bizboard.mdc` を自動的に読み込みます。
Agent mode (Cmd+I → Agent) で「設計書に基づいてBizBoardを実装してください」と指示。

## 構成ファイル

- `.cursor/rules/bizboard.mdc` — プロジェクトルール（MDC形式、alwaysApply: true）
