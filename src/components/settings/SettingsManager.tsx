import { useState, useEffect } from 'react';
import type { SimulationParams, SavedSetting } from '../../types/simulation';

// --- Settings Management Logic ---
const SETTINGS_STORAGE_KEY = 'lifeplan-simulator-settings';

/**
 * ローカルストレージから保存された設定を取得します
 */
const getSavedSettings = (): SavedSetting[] => {
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('設定の読み込みに失敗しました:', error);
    return [];
  }
};

/**
 * 設定をローカルストレージに保存します
 */
const saveSettings = (settings: SavedSetting[]): void => {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('設定の保存に失敗しました:', error);
  }
};

/**
 * 新しい設定を保存します
 */
const saveSetting = (name: string, params: SimulationParams): void => {
  const settings = getSavedSettings();
  const newSetting: SavedSetting = {
    name,
    params,
    createdAt: new Date().toISOString(),
  };

  // 同じ名前の設定があれば上書き
  const existingIndex = settings.findIndex(s => s.name === name);
  if (existingIndex >= 0) {
    settings[existingIndex] = newSetting;
  } else {
    settings.push(newSetting);
  }

  saveSettings(settings);
};

/**
 * 設定を削除します
 */
const deleteSetting = (name: string): void => {
  const settings = getSavedSettings();
  const filteredSettings = settings.filter(s => s.name !== name);
  saveSettings(filteredSettings);
};

// --- Component ---
interface SettingsManagerProps {
  params: SimulationParams;
  onLoadSetting: (params: SimulationParams) => void;
}

/**
 * 設定の保存・読み込み・削除を管理するコンポーネント（モーダル用に最適化）
 */
export const SettingsManager = ({ params, onLoadSetting }: SettingsManagerProps) => {
  /**
   * 保存された設定一覧の状態
   */
  const [savedSettings, setSavedSettings] = useState<SavedSetting[]>([]);

  /**
   * 設定保存用の名前入力の状態
   */
  const [saveSettingName, setSaveSettingName] = useState('');

  /**
   * コンポーネント初期化時に保存された設定を読み込み
   */
  useEffect(() => {
    setSavedSettings(getSavedSettings());
  }, []);

  /**
   * 設定を保存します
   */
  const handleSaveSetting = () => {
    if (!saveSettingName.trim()) {
      alert('設定名を入力してください');
      return;
    }

    saveSetting(saveSettingName.trim(), params);
    setSavedSettings(getSavedSettings());
    setSaveSettingName('');
    alert('設定を保存しました');
  };

  /**
   * 設定を読み込みます
   */
  const handleLoadSetting = (setting: SavedSetting) => {
    onLoadSetting(setting.params);
    alert(`設定「${setting.name}」を読み込みました`);
  };

  /**
   * 設定を削除します
   */
  const handleDeleteSetting = (name: string) => {
    if (confirm(`設定「${name}」を削除しますか？`)) {
      deleteSetting(name);
      setSavedSettings(getSavedSettings());
      alert('設定を削除しました');
    }
  };

  return (
    <div className="space-y-4">
      {/* 設定保存 */}
      <div>
        <label className="block mb-2 text-sm font-bold text-gray-900 dark:text-gray-100">現在の設定を保存</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={saveSettingName}
            onChange={e => setSaveSettingName(e.target.value)}
            placeholder="設定名を入力"
            className="flex-1 p-2 text-sm border rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={handleSaveSetting}
            className="px-4 py-2 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            保存
          </button>
        </div>
      </div>

      {/* 保存された設定一覧 */}
      <div>
        <label className="block mb-2 text-sm font-bold text-gray-900 dark:text-gray-100">保存された設定</label>
        {savedSettings.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">保存された設定はありません</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {savedSettings.map((setting) => (
              <div key={setting.name} className="flex items-center gap-2 p-3 border rounded-md border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">{setting.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(setting.createdAt).toLocaleDateString('ja-JP')}
                  </div>
                </div>
                <button
                  onClick={() => handleLoadSetting(setting)}
                  className="px-3 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  読込
                </button>
                <button
                  onClick={() => handleDeleteSetting(setting.name)}
                  className="px-3 py-1 text-xs bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  削除
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};