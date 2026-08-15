---
name: lifeplan-agent-guide
description: "Lifeplan Simulator の作業開始時に読む目次と参照順を示すスキル。Codex がこのリポジトリで作業を始めるとき、設計・実装前に全体像を把握するとき、UI、シミュレーション、テスト、ヒストリカルデータ、AI アドバイザー、設定保存のどの資料やスキルを読むべきか判断するときに使う。"
---

# Lifeplan エージェント目次スキル

## 概要

コード、テスト、ドキュメントを変更する前に、Lifeplan Simulator の作業全体を把握するためのスキル。読む順の正本は `docs/agent-guide.md`。

## 必ず読むもの

最初に `docs/agent-guide.md` を読み、作業内容に応じてそこで示された参照先を読む。

最低限、次を確認する。

- `AGENTS.md`: リポジトリの作業ルール。
- `README.md`: セットアップとアプリの目的。
- `docs/feature-overview.md`: 機能範囲。
- `docs/specification.md`: 入力、計算、表示の仕様。
- `docs/architecture.md`: モジュール責務とデータフロー。

## スキルの使い分け

- 実装・リファクタリングでは `lifeplan-coding` を使う。
- UT、結合テスト、モック、カバレッジ確認では `lifeplan-testing` を使う。
- 用語、単位、ざっくり仕様、シミュレーション前提の確認では `lifeplan-domain` を使う。

## 作業ルール

- 挙動、入力、出力、設計を変えたら `docs/` も同期する。
- 実在の個人資産情報をドキュメント、fixture、テストに入れない。
- Vite、React、TypeScript、Tailwind、Vitest、Testing Library の既存スタイルに合わせる。
