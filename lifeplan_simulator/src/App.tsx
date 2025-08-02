import { useState, useEffect } from 'react';
import './App.css';
import { AssetChart } from './components/charts/AssetChart';
import { AssetBreakdownChart } from './components/charts/AssetBreakdownChart';
import { ResultsTable } from './components/results/ResultsTable';
import { InputPanel } from './components/forms/InputPanel';
import { AIAdvisorPanel } from './components/ai/AIAdvisorPanel';
import { useSimulation } from './hooks/useSimulation';

/**
 * アプリケーションのメインコンポーネントです。
 */
function App() {
  // シミュレーション関連の状態とロジック
  const { params, setParams, simulationData, runSimulation, simulationPeriod } = useSimulation();

  /**
   * ダークモードの状態を管理する状態
   */
  const [dark, setDark] = useState(true);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);
  /**
   * ダークモードを切り替える関数
   */
  const toggleDarkMode = () => setDark(d => !d);

  return (
    <div className="bg-white dark:bg-gray-900 dark:text-gray-100 min-h-screen p-5 text-center flex flex-col items-center transition-colors">
      {/* ダークモード切り替えスイッチ */}
      <button
        onClick={toggleDarkMode}
        className="fixed top-4 right-4 px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow transition"
        aria-label="ダークモード切替"
      >
        {dark ? "ライトモード" : "ダークモード"}
      </button>
      <h1 className="text-3xl font-bold mb-5">老後資産推移モンテカルロシミュレーター</h1>
      <div className="flex w-full max-w-7xl gap-5">
        <InputPanel params={params} setParams={setParams} onSimulate={runSimulation} />
        <div className="flex-1 flex flex-col gap-5">
          {simulationData ? (
            <>
              <AssetChart data={simulationData} />
              <AssetBreakdownChart data={simulationData} />
              <ResultsTable data={simulationData} simulationPeriod={simulationPeriod} />
              <AIAdvisorPanel params={params} simulationData={simulationData} />
            </>
          ) : (
            <div className="w-full h-[500px] mb-5 flex items-center justify-center">
              <p>左のパネルで設定を入力し、「シミュレーション実行」ボタンを押してください。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;