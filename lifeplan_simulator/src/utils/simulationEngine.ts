import type { SimulationParams, YearlyData } from '../types/simulation';
import {
  cryptoReturns,
  validateSimulationPeriod,
  getInflationData,
  getStockData,
  HISTORICAL_DATA_LENGTH,
  MAX_START_YEARS
} from '../historicalData';

// --- Simulation Configuration ---
/**
 * ヒストリカルシミュレーションの実行回数を計算します
 * 30年を超える場合でも循環データを使用して複数パターンを確保
 */
const calculateHistoricalSimulationCount = (simulationPeriod: number): number => {
  if (simulationPeriod <= HISTORICAL_DATA_LENGTH) {
    // 30年以内の場合：独立したパターンの最大数を計算
    const maxIndependentPatterns = Math.max(1, HISTORICAL_DATA_LENGTH - simulationPeriod + 1);
    return Math.min(MAX_START_YEARS, maxIndependentPatterns);
  } else {
    // 30年を超える場合：循環データを使用して常に10パターンを確保
    return MAX_START_YEARS;
  }
};

// --- Return Calculation Strategies ---
interface ReturnCalculator {
  calculateReturns(yearIndex: number, startYear?: number): {
    stockReturn: number;
    cryptoReturn: number;
    inflationRate: number;
  };
}

class MonteCarloReturnCalculator implements ReturnCalculator {
  constructor(
    private investmentReturnRate: number,
    private investmentRisk: number,
    private cryptoReturnRate: number,
    private cryptoRisk: number,
    private inflationRate: number
  ) { }

  calculateReturns(): {
    stockReturn: number;
    cryptoReturn: number;
    inflationRate: number;
  } {
    const stockRandomFactor = Math.random() * 2 - 1; // -1 to 1
    const cryptoRandomFactor = Math.random() * 2 - 1; // -1 to 1
    const stockReturn = this.investmentReturnRate + stockRandomFactor * this.investmentRisk;
    const cryptoReturn = this.cryptoReturnRate + cryptoRandomFactor * this.cryptoRisk;

    return {
      stockReturn,
      cryptoReturn,
      inflationRate: this.inflationRate
    };
  }
}

class HistoricalReturnCalculator implements ReturnCalculator {
  constructor(
    private stockRegion: 'sp500' | 'nikkei' | 'world',
    private inflationRegion: 'japan' | 'us' | 'world'
  ) { }

  calculateReturns(yearIndex: number, startYear: number = 0): {
    stockReturn: number;
    cryptoReturn: number;
    inflationRate: number;
  } {
    // 循環データインデックスの計算（30年を超える場合でも対応）
    const dataIndex = (startYear + yearIndex - 1) % HISTORICAL_DATA_LENGTH;
    const stockData = getStockData(this.stockRegion);
    const inflationData = getInflationData(this.inflationRegion);

    const stockReturn = stockData[dataIndex] || 0;
    const cryptoReturn = cryptoReturns[dataIndex] || 0;
    const inflationRate = inflationData[dataIndex] || 0.02;

    // デバッグ情報（長期シミュレーション時）
    if (yearIndex === 1 && startYear < 3) {
      console.log(`Pattern ${startYear + 1}: Starting from year ${1994 + startYear}, dataIndex: ${dataIndex}`);
    }

    // NaNチェック
    if (isNaN(stockReturn) || isNaN(cryptoReturn) || isNaN(inflationRate)) {
      console.error('Invalid historical data at index:', dataIndex, { stockReturn, cryptoReturn, inflationRate });
      return { stockReturn: 0, cryptoReturn: 0, inflationRate: 0.02 };
    }

    return { stockReturn, cryptoReturn, inflationRate };
  }
}

// --- Core Simulation Logic ---
/**
 * 単一のシミュレーション実行を行います
 */
