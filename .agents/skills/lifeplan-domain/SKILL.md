---
name: lifeplan-domain
description: "Lifeplan Simulator の用語、単位、ざっくり仕様、シミュレーション前提を示すスキル。Codex が金融用語、率、円/万円の単位、年齢境界、モンテカルロ法、ヒストリカル法、現金上下限、取り崩しルール、パーセンタイル出力、ユーザー向け仕様を解釈または変更するときに使う。"
---

# Lifeplan ドメインスキル

## 概要

Lifeplan Simulator の要件や金融シミュレーション用語を解釈するときに使うスキル。ドメイン概念に関係する挙動や文言を変える前に `docs/skills/domain-glossary.md` を読む。

## 必ず読むもの

- `docs/skills/domain-glossary.md`: 用語、単位、主要パラメータ、ざっくり計算フロー。
- `docs/specification.md`: 機能仕様の正本。
- `docs/feature-overview.md`: シミュレーション手法の概要。
- `src/types/simulation.ts`: フィールド名とコメントの正本。

## 重要ルール

- 内部の金額は、表示・入力変換が明示されていない限り円単位。
- 率は小数で扱う。`0.05` は 5%、`0.1` は 10%。
- シミュレーション期間は `endAge - initialAge`。出力には開始年齢のデータ点も含む。
- ヒストリカルデータは現在 1996-2025 年を対象とし、30 年超の期間では循環利用する。
- モンテカルロ法・ヒストリカル法の最大期間は 100 年。`endAge` の最大値は 120。
- 給与、医療・介護費、娯楽費減少は年齢境界に敏感なので、境界を確認する。

## 変更時の注意

- 用語、単位、入力項目、計算ルールを変えたら `docs/specification.md` と `docs/skills/domain-glossary.md` を更新する。
- ヒストリカルデータの範囲を変えたら `src/historicalData.ts`、テスト、ドキュメントをまとめて更新する。
- サンプル値は匿名・架空の値だけを使う。
