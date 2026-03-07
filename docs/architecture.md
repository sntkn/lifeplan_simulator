# Architecture Overview

## 技術スタック

- React + TypeScript + Vite（`npm run dev/build/preview`）
- Tailwind CSS でレイアウトとテーマ（ダークモード対応）
- Recharts を用いたチャート描画
- ESLint + TypeScript ESLint で静的解析、Jest + Testing Library で UI/ロジック検証

## モジュール構成

- `src/components/`：フォーム、結果テーブル、チャート、AI アドバイザーなど UI セクションごとに分割
- `src/hooks/useSimulation.ts`：シミュレーション実行やパラメータ状態管理を担う
- `src/services/`：モンテカルロ/ヒストリカル計算や資産調整などビジネスロジック
- `src/utils/`：フォーマッタ、共通計算、乱数や配列ユーティリティ
- `src/types/`：シミュレーション結果・入力パラメータの型定義
- `src/tests/` と `__mocks__/`：Jest テストとモック実装
- `public/`：静的アセット、`dist/`：ビルド成果物

## データソース

- `src/historicalData.ts` に 1996-2025 の市場データ、インフレ率、仮想通貨リターンを集約
- ヒストリカル手法はこのデータを開始年ごとにスライスし、長期シナリオでは循環使用
- モンテカルロ手法はユーザー入力パラメータを利用して乱数を生成

## 状態・レンダリングフロー

1. `InputPanel` がユーザー入力を収集し、`useSimulation` に渡す
2. `runSimulation` が選択手法に応じて `services/` のロジックを呼び出し、年齢ごとの資産統計を生成
3. 生成データは `AssetChart`、`AssetBreakdownChart`、`ResultsTable`、`AIAdvisorPanel` に流れ、グラフとテーブルで可視化
4. ダークモードフラグは `App.tsx` で保持し、Tailwind の `dark:` プレフィックスでテーマを切り替える

## ストレージ

- 設定の保存/読み込みはブラウザストレージ（localStorage）を利用
- 保存データは AI 解析や画面共有前に匿名化する
