# ClawProwl 日本語版

AIエージェント同士の協働を、リアルタイムの「AI社員オフィス」として見える化する管理フロントエンドです。20名の日本語名を持つAI社員がデスクや会議室を行き来し、仕事・会話・ツール実行・エラーなどの状態を2D／3Dで表示します。

本リポジトリは [clawprowl/clawprowl](https://github.com/clawprowl/clawprowl) を日本向けにローカライズしたフォークです。

## 日本語版の特徴

- UI、設定、管理画面、通知、モック応答を日本語化
- 桜井さくら、佐藤 蓮、鈴木 葵など20名の日本語デモ社員
- 日本のアニメキャラクター風に刷新したSVGアイコン
- 2Dフロアと3Dオフィスの両方に対応
- デスク、会議室、社員間の連携線、発話、ツール実行をリアルタイム表示
- Gateway不要で試せるオフラインデモ
- 日本語漏れ、旧デモ名、文字化けを検出する自動チェック

## まずオフラインデモを試す

必要なものは Node.js 22以上と pnpm です。

```bash
pnpm install
pnpm demo
```

ブラウザで `http://localhost:5180` を開いてください。Gatewayを用意しなくても、20名のAI社員が動く2D／3Dオフィス、チャット、管理画面を確認できます。

## 実際のGatewayへ接続する

このアプリはClawProwl Gatewayのフロントエンドです。Gateway自体の起動や管理は行いません。

`.env.local` を作成します。

```dotenv
VITE_GATEWAY_URL=ws://localhost:18789
VITE_GATEWAY_TOKEN=ここにGatewayトークン
```

開発サーバーを起動します。

```bash
pnpm dev
```

Gateway 2026.2.15以降でローカル開発する場合は、デバイス認証の設定が必要です。

```bash
clawprowl config set gateway.controlUi.dangerouslyDisableDeviceAuth true
clawprowl gateway run
```

この設定はローカル開発向けです。本番環境ではリバースプロキシなどの安全な認証方式を利用してください。

## 主な画面

### AI社員オフィス

- 2D：SVG製のフロア、デスク、会議室、家具、移動アニメーション
- 3D：React Three Fiber製の立体オフィス、社員、スキル表示、出現エフェクト
- 状態表示：待機中、作業中、会話中、ツール実行中、エラー
- 分析パネル：トークン、コスト、活動ヒートマップ、社員関係、イベント履歴

### 管理コンソール

ダッシュボード、AI社員、チャンネル、スキル、定期タスク、プロバイダー、Gateway、外観などを日本語で管理できます。

## 開発コマンド

| コマンド | 内容 |
| --- | --- |
| `pnpm demo` | Gateway不要の日本語オフラインデモ |
| `pnpm dev` | 実Gateway向け開発サーバー |
| `pnpm build` | 本番ビルド |
| `pnpm test` | テスト実行 |
| `pnpm typecheck` | TypeScript型検査 |
| `pnpm lint` | 静的解析 |
| `pnpm format` | ソースコード整形 |
| `pnpm check:ja` | 日本語漏れ・旧デモ名・文字化け検査 |
| `pnpm check` | 静的解析、整形、日本語検査をまとめて実行 |

## 技術構成

- React 19 / TypeScript / Vite 6
- React Three Fiber / Drei
- Zustand / Immer
- Tailwind CSS 4
- i18next
- Recharts
- WebSocket

## ライセンス

[MIT](./LICENSE)
