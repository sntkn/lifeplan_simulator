---
name: lifeplan-testing
description: "Lifeplan Simulator の UT と結合テストの書き方を示すスキル。Codex が Vitest、Testing Library の UI テスト、シミュレーションエンジンテスト、ヒストリカルデータテスト、localStorage/設定保存テスト、AI アドバイザーテスト、モック、カバレッジ、テスト setup を追加・更新・調査・レビューするときに使う。"
---

# Lifeplan テスティングスキル

## 概要

Lifeplan Simulator のテスト作業で使うスキル。テストを追加・変更する前に `docs/skills/testing-guidelines.md` を読む。

## 必ず読むもの

- `docs/skills/testing-guidelines.md`: プロジェクト固有の UT ガイド。
- `src/tests/setup.ts`: jsdom、localStorage、alert、confirm、console、ResizeObserver の共通 mock。
- 近い既存の `src/tests/*.test.ts(x)`: fixture、render helper、クエリの書き方。

## 作業手順

1. 新しい書き方を作る前に、実装と近い既存テストを読む。
2. private な途中処理ではなく、利用者が観測できる表示・操作・計算結果を検証する。
3. UI では Testing Library の role、label、text クエリを優先する。
4. `Math.random` に期待値が依存する場合は stub して決定的にする。
5. 年齢範囲、税率、現金上下限、資産下限、ヒストリカルデータ期間の境界値をカバーする。
6. まず関連テストを実行し、共有挙動に影響する変更では広い検証も実行する。

## コマンド

```bash
npm run test
npm run test -- --watch
npm run test -- --coverage
npm run lint
npm run build
```

## プロジェクトルール

- UI テストは `*.test.tsx`、ロジックテストは `*.test.ts`。
- fixture の値は架空・匿名にする。
- 実 API 呼び出しに依存しない。
- 変更後の業務仕様をテストに反映したら、ドキュメントも更新する。
