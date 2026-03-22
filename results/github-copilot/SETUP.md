# GitHub Copilot セットアップ手順

## 使い方

1. このフォルダの内容を作業ディレクトリにコピー
2. `design/` フォルダも同じディレクトリにコピー
3. VS Code / GitHub Codespaces で開き、Copilot Agent mode で実装指示を出す

```bash
cp -r results/github-copilot/ /path/to/workspace/
cp -r design/ /path/to/workspace/design/
```

Copilot が `.github/copilot-instructions.md` を自動的に読み込みます。
Agent mode で「設計書に基づいてBizBoardを実装してください」と指示。

## 構成ファイル

- `.github/copilot-instructions.md` — リポジトリ全体のカスタム指示（自動読み込み）
