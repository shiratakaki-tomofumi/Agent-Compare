# Kiro (AWS) セットアップ手順

## 使い方

1. このフォルダの内容を作業ディレクトリにコピー
2. `design/` フォルダも同じディレクトリにコピー
3. Kiro でフォルダを開き、実装指示を出す

```bash
cp -r results/kiro/ /path/to/workspace/
cp -r design/ /path/to/workspace/design/
```

Kiro が `.kiro/steering/bizboard.md` を自動的に読み込みます（`inclusion: always`）。

## 構成ファイル

- `.kiro/steering/bizboard.md` — ステアリングファイル（YAML フロントマター + Markdown）
