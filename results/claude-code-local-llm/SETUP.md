# Claude Code + Local LLM (LM Studio) セットアップ手順

## 前提条件

- LM Studio 0.4.1 以上がインストール済み
- 推奨モデル: Qwen3 Coder 30B (Q4_K_M) 等（コンテキスト25K以上推奨）

## 使い方

1. LM Studio でモデルをロードし、サーバーを起動（デフォルト: `http://localhost:1234`）
2. このフォルダの内容を作業ディレクトリにコピー
3. `design/` フォルダも同じディレクトリにコピー
4. 環境変数を設定して Claude Code を起動

```bash
cp -r results/claude-code-local-llm/ /path/to/workspace/
cp -r design/ /path/to/workspace/design/
cd /path/to/workspace

# LM Studio の Anthropic互換エンドポイントに接続
export ANTHROPIC_BASE_URL="http://localhost:1234"
export ANTHROPIC_AUTH_TOKEN="lmstudio"

claude
```

## 構成ファイル

- `CLAUDE.md` — プロジェクト指示ファイル（Claude Code と同一）

## 注意

- LM Studio 側で Anthropic互換 API (`/v1/messages`) を有効にすること
- モデルの性能によって結果が大きく変わるため、使用モデル名とパラメータ数を記録すること