const runSingleSimulation = (
  params: SimulationParams,
  returnCalculator: ReturnCalculator,
  startYear: number = 0
): { totalAssets: number[], stockValues: number[], cryptoValues: number[], cashValues: number[] } => {
  const {
    initialAge,
    initialStockValue,
    initialCryptoValue,
    initialCashValue,
    livingExpenses,
    entertainmentExpenses,
    housingMaintenance,
    medicalCare,
    housingLoan,
    salary,
    realEstateIncome,
    cashUpperLimit,
    cashLowerLimit,
    cryptoLowerLimit,
    stockLowerLimit,
    stockTaxRate,
    cryptoTaxRate,
  } = params;

  const simulationPeriod = params.endAge - initialAge;
  let stockValue = initialStockValue;
  let cryptoValue = initialCryptoValue;
  let cashValue = initialCashValue;

  let currentLivingExpenses = livingExpenses;
  let currentEntertainmentExpenses = entertainmentExpenses;
  let currentHousingMaintenance = housingMaintenance;
  let currentMedicalCare = medicalCare;
  let currentRealEstateIncome = realEstateIncome;

  const yearlyTotalAssets: number[] = [stockValue + cryptoValue + cashValue];
  const yearlyStockValues: number[] = [stockValue];
  const yearlyCryptoValues: number[] = [cryptoValue];
  const yearlyCashValues: number[] = [cashValue];

  for (let year = 1; year <= simulationPeriod; year++) {
    const currentAge = initialAge + year - 1;

    // Calculate returns using the provided strategy
    const { stockReturn, cryptoReturn, inflationRate } = returnCalculator.calculateReturns(year, startYear);

    // Apply investment returns
    stockValue *= (1 + stockReturn);
    cryptoValue *= (1 + cryptoReturn);

    // Income calculation
    const currentSalary = currentAge <= params.retirementAge ? salary : 0;
    const income = currentSalary + currentRealEstateIncome;

    // Expenses calculation
    if (currentAge >= params.entertainmentExpensesDeclineStartAge) {
      currentEntertainmentExpenses *= (1 - params.entertainmentExpensesDeclineRate);
    }
    const expenses =
      currentLivingExpenses +
      currentEntertainmentExpenses +
      currentHousingMaintenance +
      (currentAge >= params.medicalCareStartAge ? currentMedicalCare : 0) +
      (year - 1 < params.loanDuration ? housingLoan : 0);

    // Balance and rebalancing
    const balance = income - expenses;
    cashValue += balance;

    // Cash upper limit handling
    if (cashValue > cashUpperLimit) {
      const surplus = cashValue - cashUpperLimit;

      switch (params.liquidationPriority) {
        case 'crypto':
          cryptoValue += surplus;
          break;
        case 'stock':
          stockValue += surplus;
          break;
        default: // random
          const stockAboveLowerLimit = stockValue >= stockLowerLimit;
          const cryptoAboveLowerLimit = cryptoValue >= cryptoLowerLimit;

          if (stockAboveLowerLimit && cryptoAboveLowerLimit) {
            // 両方が下限以上の場合、ランダムで選択
            if (Math.random() < 0.5) {
              cryptoValue += surplus;
            } else {
              stockValue += surplus;
            }
          } else if (stockAboveLowerLimit) {
            // 株式のみが下限以上の場合
            stockValue += surplus;
          } else if (cryptoAboveLowerLimit) {
            // 仮想通貨のみが下限以上の場合
            cryptoValue += surplus;
          } else {
            // 両方とも下限を下回っている場合、デフォルトで株式に追加
            stockValue += surplus;
          }
          break;
      }
      cashValue = cashUpperLimit;
    }

    // Cash lower limit handling
    if (cashValue < cashLowerLimit) {
      let deficit = cashLowerLimit - cashValue;

      const liquidate = (priorityAsset: 'crypto' | 'stock') => {
        if (deficit <= 0) return;

        const assetValue = priorityAsset === 'crypto' ? cryptoValue : stockValue;
        const assetLowerLimit = priorityAsset === 'crypto' ? cryptoLowerLimit : stockLowerLimit;
        const taxRate = priorityAsset === 'crypto' ? cryptoTaxRate : stockTaxRate;

        const availableToSell = assetValue - assetLowerLimit;
        if (availableToSell > 0) {
          const sellAmount = Math.min(deficit * taxRate, availableToSell);
          if (priorityAsset === 'crypto') {
            cryptoValue -= sellAmount;
          } else {
            stockValue -= sellAmount;
          }
          const cashGained = sellAmount / taxRate;
          cashValue += cashGained;
          deficit -= cashGained;
        }
      };

      switch (params.liquidationPriority) {
        case 'crypto':
          liquidate('crypto');
          liquidate('stock');
          break;
        case 'stock':
          liquidate('stock');
          liquidate('crypto');
          break;
        default: // random
          const stockAboveLowerLimit = stockValue > stockLowerLimit;
          const cryptoAboveLowerLimit = cryptoValue > cryptoLowerLimit;

          if (stockAboveLowerLimit && cryptoAboveLowerLimit) {
            // 両方が下限以上の場合、ランダムで優先順位を決定
            if (Math.random() < 0.5) {
              liquidate('crypto');
              liquidate('stock');
            } else {
              liquidate('stock');
              liquidate('crypto');
            }
          } else if (stockAboveLowerLimit) {
            // 株式のみが下限以上の場合
            liquidate('stock');
          } else if (cryptoAboveLowerLimit) {
            // 仮想通貨のみが下限以上の場合
            liquidate('crypto');
          }
          // 両方とも下限以下の場合は何もしない
          break;
      }
    }

    // Asset lower limit handling
    if (stockValue < stockLowerLimit) {
      const deficit = stockLowerLimit - stockValue;
      cashValue -= deficit;
      stockValue += deficit;
    }

    if (cryptoValue < cryptoLowerLimit) {
      const deficit = cryptoLowerLimit - cryptoValue;
      cashValue -= deficit;
      cryptoValue += deficit;
    }

    const totalAssets = stockValue + cryptoValue + cashValue;

    // NaN check
    if (isNaN(totalAssets) || isNaN(stockValue) || isNaN(cryptoValue) || isNaN(cashValue)) {
      console.error('NaN detected:', { totalAssets, stockValue, cryptoValue, cashValue, year, startYear });
      break;
    }

    yearlyTotalAssets.push(totalAssets);
    yearlyStockValues.push(stockValue);
    yearlyCryptoValues.push(cryptoValue);
    yearlyCashValues.push(cashValue);

    // Apply inflation for next year
    currentLivingExpenses *= (1 + inflationRate);
    currentEntertainmentExpenses *= (1 + inflationRate);
    currentHousingMaintenance *= (1 + inflationRate);
    currentMedicalCare *= (1 + inflationRate);
    currentRealEstateIncome *= (1 + inflationRate);
  }

  return {
    totalAssets: yearlyTotalAssets,
    stockValues: yearlyStockValues,
    cryptoValues: yearlyCryptoValues,
    cashValues: yearlyCashValues
  };
};

