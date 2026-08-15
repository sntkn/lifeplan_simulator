# ライフプランシミュレーター

## 概要
年間の収入・支出・資産配分をもとに、将来の手元資金を複数のシミュレーション手法で可視化するアプリです。モンテカルロ法とヒストリカル法を備え、インフレや投資リターン、資産の取り崩しルールまで含めたライフプラン検討をサポートします。

## プロジェクトドキュメント

- [機能概要](docs/feature-overview.md)：提供機能とシミュレーション手法のハイライト
- [機能仕様](docs/specification.md)：入力項目、運用ルール、表示仕様の詳細
- [アーキテクチャ概要](docs/architecture.md)：技術スタックやモジュール構成、データフロー
- [エージェント作業目次](docs/agent-guide.md)：コーディングエージェント向けの読む順と作業別参照先
- [コーディングガイドラインスキル](docs/skills/coding-guidelines.md)：実装時に参照するガイドライン
- [テスティングガイドラインスキル](docs/skills/testing-guidelines.md)：UT 追加・修正時に参照するガイドライン
- [用語集とざっくり仕様](docs/skills/domain-glossary.md)：用語集とざっくり仕様

これらのドキュメントは AI を含む開発者が実装・設計を行う際のベースラインです。変更があれば必ず同期してください。

コーディングエージェント向けの自動参照スキルは `.agents/skills/` に配置しています。スキル本文は軽量な入口にし、詳細は上記 `docs/` を正本として参照します。

## セットアップ

```bash
npm install
npm run dev
```

Vite の dev サーバーは `http://localhost:5173` で起動します。`npm run build` で本番ビルド、`npm run test` で Vitest を実行できます。

## 技術スタック

React、TypeScript、Vite、Tailwind CSS、Recharts、Vitest、Testing Library、ESLint。

## ライセンス

[MIT](LICENSE)
