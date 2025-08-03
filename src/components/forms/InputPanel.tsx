import { stockOptions, inflationOptions, type InflationRegion, type StockRegion } from '../../historicalData';
import type { SimulationParams } from '../../types/simulation';
import { SettingsManager } from '../settings/SettingsManager';

interface InputPanelProps {
  params: SimulationParams;
  setParams: (params: SimulationParams) => void;
  onSimulate: () => void;
}

/**
 * シミュレーション設定の入力パネルコンポーネントです。
 */
export const InputPanel = ({ params, setParams, onSimulate }: InputPanelProps) => {
  /**
   * 万円単位を円単位に変換するための定数
   */
  const JPY_UNIT = 10000;

  /**
   * 万円単位の入力値を円単位に変換して状態を更新します。
   * @param field 更新するパラメータのフィールド名
   * @param value 入力値
   */
  const handleManYenChange = (field: keyof SimulationParams, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setParams({ ...params, [field]: numValue * JPY_UNIT });
    }
  };

  /**
   * 入力値を数値に変換して状態を更新します。
   * @param field 更新するパラメータのフィールド名
   * @param value 入力値
   */
  const handleChange = (field: keyof SimulationParams, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      // 終了年齢の場合は範囲チェック
      if (field === 'endAge') {
        const maxAge = 120; // 全ての方法で120歳まで対応
        const clampedValue = Math.min(Math.max(numValue, params.initialAge + 1), maxAge);
        setParams({ ...params, [field]: clampedValue });
      } else if (field === 'initialAge') {
        // 初期年齢が変更された場合、終了年齢も調整
        const newParams = { ...params, [field]: numValue };
        const maxAge = 120;
        if (newParams.endAge <= numValue || newParams.endAge > maxAge) {
          newParams.endAge = Math.min(numValue + 1, maxAge);
        }
        setParams(newParams);
      } else {
        setParams({ ...params, [field]: numValue });
      }
    }
  };

  return (
    <div className="w-[300px] p-5 border rounded-lg" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
      <h2 className="text-lg font-bold mt-0 mb-4">シミュレーション設定</h2>

      {/* 設定管理パネル */}
      <SettingsManager params={params} onLoadSetting={setParams} />

      <div className="mb-5">
        <h3 className="text-base font-bold mb-3">シミュレーション方法</h3>
        <label className="block mb-1 font-bold">シミュレーション方法</label>
        <select
          value={params.simulationMethod}
          onChange={e => {
            const newMethod = e.target.value as 'montecarlo' | 'historical';
            setParams({ ...params, simulationMethod: newMethod });
          }}
          className="w-full p-2 border rounded box-border mb-3"
        >
          <option value="montecarlo">モンテカルロ法</option>
          <option value="historical">ヒストリカル法（過去データ）</option>
        </select>

        {params.simulationMethod === 'montecarlo' && (
          <>
            <div className="p-3 bg-green-50 dark:bg-green-900 rounded text-sm mb-3">
              <p className="font-bold mb-2">モンテカルロ法について：</p>
              <p>• 確率的シミュレーション（ランダム要素あり）</p>
              <p>• 設定したリターンとリスクに基づく理論計算</p>
              <p>• 多数回実行して統計的な分布を算出</p>
              <p>• 将来の不確実性を数値化</p>
            </div>
            <label className="block mb-1 font-bold">シミュレーション回数</label>
            <input type="number" value={params.numSimulations} onChange={e => handleChange('numSimulations', e.target.value)} className="w-full p-2 border rounded box-border" />
          </>
        )}

        {params.simulationMethod === 'historical' && (
          <>
            <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded text-sm mb-3">
              <p className="font-bold mb-2">ヒストリカル法について：</p>
              <p>• 過去30年データを使用（1994-2023年）</p>
              <p>• 複数の開始年でシミュレーション実行</p>
              <p>• 実際の市場変動パターンを再現</p>
              <p>• 仮想通貨：2014年以前は株式リターンを適用</p>
              <p className="text-blue-600 dark:text-blue-400 font-bold">※ 30年超の場合は循環データを使用</p>
            </div>

            <label className="block mb-1 font-bold">株式リターンの地域</label>
            <select
              value={params.stockRegion}
              onChange={e => setParams({ ...params, stockRegion: e.target.value as StockRegion })}
              className="w-full p-2 border rounded box-border mb-3"
            >
              {stockOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <label className="block mb-1 font-bold">インフレ率の地域</label>
            <select
              value={params.inflationRegion}
              onChange={e => setParams({ ...params, inflationRegion: e.target.value as InflationRegion })}
              className="w-full p-2 border rounded box-border"
            >
              {inflationOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      <div className="mb-5">
        <h3 className="text-base font-bold mb-3">基本項目</h3>
        <label className="block mb-1 font-bold">初期年齢</label>
        <input type="number" value={params.initialAge} onChange={e => handleChange('initialAge', e.target.value)} className="w-full p-2 border rounded box-border" />
        <label className="block mb-1 font-bold">終了年齢（最大120歳）</label>
        <input
          type="number"
          min={params.initialAge + 1}
          max={120}
          value={params.endAge}
          onChange={e => handleChange('endAge', e.target.value)}
          className="w-full p-2 border rounded box-border"
        />
        {params.simulationMethod === 'historical' && (params.endAge - params.initialAge) > 30 && (
          <div className="mt-1 text-sm text-blue-600 dark:text-blue-400">
            30年を超える期間では、ヒストリカルデータを循環使用します
          </div>
        )}

        {params.simulationMethod === 'montecarlo' && (
          <>
            <label className="block mb-1 font-bold">インフレ率</label>
            <input type="number" step="0.01" value={params.inflationRate} onChange={e => handleChange('inflationRate', e.target.value)} className="w-full p-2 border rounded box-border" />
            <label className="block mb-1 font-bold">株式の期待リターン（年率）</label>
            <input type="number" step="0.01" value={params.investmentReturnRate} onChange={e => handleChange('investmentReturnRate', e.target.value)} className="w-full p-2 border rounded box-border" />
            <label className="block mb-1 font-bold">株式のリスク（標準偏差）</label>
            <input type="number" step="0.01" value={params.investmentRisk} onChange={e => handleChange('investmentRisk', e.target.value)} className="w-full p-2 border rounded box-border" />
            <label className="block mb-1 font-bold">仮想通貨の期待リターン（年率）</label>
            <input type="number" step="0.01" value={params.cryptoReturnRate} onChange={e => handleChange('cryptoReturnRate', e.target.value)} className="w-full p-2 border rounded box-border" />
            <label className="block mb-1 font-bold">仮想通貨のリスク（標準偏差）</label>
            <input type="number" step="0.01" value={params.cryptoRisk} onChange={e => handleChange('cryptoRisk', e.target.value)} className="w-full p-2 border rounded box-border" />
          </>
        )}

        <label className="block mb-1 font-bold">株売却時のコスト（税金等）</label>
        <input type="number" step="0.01" value={params.stockTaxRate} onChange={e => handleChange('stockTaxRate', e.target.value)} className="w-full p-2 border rounded box-border" />
        <label className="block mb-1 font-bold">仮想通貨売却時のコスト（税金等）</label>
        <input type="number" step="0.01" value={params.cryptoTaxRate} onChange={e => handleChange('cryptoTaxRate', e.target.value)} className="w-full p-2 border rounded box-border" />
        <label className="block mb-1 font-bold">現金保有の上限（万円）</label>
        <input type="number" value={params.cashUpperLimit / JPY_UNIT} onChange={e => handleManYenChange('cashUpperLimit', e.target.value)} className="w-full p-2 border rounded box-border" />
        <label className="block mb-1 font-bold">現金保有の下限（万円）</label>
        <input type="number" value={params.cashLowerLimit / JPY_UNIT} onChange={e => handleManYenChange('cashLowerLimit', e.target.value)} className="w-full p-2 border rounded box-border" />
        <label className="block mb-1 font-bold">仮想通貨保有の下限（万円）</label>
        <input type="number" value={params.cryptoLowerLimit / JPY_UNIT} onChange={e => handleManYenChange('cryptoLowerLimit', e.target.value)} className="w-full p-2 border rounded box-border" />
        <label className="block mb-1 font-bold">株保有額の下限（万円）</label>
        <input type="number" value={params.stockLowerLimit / JPY_UNIT} onChange={e => handleManYenChange('stockLowerLimit', e.target.value)} className="w-full p-2 border rounded box-border" />
        <label className="block mb-1 font-bold">現金不足時の優先取り崩し資産</label>
        <select value={params.liquidationPriority} onChange={e => setParams({ ...params, liquidationPriority: e.target.value as 'crypto' | 'stock' | 'random' })} className="w-full p-2 border rounded box-border">
          <option value="crypto">仮想通貨</option>
          <option value="stock">株式</option>
          <option value="random">ランダム</option>
        </select>
        <label className="block mb-1 font-bold">仕事をリタイアする年齢</label>
        <input type="number" value={params.retirementAge} onChange={e => handleChange('retirementAge', e.target.value)} className="w-full p-2 border rounded box-border" />
        <label className="block mb-1 font-bold">ローン年数</label>
        <input type="number" value={params.loanDuration} onChange={e => handleChange('loanDuration', e.target.value)} className="w-full p-2 border rounded box-border" />
        <label className="block mb-1 font-bold">年間医療・介護費が発生する年齢</label>
        <input type="number" value={params.medicalCareStartAge} onChange={e => handleChange('medicalCareStartAge', e.target.value)} className="w-full p-2 border rounded box-border" />
        <label className="block mb-1 font-bold">娯楽費が減少し始める年齢</label>
        <input type="number" value={params.entertainmentExpensesDeclineStartAge} onChange={e => handleChange('entertainmentExpensesDeclineStartAge', e.target.value)} className="w-full p-2 border rounded box-border" />
        <label className="block mb-1 font-bold">娯楽費の年間減少率（0.1 = 10%減少）</label>
        <input type="number" step="0.01" min="0" max="1" value={params.entertainmentExpensesDeclineRate} onChange={e => handleChange('entertainmentExpensesDeclineRate', e.target.value)} className="w-full p-2 border rounded box-border" />
      </div>

      <div className="mb-5">
        <h3 className="text-base font-bold mb-3">資産初期値（万円）</h3>
        <label className="block mb-1 font-bold">株保有額</label>
        <input type="number" value={params.initialStockValue / JPY_UNIT} onChange={e => handleManYenChange('initialStockValue', e.target.value)} className="w-full p-2 border rounded box-border" />
        <label className="block mb-1 font-bold">仮想通貨保有額</label>
        <input type="number" value={params.initialCryptoValue / JPY_UNIT} onChange={e => handleManYenChange('initialCryptoValue', e.target.value)} className="w-full p-2 border rounded box-border" />
        <label className="block mb-1 font-bold">現金</label>
        <input type="number" value={params.initialCashValue / JPY_UNIT} onChange={e => handleManYenChange('initialCashValue', e.target.value)} className="w-full p-2 border rounded box-border" />
      </div>

      <div className="mb-5">
        <h3 className="text-base font-bold mb-3">年間支出（万円）</h3>
        <label className="block mb-1 font-bold">生活費</label>
        <input type="number" value={params.livingExpenses / JPY_UNIT} onChange={e => handleManYenChange('livingExpenses', e.target.value)} className="w-full p-2 border rounded box-border" />
        <label className="block mb-1 font-bold">娯楽費</label>
        <input type="number" value={params.entertainmentExpenses / JPY_UNIT} onChange={e => handleManYenChange('entertainmentExpenses', e.target.value)} className="w-full p-2 border rounded box-border" />
        <label className="block mb-1 font-bold">住宅維持費</label>
        <input type="number" value={params.housingMaintenance / JPY_UNIT} onChange={e => handleManYenChange('housingMaintenance', e.target.value)} className="w-full p-2 border rounded box-border" />
        <label className="block mb-1 font-bold">医療・介護費</label>
        <input type="number" value={params.medicalCare / JPY_UNIT} onChange={e => handleManYenChange('medicalCare', e.target.value)} className="w-full p-2 border rounded box-border" />
        <label className="block mb-1 font-bold">住宅ローン</label>
        <input type="number" value={params.housingLoan / JPY_UNIT} onChange={e => handleManYenChange('housingLoan', e.target.value)} className="w-full p-2 border rounded box-border" />
      </div>

      <div className="mb-5">
        <h3 className="text-base font-bold mb-3">年間収入（万円）</h3>
        <label className="block mb-1 font-bold">給与所得</label>
        <input type="number" value={params.salary / JPY_UNIT} onChange={e => handleManYenChange('salary', e.target.value)} className="w-full p-2 border rounded box-border" />
        <label className="block mb-1 font-bold">不動産所得</label>
        <input type="number" value={params.realEstateIncome / JPY_UNIT} onChange={e => handleManYenChange('realEstateIncome', e.target.value)} className="w-full p-2 border rounded box-border" />
      </div>

      <div className="mt-5">
        <button onClick={onSimulate} className="w-full p-2.5 border rounded-t-full rounded-b-full cursor-pointer text-base">シミュレーション実行</button>
      </div>
    </div>
  );
};