# Cline セットアップ手順

## 使い方

1. このフォルダの内容を作業ディレクトリにコピー
2. `design/` フォルダも同じディレクトリにコピー
3. VS Code で開き、Cline 拡張でタスクを開始

```bash
cp -r results/cline/ /path/to/workspace/
cp -r design/ /path/to/workspace/design/
```

Cline が `.clinerules/bizboard.md` を自動的に読み込みます。

## 構成ファイル

- `.clinerules/bizboard.md` — プロジェクトルール（Markdown、フロントマターなし = 常時適用）
