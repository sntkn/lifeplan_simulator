# コーディングガイドラインスキル

このスキルは、Lifeplan Simulator のコード変更時に参照する実装ガイドです。前提仕様は `docs/specification.md`、構成は `docs/architecture.md` を正とします。

## 実装前チェック

- `AGENTS.md`、`docs/specification.md`、`docs/architecture.md` を読み、変更対象の責務を確認する。
- 既存実装を `rg` で検索し、同じ型・ヘルパー・UI パターンがないか確認する。
- シミュレーション仕様の変更なら `SimulationParams`、`YearlyData`、`runMonteCarloSimulation`、`runHistoricalSimulation` の影響を確認する。
- 表示文言や入力項目の変更なら `InputPanel`、`ResultsTable`、チャート、AI アドバイザーの表示整合性を確認する。

## コードスタイル

- TypeScript + React の関数コンポーネントを基本にする。
- インデントは 2 spaces、セミコロンあり、文字列と import は single quote。
- コンポーネントとファイルは `PascalCase`、hooks は `useCamelCase`、ヘルパーは `camelCase`。
- props は明示的な interface/type を置く。
- 状態更新は既存の `useSimulation` と同じく `SimulationParams` を中心に扱う。
- CSS は Tailwind utility を優先し、既存のダークモード `dark:` パターンに合わせる。

## モジュール責務

- `src/components/`: UI とユーザー操作。計算ロジックを直接増やしすぎない。
- `src/hooks/`: 画面状態、シミュレーション実行、派生値。
- `src/utils/simulationEngine.ts`: モンテカルロ/ヒストリカルの計算、資産調整、統計処理。
- `src/services/`: AI アドバイザーなど外部連携やビジネスサービス。
- `src/types/`: 入出力型。仕様変更時はコメントも更新する。
- `src/historicalData.ts`: 年次データと選択肢。配列長と対象年範囲を崩さない。

## シミュレーション実装の注意点

- 金額はコード上では円単位で扱う。UI 表示や入力で万円表記にする場合は変換箇所を明確にする。
- 率は fraction で扱う。例: `0.1` は 10%。税率・手数料率も同じ表現にそろえる。
- `endAge - initialAge` がシミュレーション期間。開始年齢の初期値も結果に含まれる。
- 給与は `currentAge <= retirementAge` の間だけ計上される。
- ローンは `year - 1 < loanDuration` の間だけ支出に含まれる。
- 娯楽費の減少、医療・介護費の開始、インフレ反映は年齢境界のテストを追加する。
- 現金上限超過時は `cashOverflowPriority`、現金下限割れ時は `liquidationPriority` を使う。
- 資産下限、売却税率、NaN 防止の挙動を変更する場合は、既存テストを確認してから狭く修正する。

## UI 実装の注意点

- 入力値の単位をラベルや既存コンポーネントの表現と合わせる。
- 追加フィールドは `SimulationParams`、デフォルト値、フォーム、保存設定、テストをセットで更新する。
- チャートは Recharts の既存パターンを使い、空データ・大きな金額・ダークモードを確認する。
- モーダル、ボタン、フォームには既存テストで使われる role/name/label を意識してアクセシブルな名前を付ける。
- 画面文言を変える場合は Testing Library のクエリに影響するため、関連テストも更新する。

## データ更新

- `historicalData.ts` の対象年範囲を変更する場合は `HISTORICAL_DATA_LENGTH`、`MAX_START_YEARS`、ドキュメントの年範囲を同期する。
- すべての市場・インフレ・仮想通貨配列の長さをそろえる。
- 推定値を含める場合はコメントで明示する。
- ヒストリカル法は全期間で30通りの開始位置を循環利用する仕様に沿っているか確認する。

## 完了前チェック

- 変更範囲に応じて `npm run lint`、`npm run test`、`npm run build` を実行する。
- 仕様・用語・入力項目を変えた場合は `docs/` と README のリンク先を更新する。
- UI 変更ではスクリーンショットや手元確認の結果を PR に残す。