/**
 * 複数のシミュレーション結果を統計処理してチャートデータに変換します
 */
const processSimulationResults = (
  allSimulations: number[][],
  allStockSimulations: number[][],
  allCryptoSimulations: number[][],
  allCashSimulations: number[][],
  params: SimulationParams
): YearlyData[] => {
  const simulationPeriod = params.endAge - params.initialAge;
  const chartData: YearlyData[] = [];

  for (let year = 0; year <= simulationPeriod; year++) {
    const yearlyOutcomes = allSimulations.map(sim => sim[year]).filter(val => val !== undefined && !isNaN(val));
    const yearlyStockOutcomes = allStockSimulations.map(sim => sim[year]).filter(val => val !== undefined && !isNaN(val));
    const yearlyCryptoOutcomes = allCryptoSimulations.map(sim => sim[year]).filter(val => val !== undefined && !isNaN(val));
    const yearlyCashOutcomes = allCashSimulations.map(sim => sim[year]).filter(val => val !== undefined && !isNaN(val));

    if (yearlyOutcomes.length === 0) {
      console.error('No valid outcomes for year:', year);
      continue;
    }

    yearlyOutcomes.sort((a, b) => a - b);
    yearlyStockOutcomes.sort((a, b) => a - b);
    yearlyCryptoOutcomes.sort((a, b) => a - b);
    yearlyCashOutcomes.sort((a, b) => a - b);

    const numSims = yearlyOutcomes.length;
    const yearData: YearlyData = {
      year: year,
      age: params.initialAge + year,
      median: yearlyOutcomes[Math.floor(numSims / 2)] || 0,
      p90: yearlyOutcomes[Math.floor(numSims * 0.9)] || 0,
      p75: yearlyOutcomes[Math.floor(numSims * 0.75)] || 0,
      p25: yearlyOutcomes[Math.floor(numSims * 0.25)] || 0,
      p10: yearlyOutcomes[Math.floor(numSims * 0.1)] || 0,
      medianStock: yearlyStockOutcomes[Math.floor(yearlyStockOutcomes.length / 2)] || 0,
      medianCrypto: yearlyCryptoOutcomes[Math.floor(yearlyCryptoOutcomes.length / 2)] || 0,
      medianCash: yearlyCashOutcomes[Math.floor(yearlyCashOutcomes.length / 2)] || 0,
    };
    chartData.push(yearData);
  }

  return chartData;
};

