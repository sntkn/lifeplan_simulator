# デザイン文書

## 概要

現在の設定管理システムを歯車アイコンとモーダルポップアップベースのUIに変更します。これにより、ユーザーエクスペリエンスが向上し、より直感的な設定管理が可能になります。

## アーキテクチャ

### 現在の構造

- `InputPanel` コンポーネント内に `SettingsManager` が埋め込まれている
- 展開/折りたたみ式のインライン表示
- 「設定管理を開く」ボタンでトグル

### 新しい構造

- `InputPanel` の「シミュレーション設定」ヘッダー右端に歯車アイコンを配置
- `SettingsManager` をモーダルポップアップとして独立
- ポップアップは画面中央にオーバーレイ表示

## コンポーネントと インターフェース

### 1. SettingsIcon コンポーネント

**目的:** 歯車アイコンを表示し、クリックでポップアップを開く

**プロパティ:**

```typescript
interface SettingsIconProps {
  onClick: () => void;
}
```

**実装詳細:**

- SVG歯車アイコンまたはCSS歯車アイコンを使用
- ホバー効果（回転アニメーション）
- サイズ: 24x24px
- 色: グレー系（ダークモード対応）

### 2. SettingsModal コンポーネント

**目的:** 設定管理機能をモーダルポップアップで表示

**プロパティ:**

```typescript
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  params: SimulationParams;
  onLoadSetting: (params: SimulationParams) => void;
}
```

**実装詳細:**

- モーダルオーバーレイ（背景を暗くする）
- 中央配置のポップアップウィンドウ
- 閉じるボタン（×）
- ESCキー、背景クリックで閉じる
- レスポンシブデザイン

### 3. 更新された InputPanel

**変更点:**

- ヘッダー部分に歯車アイコンを追加
- `SettingsManager` の直接埋め込みを削除
- モーダル状態管理を追加

### 4. 更新された SettingsManager

**変更点:**

- モーダル内での表示に最適化
- 外側のコンテナスタイルを削除
- ポップアップ専用のレイアウト

## データモデル

### モーダル状態管理

```typescript
// InputPanel内で管理
const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
```

### 既存のデータモデル

- `SimulationParams`: 変更なし
- `SavedSetting`: 変更なし
- ローカルストレージ構造: 変更なし

## エラーハンドリング

### 1. ローカルストレージエラー

- 既存の try-catch 構造を維持
- エラー時のフォールバック表示

### 2. モーダル表示エラー

- ポップアップが正しく表示されない場合のフォールバック
- ブラウザ互換性の考慮

### 3. アイコン表示エラー

- SVGアイコンが読み込めない場合のテキストフォールバック
- CSS歯車アイコンのブラウザ互換性

## UI/UXデザイン

### 歯車アイコン

```css
/* 基本スタイル */
.settings-icon {
  width: 24px;
  height: 24px;
  cursor: pointer;
  transition: transform 0.2s ease;
  color: #6b7280; /* gray-500 */
}

/* ホバー効果 */
.settings-icon:hover {
  transform: rotate(90deg);
  color: #374151; /* gray-700 */
}

/* ダークモード */
.dark .settings-icon {
  color: #9ca3af; /* gray-400 */
}

.dark .settings-icon:hover {
  color: #d1d5db; /* gray-300 */
}
```

### モーダルレイアウト

```css
/* オーバーレイ */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

/* モーダルコンテンツ */
.modal-content {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 8px;
  padding: 24px;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
```

### レスポンシブデザイン

```css
/* モバイル対応 */
@media (max-width: 640px) {
  .modal-content {
    max-width: 90vw;
    max-height: 90vh;
    margin: 20px;
  }
}
```

## テスト戦略

### 1. ユニットテスト

- `SettingsIcon` コンポーネントのクリックイベント
- `SettingsModal` の開閉動作
- 既存の設定管理ロジック（変更なし）

### 2. インテグレーションテスト

- 歯車アイコンクリック → モーダル表示
- モーダル内での設定保存・読み込み
- モーダル閉じる動作（×ボタン、ESC、背景クリック）

### 3. E2Eテスト

- 設定保存 → モーダル閉じる → 再度開く → 設定確認
- レスポンシブデザインの動作確認
- ダークモード切り替え時の表示確認

### 4. アクセシビリティテスト

- キーボードナビゲーション
- スクリーンリーダー対応
- フォーカス管理

## 実装の考慮事項

### 1. パフォーマンス

- モーダルの遅延読み込み（必要に応じて）
- アニメーション最適化
- 不要な再レンダリング防止

### 2. ブラウザ互換性

- CSS Transform サポート
- SVG サポート
- モーダル表示の互換性

### 3. アクセシビリティ

- ARIA ラベル
- フォーカストラップ
- キーボードナビゲーション

### 4. 既存機能の保持

- 全ての設定管理機能を維持
- データ構造の変更なし
- 既存のローカルストレージとの互換性

## 段階的実装アプローチ

### フェーズ 1: 基本構造

1. `SettingsIcon` コンポーネント作成
2. `SettingsModal` コンポーネント作成
3. `InputPanel` の更新

### フェーズ 2: 機能統合

1. 既存の `SettingsManager` をモーダル用に調整
2. モーダル開閉ロジック実装
3. イベントハンドリング

### フェーズ 3: UI/UX改善

1. アニメーション追加
2. レスポンシブデザイン調整
3. アクセシビリティ改善

### フェーズ 4: テストと最適化

1. テスト実装
2. パフォーマンス最適化
3. ブラウザ互換性確認
