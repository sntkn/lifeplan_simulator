import type { SimulationParams, YearlyData } from '../types/simulation';
import { cryptoReturns, validateSimulationPeriod, getInflationData, getStockData } from '../historicalData';

/**
 * モンテカルロシミュレーションを実行します。
 * @param params シミュレーションのパラメータ
 * @returns シミュレーション結果の配列
 */
export const runMonteCarloSimulation = (params: SimulationParams): YearlyData[] => {
  const {
    initialAge,
    inflationRate,
    investmentReturnRate,
    investmentRisk,
    cryptoReturnRate,
    cryptoRisk,
    stockTaxRate,
    cryptoTaxRate,
    cashUpperLimit,
    cashLowerLimit,
    cryptoLowerLimit,
    stockLowerLimit,
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
    numSimulations,
  } = params;

  const simulationPeriod = params.endAge - initialAge;
  const results: number[][] = [];
  const stockResults: number[][] = [];
  const cryptoResults: number[][] = [];
  const cashResults: number[][] = [];

  for (let i = 0; i < numSimulations; i++) {
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

      // Apply investment returns (stochastic)
      const stockRandomFactor = Math.random() * 2 - 1; // -1 to 1
      const cryptoRandomFactor = Math.random() * 2 - 1; // -1 to 1
      const stockAnnualReturn = investmentReturnRate + stockRandomFactor * investmentRisk;
      const cryptoAnnualReturn = cryptoReturnRate + cryptoRandomFactor * cryptoRisk;
      stockValue *= (1 + stockAnnualReturn);
      cryptoValue *= (1 + cryptoAnnualReturn);

      // Income
      const currentSalary = currentAge <= params.retirementAge ? salary : 0;
      const income = currentSalary + currentRealEstateIncome;

      // Expenses
      if (currentAge >= params.entertainmentExpensesDeclineStartAge) {
        currentEntertainmentExpenses *= 0.9;
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

      if (cashValue > cashUpperLimit) {
        const surplus = cashValue - cashUpperLimit;
        stockValue += surplus;
        cashValue = cashUpperLimit;
      }

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

        if (params.liquidationPriority === 'crypto') {
          liquidate('crypto');
          liquidate('stock');
        } else {
          liquidate('stock');
          liquidate('crypto');
        }
      }

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
    results.push(yearlyTotalAssets);
    stockResults.push(yearlyStockValues);
    cryptoResults.push(yearlyCryptoValues);
    cashResults.push(yearlyCashValues);
  }

  // --- Process results for charting ---
  const chartData: YearlyData[] = [];
  for (let year = 0; year <= simulationPeriod; year++) {
    const yearlyOutcomes = results.map(sim => sim[year]);
    const yearlyStockOutcomes = stockResults.map(sim => sim[year]);
    const yearlyCryptoOutcomes = cryptoResults.map(sim => sim[year]);
    const yearlyCashOutcomes = cashResults.map(sim => sim[year]);

    yearlyOutcomes.sort((a, b) => a - b);
    yearlyStockOutcomes.sort((a, b) => a - b);
    yearlyCryptoOutcomes.sort((a, b) => a - b);
    yearlyCashOutcomes.sort((a, b) => a - b);

    const yearData: YearlyData = {
      year: year,
      age: initialAge + year,
      median: yearlyOutcomes[Math.floor(numSimulations / 2)],
      p90: yearlyOutcomes[Math.floor(numSimulations * 0.9)],
      p75: yearlyOutcomes[Math.floor(numSimulations * 0.75)],
      p25: yearlyOutcomes[Math.floor(numSimulations * 0.25)],
      p10: yearlyOutcomes[Math.floor(numSimulations * 0.1)],
      medianStock: yearlyStockOutcomes[Math.floor(numSimulations / 2)],
      medianCrypto: yearlyCryptoOutcomes[Math.floor(numSimulations / 2)],
      medianCash: yearlyCashOutcomes[Math.floor(numSimulations / 2)],
    };
    chartData.push(yearData);
  }

  return chartData;
};

/**
 * ヒストリカルシミュレーションを実行します。
 * @param params シミュレーションのパラメータ
 * @returns シミュレーション結果の配列
 */
