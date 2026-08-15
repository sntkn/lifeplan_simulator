# エージェント作業目次

このドキュメントは、コーディングエージェントが作業前に読む入口です。実装判断の正は `docs/` 配下の仕様書に置き、作業時の運用ルールは `docs/skills/` 配下のスキルを参照します。

## まず読む目次

1. `AGENTS.md`
   - リポジトリ全体の作業ルール、コマンド、命名規則、PR 方針を確認する。
2. `README.md`
   - アプリの目的、セットアップ、主要技術スタックを確認する。
3. `docs/feature-overview.md`
   - 提供機能、シミュレーション手法、特徴的な挙動を把握する。
4. `docs/specification.md`
   - 入力項目、収支ロジック、表示仕様、期間制約を確認する。
5. `docs/architecture.md`
   - モジュール構成、状態管理、データフロー、データソースを確認する。
6. `docs/skills/coding-guidelines.md`
   - 実装時の設計・編集・UI・データ更新ルールを確認する。
7. `docs/skills/testing-guidelines.md`
   - UT 追加・更新時の観点、モック、実行コマンドを確認する。
8. `docs/skills/domain-glossary.md`
   - 用語、単位、主要パラメータ、ざっくり仕様を確認する。

## 作業タイプ別の参照先

- UI 表示・フォーム変更: `docs/specification.md`、`docs/architecture.md`、`docs/skills/coding-guidelines.md`
- シミュレーションロジック変更: `docs/specification.md`、`docs/feature-overview.md`、`docs/skills/domain-glossary.md`
- ヒストリカルデータ更新: `src/historicalData.ts`、`docs/feature-overview.md`、`docs/skills/testing-guidelines.md`
- テスト追加・修正: `docs/skills/testing-guidelines.md`、既存の `src/tests/*.test.ts(x)`
- AI アドバイザー変更: `src/services/aiAdvisor.ts`、`src/components/ai/AIAdvisorPanel.tsx`、関連テスト
- 設定保存変更: `src/components/settings/`、`src/tests/settings-*.test.ts(x)`、localStorage 仕様

## スキル置き場

Codex が文脈に応じて参照できるプロジェクトスキルは `.agents/skills/` に置く。

- `.agents/skills/lifeplan-agent-guide/SKILL.md`
- `.agents/skills/lifeplan-coding/SKILL.md`
- `.agents/skills/lifeplan-testing/SKILL.md`
- `.agents/skills/lifeplan-domain/SKILL.md`

`SKILL.md` の本文は起動時に読む軽量な入口とし、詳細な内容は `docs/skills/` 側を正本にする。

## エージェントの作業原則

- 仕様変更を伴うコード変更では、対応する `docs/` も同期する。
- 金額の単位、率の表現、年齢境界は既存仕様と型定義を確認してから変更する。
- コア計算を触る場合は、モンテカルロ法とヒストリカル法の影響を両方確認する。
- ユーザーの個人資産情報を fixture やドキュメントに入れない。サンプル値は匿名・架空にする。
- 既存のテスト方針を尊重し、変更範囲に近い `src/tests/` のテストを先に読む。

## 追加すると有用なスキル候補

- `simulation-modeling-skill`: 金融計算、パーセンタイル、インフレ、取り崩し順序の変更時に使う専門スキル。
- `historical-data-update-skill`: 年次リターン、CPI、仮想通貨リターンの更新手順、出典記録、配列長検証をまとめるスキル。
- `ui-accessibility-skill`: フォーム、モーダル、チャート、ダークモードのアクセシビリティ確認スキル。
- `ai-advisor-skill`: OpenAI、Gemini、Ollama 向け設定、プロンプト、フォールバック、個人情報保護を扱うスキル。
- `release-check-skill`: `npm run lint`、`npm run test`、`npm run build`、スクリーンショット確認、PR 説明作成を束ねるスキル。
