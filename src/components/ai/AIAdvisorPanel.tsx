import { useState } from 'react';
import type { SimulationParams, YearlyData } from '../../types/simulation';
import { AIAdvisorService, getDefaultAIConfig, saveAIConfig, type AIConfig, type AIAdvice } from '../../services/aiAdvisor';

interface AIAdvisorPanelProps {
  params: SimulationParams;
  simulationData: YearlyData[] | null;
}

/**
 * AIアドバイザーパネルコンポーネント
 */
export const AIAdvisorPanel = ({ params, simulationData }: AIAdvisorPanelProps) => {
  const [advice, setAdvice] = useState<AIAdvice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<AIConfig>(getDefaultAIConfig());
  const [showSettings, setShowSettings] = useState(false);

  /**
   * AIアドバイスを生成
   */
  const generateAdvice = async () => {
    if (!simulationData) return;

    setLoading(true);
    setError(null);

    try {
      const advisor = new AIAdvisorService(config);
      const result = await advisor.generateAdvice(params, simulationData);
      setAdvice(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AIアドバイスの生成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  /**
   * AI設定を更新
   */
  const updateConfig = (newConfig: Partial<AIConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    saveAIConfig(updatedConfig);
  };

  /**
   * 信頼度に基づく色を取得
   */
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 dark:text-green-400';
    if (confidence >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">🤖 AIライフプランアドバイザー</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            設定
          </button>
          <button
            onClick={generateAdvice}
            disabled={!simulationData || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '分析中...' : 'アドバイス生成'}
          </button>
        </div>
      </div>

      {/* AI設定パネル */}
      {showSettings && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded">
          <h3 className="font-bold mb-3">AI設定</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">AIプロバイダー</label>
              <select
                value={config.provider}
                onChange={(e) => updateConfig({ provider: e.target.value as AIConfig['provider'] })}
                className="w-full p-2 border rounded dark:bg-gray-600 dark:border-gray-500"
              >
                <option value="ollama">Ollama (無料・ローカル)</option>
                <option value="openai">OpenAI (制限付き無料)</option>
                <option value="gemini">Google Gemini (制限付き無料)</option>
                <option value="local">ローカルモデル (実験的)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">モデル</label>
              <input
                type="text"
                value={config.model}
                onChange={(e) => updateConfig({ model: e.target.value })}
                placeholder={config.provider === 'ollama' ? 'llama3' : 'gpt-3.5-turbo'}
                className="w-full p-2 border rounded dark:bg-gray-600 dark:border-gray-500"
              />
            </div>

            {config.provider === 'ollama' && (
              <div>
                <label className="block text-sm font-medium mb-1">エンドポイント</label>
                <input
                  type="text"
                  value={config.endpoint || ''}
                  onChange={(e) => updateConfig({ endpoint: e.target.value })}
                  placeholder="http://localhost:11434"
                  className="w-full p-2 border rounded dark:bg-gray-600 dark:border-gray-500"
                />
              </div>
            )}

            {(config.provider === 'openai' || config.provider === 'gemini') && (
              <div>
                <label className="block text-sm font-medium mb-1">APIキー</label>
                <input
                  type="password"
                  value={config.apiKey || ''}
                  onChange={(e) => updateConfig({ apiKey: e.target.value })}
                  placeholder="APIキーを入力"
                  className="w-full p-2 border rounded dark:bg-gray-600 dark:border-gray-500"
                />
              </div>
            )}
          </div>

          {/* プロバイダー別の説明 */}
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            {config.provider === 'ollama' && (
              <div>
                <p>💡 Ollamaを使用するには、事前にインストールが必要です。</p>
                <p>インストール: <code>curl -fsSL https://ollama.com/install.sh | sh</code></p>
                <p>モデルダウンロード: <code>ollama pull llama3</code></p>
                <p className="text-xs mt-1">※ llama3.2:3bやgemma2:2bなど軽量モデルも利用可能</p>
              </div>
            )}
            {config.provider === 'openai' && (
              <p>💡 OpenAI APIキーが必要です。新規ユーザーには$5のクレジットが提供されます。</p>
            )}
            {config.provider === 'gemini' && (
              <p>💡 Google AI StudioでAPIキーを取得してください。月15リクエスト/分まで無料です。</p>
            )}
          </div>
        </div>
      )}

      {/* エラー表示 */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded">
          ❌ {error}
        </div>
      )}

      {/* ローディング表示 */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">AIがシミュレーション結果を分析中...</p>
        </div>
      )}

      {/* アドバイス表示 */}
      {advice && !loading && (
        <div className="space-y-4">
          {/* 信頼度表示 */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">分析信頼度:</span>
            <span className={`font-bold ${getConfidenceColor(advice.confidence)}`}>
              {Math.round(advice.confidence * 100)}%
            </span>
          </div>

          {/* 総合評価 */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded">
            <h3 className="font-bold text-blue-800 dark:text-blue-200 mb-2">📊 総合評価</h3>
            <p className="text-blue-700 dark:text-blue-300">{advice.summary}</p>
          </div>

          {/* リスク分析 */}
          <div className="p-4 bg-red-50 dark:bg-red-900 rounded">
            <h3 className="font-bold text-red-800 dark:text-red-200 mb-2">⚠️ 潜在的リスク</h3>
            <ul className="space-y-1">
              {advice.risks.map((risk, index) => (
                <li key={index} className="text-red-700 dark:text-red-300">• {risk}</li>
              ))}
            </ul>
          </div>

          {/* 推奨事項 */}
          <div className="p-4 bg-green-50 dark:bg-green-900 rounded">
            <h3 className="font-bold text-green-800 dark:text-green-200 mb-2">✅ 推奨事項</h3>
            <ul className="space-y-1">
              {advice.recommendations.map((rec, index) => (
                <li key={index} className="text-green-700 dark:text-green-300">• {rec}</li>
              ))}
            </ul>
          </div>

          {/* 最適化案 */}
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded">
            <h3 className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">🔧 最適化案</h3>
            <ul className="space-y-1">
              {advice.optimizations.map((opt, index) => (
                <li key={index} className="text-yellow-700 dark:text-yellow-300">• {opt}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 初期状態のメッセージ */}
      {!advice && !loading && !error && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>シミュレーション実行後、「アドバイス生成」ボタンを押してください。</p>
          <p className="text-sm mt-2">AIがあなたのライフプランを分析し、具体的なアドバイスを提供します。</p>
        </div>
      )}
    </div>
  );
};