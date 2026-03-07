# ライフプランシミュレーター

## 概要
年間の収入・支出・資産配分をもとに、将来の手元資金を複数のシミュレーション手法で可視化するアプリです。モンテカルロ法とヒストリカル法を備え、インフレや投資リターン、資産の取り崩しルールまで含めたライフプラン検討をサポートします。

## プロジェクトドキュメント

- [Feature Overview](docs/feature-overview.md)：提供機能とシミュレーション手法のハイライト
- [Functional Specification](docs/specification.md)：入力項目、運用ルール、表示仕様の詳細
- [Architecture Overview](docs/architecture.md)：技術スタックやモジュール構成、データフロー

これらのドキュメントは AI を含む開発者が実装・設計を行う際のベースラインです。変更があれば必ず同期してください。

## セットアップ

```bash
npm install
npm run dev
```

Vite の dev サーバーは `http://localhost:5173` で起動します。`npm run build` で本番ビルド、`npm run test` で Jest テストを実行できます。

## 技術スタック

React、TypeScript、Vite、Tailwind CSS、Recharts、Jest、Testing Library、ESLint。

## ライセンス

[MIT](LICENSE)
