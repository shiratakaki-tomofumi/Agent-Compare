# Antigravity セットアップ手順

## 使い方

1. このフォルダの内容を作業ディレクトリにコピー
2. `design/` フォルダも同じディレクトリにコピー
3. Antigravity を起動

```bash
cp -r results/antigravity/ /path/to/workspace/
cp -r design/ /path/to/workspace/design/
cd /path/to/workspace
antigravity
```

Antigravity が `AGENTS.md` と `.agent/skills/bizboard/SKILL.md` を自動的に読み込みます。

## 構成ファイル

- `AGENTS.md` — プロジェクト指示ファイル（AGENTS.md標準準拠、自動読み込み）
- `.agent/skills/bizboard/SKILL.md` — スキル定義（YAML フロントマター + Markdown）
