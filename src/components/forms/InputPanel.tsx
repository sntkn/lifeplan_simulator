import { useState } from 'react';
import { stockOptions, inflationOptions, type InflationRegion, type StockRegion } from '../../historicalData';
import type { SimulationParams } from '../../types/simulation';
import { SettingsIcon } from '../settings/SettingsIcon';
import { SettingsModal } from '../settings/SettingsModal';
import { NumberInput } from './NumberInput';

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
   * 設定モーダルの開閉状態
   */
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  return (
    <div className="w-[300px] p-5 border rounded-lg" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold mt-0">シミュレーション設定</h2>
        <SettingsIcon onClick={() => setIsSettingsModalOpen(true)} />
      </div>

      <div className="mb-5">
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
            <NumberInput
              label="シミュレーション回数"
              value={params.numSimulations}
              onChange={(value) => setParams({ ...params, numSimulations: value })}
            />
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
        <NumberInput
          label="初期年齢"
          value={params.initialAge}
          onChange={(value) => {
            const newParams = { ...params, initialAge: value };
            const maxAge = 120;
            if (newParams.endAge <= value || newParams.endAge > maxAge) {
              newParams.endAge = Math.min(value + 1, maxAge);
            }
            setParams(newParams);
          }}
        />
        <NumberInput
          label="終了年齢（最大120歳）"
          value={params.endAge}
          onChange={(value) => {
            const maxAge = 120;
            const clampedValue = Math.min(Math.max(value, params.initialAge + 1), maxAge);
            setParams({ ...params, endAge: clampedValue });
          }}
          min={params.initialAge + 1}
          max={120}
        />
        {params.simulationMethod === 'historical' && (params.endAge - params.initialAge) > 30 && (
          <div className="mt-1 text-sm text-blue-600 dark:text-blue-400">
            30年を超える期間では、ヒストリカルデータを循環使用します
          </div>
        )}

        {params.simulationMethod === 'montecarlo' && (
          <>
            <NumberInput
              label="インフレ率"
              value={params.inflationRate}
              onChange={(value) => setParams({ ...params, inflationRate: value })}
              step={0.01}
            />
            <NumberInput
              label="株式の期待リターン（年率）"
              value={params.investmentReturnRate}
              onChange={(value) => setParams({ ...params, investmentReturnRate: value })}
              step={0.01}
            />
            <NumberInput
              label="株式のリスク（標準偏差）"
              value={params.investmentRisk}
              onChange={(value) => setParams({ ...params, investmentRisk: value })}
              step={0.01}
            />
            <NumberInput
              label="仮想通貨の期待リターン（年率）"
              value={params.cryptoReturnRate}
              onChange={(value) => setParams({ ...params, cryptoReturnRate: value })}
              step={0.01}
            />
            <NumberInput
              label="仮想通貨のリスク（標準偏差）"
              value={params.cryptoRisk}
              onChange={(value) => setParams({ ...params, cryptoRisk: value })}
              step={0.01}
            />
          </>
        )}

        <NumberInput
          label="株売却時のコスト（税金等 0.1=10%）"
          value={params.stockTaxRate}
          onChange={(value) => setParams({ ...params, stockTaxRate: value })}
          step={0.01}
        />
        <NumberInput
          label="仮想通貨売却時のコスト（税金等 0.1=10%）"
          value={params.cryptoTaxRate}
          onChange={(value) => setParams({ ...params, cryptoTaxRate: value })}
          step={0.01}
        />
        <NumberInput
          label="現金保有の上限（万円）"
          value={params.cashUpperLimit}
          onChange={(value) => setParams({ ...params, cashUpperLimit: value })}
          unit={JPY_UNIT}
        />
        <NumberInput
          label="現金保有の下限（万円）"
          value={params.cashLowerLimit}
          onChange={(value) => setParams({ ...params, cashLowerLimit: value })}
          unit={JPY_UNIT}
        />
        <NumberInput
          label="仮想通貨保有の下限（万円）"
          value={params.cryptoLowerLimit}
          onChange={(value) => setParams({ ...params, cryptoLowerLimit: value })}
          unit={JPY_UNIT}
        />
        <NumberInput
          label="株保有額の下限（万円）"
          value={params.stockLowerLimit}
          onChange={(value) => setParams({ ...params, stockLowerLimit: value })}
          unit={JPY_UNIT}
        />
        <label className="block mb-1 font-bold">現金不足時の優先取り崩し資産</label>
        <select value={params.liquidationPriority} onChange={e => setParams({ ...params, liquidationPriority: e.target.value as 'crypto' | 'stock' | 'random' })} className="w-full p-2 border rounded box-border">
          <option value="crypto">仮想通貨</option>
          <option value="stock">株式</option>
          <option value="random">ランダム</option>
        </select>
        <NumberInput
          label="仕事をリタイアする年齢"
          value={params.retirementAge}
          onChange={(value) => setParams({ ...params, retirementAge: value })}
        />
        <NumberInput
          label="ローン年数"
          value={params.loanDuration}
          onChange={(value) => setParams({ ...params, loanDuration: value })}
        />
        <NumberInput
          label="年間医療・介護費が発生する年齢"
          value={params.medicalCareStartAge}
          onChange={(value) => setParams({ ...params, medicalCareStartAge: value })}
        />
        <NumberInput
          label="娯楽費が減少し始める年齢"
          value={params.entertainmentExpensesDeclineStartAge}
          onChange={(value) => setParams({ ...params, entertainmentExpensesDeclineStartAge: value })}
        />
        <NumberInput
          label="娯楽費の年間減少率（0.1 = 10%減少）"
          value={params.entertainmentExpensesDeclineRate}
          onChange={(value) => setParams({ ...params, entertainmentExpensesDeclineRate: value })}
          step={0.01}
          min={0}
          max={1}
        />
      </div>

      <div className="mb-5">
        <h3 className="text-base font-bold mb-3">資産初期値（万円）</h3>
        <NumberInput
          label="株保有額"
          value={params.initialStockValue}
          onChange={(value) => setParams({ ...params, initialStockValue: value })}
          unit={JPY_UNIT}
        />
        <NumberInput
          label="仮想通貨保有額"
          value={params.initialCryptoValue}
          onChange={(value) => setParams({ ...params, initialCryptoValue: value })}
          unit={JPY_UNIT}
        />
        <NumberInput
          label="現金"
          value={params.initialCashValue}
          onChange={(value) => setParams({ ...params, initialCashValue: value })}
          unit={JPY_UNIT}
        />
      </div>

      <div className="mb-5">
        <h3 className="text-base font-bold mb-3">年間支出（万円）</h3>
        <NumberInput
          label="生活費"
          value={params.livingExpenses}
          onChange={(value) => setParams({ ...params, livingExpenses: value })}
          unit={JPY_UNIT}
        />
        <NumberInput
          label="娯楽費"
          value={params.entertainmentExpenses}
          onChange={(value) => setParams({ ...params, entertainmentExpenses: value })}
          unit={JPY_UNIT}
        />
        <NumberInput
          label="住宅維持費"
          value={params.housingMaintenance}
          onChange={(value) => setParams({ ...params, housingMaintenance: value })}
          unit={JPY_UNIT}
        />
        <NumberInput
          label="医療・介護費"
          value={params.medicalCare}
          onChange={(value) => setParams({ ...params, medicalCare: value })}
          unit={JPY_UNIT}
        />
        <NumberInput
          label="住宅ローン"
          value={params.housingLoan}
          onChange={(value) => setParams({ ...params, housingLoan: value })}
          unit={JPY_UNIT}
        />
      </div>

      <div className="mb-5">
        <h3 className="text-base font-bold mb-3">年間収入（万円）</h3>
        <NumberInput
          label="給与所得"
          value={params.salary}
          onChange={(value) => setParams({ ...params, salary: value })}
          unit={JPY_UNIT}
        />
        <NumberInput
          label="不動産所得"
          value={params.realEstateIncome}
          onChange={(value) => setParams({ ...params, realEstateIncome: value })}
          unit={JPY_UNIT}
        />
      </div>

      <div className="mt-5">
        <button onClick={onSimulate} className="w-full p-2.5 border rounded-t-full rounded-b-full cursor-pointer text-base">シミュレーション実行</button>
      </div>

      {/* 設定管理モーダル */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        params={params}
        onLoadSetting={setParams}
      />
    </div>
  );
};