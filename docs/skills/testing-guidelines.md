# テスティングガイドラインスキル

このスキルは、Vitest と Testing Library で UT を書くときに参照するガイドです。

## 基本方針

- テストは `src/tests/` に置き、UI は `*.test.tsx`、ロジックは `*.test.ts` を使う。
- 既存テストの fixture、render helper、mock パターンを優先して流用する。
- 実装詳細ではなく、ユーザーが観測できる表示・操作・計算結果を検証する。
- コア計算を変更したら、モンテカルロ法とヒストリカル法の代表ケースを両方確認する。
- 個人の金融情報をテストデータに入れない。架空の丸めた値を使う。

## 実行コマンド

```bash
npm run test
npm run test -- --watch
npm run test -- --coverage
npm run lint
npm run build
```

変更範囲が小さい場合でも、最後は少なくとも関連テストを実行する。型やビルドに影響する変更では `npm run build` も実行する。

## UI テスト

- Testing Library の `screen.getByRole`、`getByLabelText`、`getByText` を優先する。
- ユーザー操作は `@testing-library/user-event` を使う。
- ボタン、入力、モーダル、設定保存は、開く・変更する・保存する・閉じる・エラー表示まで確認する。
- チャートは Recharts の DOM 実装に依存しすぎず、タイトル、コンテナ、空データ、大きな値の表示を検証する。
- `src/tests/setup.ts` で localStorage、alert、confirm、console、ResizeObserver が mock されている前提を使える。

## シミュレーションロジックのテスト

- `SimulationParams` のデフォルトに近い fixture を用意し、変更点だけ上書きする。
- 乱数を含む挙動は `Math.random` を stub して決定的にする。
- 境界値を優先する。
  - `initialAge` と `endAge` が同じ
  - `endAge` が最大 120 歳
  - ヒストリカル期間が 30 年ちょうど、30 年超、100 年超
  - 税率が `0`、有効な小数、負値、`1` 以上
  - 現金が上限超過、下限割れ、投資資産が下限割れ
- パーセンタイルは入力配列を明示し、期待する `p10/p25/median/p75/p90` を検証する。

## ヒストリカルデータのテスト

- 年数、開始年、終了年、各配列の長さを検証する。
- `getStockData`、`getInflationData` の各選択肢と default fallback を検証する。
- 30 年超の循環利用と、100 年上限のバリデーションを確認する。
- 年次データを更新したら `docs/feature-overview.md` と `docs/specification.md` の年範囲も確認する。

## AI アドバイザーのテスト

- provider ごとに request shape と fallback を検証する。
- API key や endpoint は dummy 値を使い、実ネットワークに依存しない。
- localStorage の保存・読み込みは setup mock を使って検証する。
- プロンプト生成ではシミュレーション手法、地域、主要パラメータが含まれることを確認する。

## テスト追加時のレビュー観点

- そのテストは失敗したときに何が壊れたか分かる名前になっているか。
- 実装の private な途中経過に寄りすぎていないか。
- 乱数・時刻・localStorage・confirm などの外部状態を制御しているか。
- 仕様変更に対してドキュメント更新が必要ないか。