/**
 * モンテカルロシミュレーションを実行します。
 * @param params シミュレーションのパラメータ
 * @returns シミュレーション結果の配列
 */
export const runMonteCarloSimulation = (params: SimulationParams): YearlyData[] => {
  const returnCalculator = new MonteCarloReturnCalculator(
    params.investmentReturnRate,
    params.investmentRisk,
    params.cryptoReturnRate,
    params.cryptoRisk,
    params.inflationRate
  );

  const allSimulations: number[][] = [];
  const allStockSimulations: number[][] = [];
  const allCryptoSimulations: number[][] = [];
  const allCashSimulations: number[][] = [];

  for (let i = 0; i < params.numSimulations; i++) {
    const result = runSingleSimulation(params, returnCalculator);
    allSimulations.push(result.totalAssets);
    allStockSimulations.push(result.stockValues);
    allCryptoSimulations.push(result.cryptoValues);
    allCashSimulations.push(result.cashValues);
  }

  return processSimulationResults(allSimulations, allStockSimulations, allCryptoSimulations, allCashSimulations, params);
};

/**
 * ヒストリカルシミュレーションを実行します。
 * 30年を超える場合でも循環データを使用して複数パターンを実行
 * @param params シミュレーションのパラメータ
 * @returns シミュレーション結果の配列
 */
export const runHistoricalSimulation = (params: SimulationParams): YearlyData[] => {
  console.log('Starting historical simulation with params:', params);

  // シミュレーション期間のバリデーション
  const validation = validateSimulationPeriod(params.initialAge, params.endAge);
  if (!validation.isValid) {
    console.error(validation.message);
    alert(validation.message);
    return [];
  }

  // 循環データ使用の警告表示
  if (validation.message) {
    console.warn(validation.message);
  }

  const returnCalculator = new HistoricalReturnCalculator(
    params.stockRegion || 'sp500',
    params.inflationRegion || 'japan'
  );
  const simulationPeriod = params.endAge - params.initialAge;
  const actualStartYears = calculateHistoricalSimulationCount(simulationPeriod);

  console.log(`Running ${actualStartYears} simulations for ${simulationPeriod} years`);
  if (simulationPeriod > HISTORICAL_DATA_LENGTH) {
    console.log(`Using cyclic historical data (${HISTORICAL_DATA_LENGTH} years repeated)`);
  }

  const allSimulations: number[][] = [];
  const allStockSimulations: number[][] = [];
  const allCryptoSimulations: number[][] = [];
  const allCashSimulations: number[][] = [];

  for (let startYear = 0; startYear < actualStartYears; startYear++) {
    const result = runSingleSimulation(params, returnCalculator, startYear);
    allSimulations.push(result.totalAssets);
    allStockSimulations.push(result.stockValues);
    allCryptoSimulations.push(result.cryptoValues);
    allCashSimulations.push(result.cashValues);
  }

  console.log('Generated chart data points:', allSimulations.length);
  return processSimulationResults(allSimulations, allStockSimulations, allCryptoSimulations, allCashSimulations, params);
};