export const runHistoricalSimulation = (params: SimulationParams): YearlyData[] => {
  console.log('Starting historical simulation with params:', params);
  console.log('Historical data lengths:', { crypto: cryptoReturns.length });

  // シミュレーション期間のバリデーション
  const validation = validateSimulationPeriod(params.initialAge, params.endAge);
  if (!validation.isValid) {
    console.error(validation.message);
    alert(validation.message);
    return [];
  }

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
  const historicalDataLength = 30; // 1994-2023年の30年間

  console.log('Simulation period:', simulationPeriod, 'Historical data length:', historicalDataLength);

  // 複数の開始年でシミュレーションを実行（最大10パターン）
  const maxStartYears = Math.min(10, historicalDataLength);
  const actualStartYears = simulationPeriod <= historicalDataLength ? maxStartYears : Math.min(5, historicalDataLength);

  console.log('Running', actualStartYears, 'simulations');

  const allSimulations: number[][] = [];
  const allStockSimulations: number[][] = [];
  const allCryptoSimulations: number[][] = [];
  const allCashSimulations: number[][] = [];

  for (let startYear = 0; startYear < actualStartYears; startYear++) {
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
      const dataIndex = (startYear + year - 1) % historicalDataLength;

      // 過去データを使用してリターンを適用（選択された地域のデータを使用）
      const stockData = getStockData(params.stockRegion);
      const inflationData = getInflationData(params.inflationRegion);

      const stockReturn = stockData[dataIndex] || 0;
      const cryptoReturn = cryptoReturns[dataIndex] || 0;
      const inflationRate = inflationData[dataIndex] || 0.02;

      // デバッグ用ログ（最初の数年のみ）
      if (startYear === 0 && year <= 3) {
        console.log(`Year ${year}, dataIndex ${dataIndex}:`, { stockReturn, cryptoReturn, inflationRate });
      }

      // NaNチェック
      if (isNaN(stockReturn) || isNaN(cryptoReturn) || isNaN(inflationRate)) {
        console.error('Invalid data at index', dataIndex, { stockReturn, cryptoReturn, inflationRate });
        continue;
      }

      stockValue *= (1 + stockReturn);
      cryptoValue *= (1 + cryptoReturn);

      // Income
      const currentSalary = currentAge <= params.retirementAge ? salary : 0;
      const income = currentSalary + currentRealEstateIncome;

      // Expenses
      if (currentAge >= params.entertainmentExpensesDeclineStartAge) {
        currentEntertainmentExpenses *= 0.9;
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

      if (cashValue > cashUpperLimit) {
        const surplus = cashValue - cashUpperLimit;
        stockValue += surplus;
        cashValue = cashUpperLimit;
      }

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

        if (params.liquidationPriority === 'crypto') {
          liquidate('crypto');
          liquidate('stock');
        } else {
          liquidate('stock');
          liquidate('crypto');
        }
      }

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

      // NaNチェック
      if (isNaN(totalAssets) || isNaN(stockValue) || isNaN(cryptoValue) || isNaN(cashValue)) {
        console.error('NaN detected:', { totalAssets, stockValue, cryptoValue, cashValue, year, startYear });
        break;
      }

      yearlyTotalAssets.push(totalAssets);
      yearlyStockValues.push(stockValue);
      yearlyCryptoValues.push(cryptoValue);
      yearlyCashValues.push(cashValue);

      // Apply historical inflation for next year
      currentLivingExpenses *= (1 + inflationRate);
      currentEntertainmentExpenses *= (1 + inflationRate);
      currentHousingMaintenance *= (1 + inflationRate);
      currentMedicalCare *= (1 + inflationRate);
      currentRealEstateIncome *= (1 + inflationRate);
    }

    allSimulations.push(yearlyTotalAssets);
    allStockSimulations.push(yearlyStockValues);
    allCryptoSimulations.push(yearlyCryptoValues);
    allCashSimulations.push(yearlyCashValues);
  }

  // Process results for charting
  console.log('Processing results, simulations count:', allSimulations.length);
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
      age: initialAge + year,
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

  console.log('Generated chart data points:', chartData.length);
  return chartData;
};