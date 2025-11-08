import { useState, useMemo } from 'react';
import type { SimulationParams, YearlyData } from '../types/simulation';
import { runMonteCarloSimulation, runHistoricalSimulation } from '../utils/simulationEngine';

/**
 * シミュレーション関連の状態とロジックを管理するカスタムフック
 */
export const useSimulation = () => {
  /**
   * シミュレーションのパラメータを管理する状態
   */
  const [params, setParams] = useState<SimulationParams>({
    initialAge: 30,
    retirementAge: 65,
    endAge: 100,
    loanDuration: 30,
    medicalCareStartAge: 75,
    entertainmentExpensesDeclineStartAge: 75,
    entertainmentExpensesDeclineRate: 0.1,
    inflationRate: 0.01,
    investmentReturnRate: 0.05,
    investmentRisk: 0.15,
    cryptoReturnRate: 0.12,
    cryptoRisk: 0.35,
    stockTaxRate: 0.10,
    cryptoTaxRate: 0.30,
    cashUpperLimit: 20000000,
    cashLowerLimit: 5000000,
    cryptoLowerLimit: 5000000,
    stockLowerLimit: 5000000,
    liquidationPriority: 'crypto',
    initialStockValue: 0,
    initialCryptoValue: 0,
    initialCashValue: 5000000,
    livingExpenses: 2000000,
    entertainmentExpenses: 500000,
    housingMaintenance: 600000,
    medicalCare: 750000,
    housingLoan: 1200000,
    salary: 3000000,
    realEstateIncome: 0,
    numSimulations: 1000,
    simulationMethod: 'montecarlo',
    inflationRegion: 'japan',
    stockRegion: 'sp500',
  });

  /**
   * シミュレーション結果のデータを管理する状態
   */
  const [simulationData, setSimulationData] = useState<YearlyData[] | null>(null);

  /**
   * シミュレーションを実行し、結果を状態に保存する関数
   */
  const runSimulation = () => {
    const data = params.simulationMethod === 'montecarlo'
      ? runMonteCarloSimulation(params)
      : runHistoricalSimulation(params);
    setSimulationData(data);
  };

  /**
   * シミュレーション期間
   */
  const simulationPeriod = useMemo(() => params.endAge - params.initialAge, [params.endAge, params.initialAge]);

  return {
    params,
    setParams,
    simulationData,
    runSimulation,
    simulationPeriod,
  };
};