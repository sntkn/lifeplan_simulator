---
name: lifeplan-coding
description: "Lifeplan Simulator の実装手順とコーディング規約を示すスキル。Codex が React コンポーネント、hooks、TypeScript 型、シミュレーションロジック、ヒストリカルデータ、AI アドバイザー、設定保存/localStorage、Tailwind UI、チャート、実装に関係するドキュメントを変更するときに使う。"
---

# Lifeplan コーディングスキル

## 概要

Lifeplan Simulator の実装作業で使うスキル。コードを編集する前に `docs/skills/coding-guidelines.md` を読む。

## 必ず読むもの

- `docs/skills/coding-guidelines.md`: 実装手順とプロジェクト固有の実装ルール。
- `docs/specification.md`: 入力、計算、表示の仕様。
- `docs/architecture.md`: モジュール責務とデータフロー。
- `src/types/simulation.ts`: パラメータと結果型の正本。

## 作業手順

1. 新しい構造を作る前に、`rg` で既存パターンを探す。
2. 変更範囲を責務のあるモジュールに絞る。UI は `src/components/`、状態管理は `src/hooks/`、シミュレーション計算は `src/utils/simulationEngine.ts`、AI 関連は `src/services/`、共通型は `src/types/`。
3. シミュレーション挙動を変えるときは、モンテカルロ法とヒストリカル法の両方を確認する。
4. 入力項目を変えるときは、デフォルト値、フォーム、設定保存、ドキュメント、テストをまとめて更新する。
5. 変更範囲に応じて検証する。広い変更では通常 `npm run lint`、`npm run test`、`npm run build` を実行する。

## プロジェクトルール

- インデントは 2 spaces、セミコロンあり、文字列は single quote。
- 率は小数で扱う。`0.1` は 10%。
- 内部の金額は、UI 変換が明示されていない限り円単位で扱う。
- ヒストリカルデータの配列は、年と長さを必ずそろえる。
- 実在の個人資産情報をコミットしない。
