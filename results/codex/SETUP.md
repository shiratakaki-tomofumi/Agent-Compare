# Codex (OpenAI) セットアップ手順

## 使い方

1. このフォルダの内容を作業ディレクトリにコピー
2. `design/` フォルダも同じディレクトリにコピー
3. Codex CLI を起動

```bash
cp -r results/codex/ /path/to/workspace/
cp -r design/ /path/to/workspace/design/
cd /path/to/workspace
codex
```

Codex が `AGENTS.md` を自動的に読み込みます。

## 構成ファイル

- `AGENTS.md` — プロジェクト指示ファイル（自動読み込み、最大32KiB）
