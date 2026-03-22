# Claude Code セットアップ手順

## 使い方

1. このフォルダの内容を作業ディレクトリにコピー
2. `design/` フォルダも同じディレクトリにコピー
3. Claude Code を起動

```bash
cp -r results/claude-code/ /path/to/workspace/
cp -r design/ /path/to/workspace/design/
cd /path/to/workspace
claude
```

Claude Code が `CLAUDE.md` を自動的に読み込み、設計書に基づいて実装を開始します。

## 構成ファイル

- `CLAUDE.md` — プロジェクト指示ファイル（自動読み込み）
