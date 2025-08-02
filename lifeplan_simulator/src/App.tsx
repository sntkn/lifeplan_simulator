import { useState, useMemo, useEffect } from 'react';
import './App.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { sp500Returns, japanInflationRates, cryptoReturns, getHistoricalStats, validateSimulationPeriod, cryptoDataStartYear } from './historicalData';

// --- Types ---
type SavedSetting = {
  name: string;
  params: SimulationParams;
  createdAt: string;
};

type SimulationParams = {
  /** シミュレーション開始時の年齢 */
  initialAge: number;
  /** 仕事をリタイアする年齢 */
  retirementAge: number;
  /** シミュレーション終了年齢 */
  endAge: number;
  /** ローン年数 */
  loanDuration: number;
  /** 年間医療・介護費が発生する年齢 */
  medicalCareStartAge: number;
  /** 娯楽費が減少し始める年齢 */
  entertainmentExpensesDeclineStartAge: number;
  /** インフレ率 */
  inflationRate: number;
  /** 株式の期待リターン（年率） */
  investmentReturnRate: number;
  /** 株式のリスク（標準偏差） */
  investmentRisk: number;
  /** 仮想通貨の期待リターン（年率） */
  cryptoReturnRate: number;
  /** 仮想通貨のリスク（標準偏差） */
  cryptoRisk: number;
  /** 株式売却時の税金・手数料率 */
  stockTaxRate: number;
  /** 仮想通貨売却時の税金・手数料率 */
  cryptoTaxRate: number;
  /** 現金保有額の上限 */
  cashUpperLimit: number;
  /** 現金保有額の下限 */
  cashLowerLimit: number;
  /** 仮想通貨保有額の下限 */
  cryptoLowerLimit: number;
  /** 株式保有額の下限 */
  stockLowerLimit: number;
  /** 現金が下限を下回った場合に取り崩す資産の優先順位 */
  liquidationPriority: 'crypto' | 'stock';

  /** 初期資産（株式） */
  initialStockValue: number;
  /** 初期資産（仮想通貨） */
  initialCryptoValue: number;
  /** 初期資産（現金） */
  initialCashValue: number;

  /** 年間生活費 */
  livingExpenses: number;
  /** 年間娯楽費 */
  entertainmentExpenses: number;
  /** 年間住宅維持費 */
  housingMaintenance: number;
  /** 年間医療・介護費 */
  medicalCare: number;
  /** 年間住宅ローン返済額 */
  housingLoan: number;

  /** 年間給与所得 */
  salary: number;
  /** 年間不動産所得 */
  realEstateIncome: number;

  /** モンテカルロシミュレーションの実行回数 */
  numSimulations: number;
  /** シミュレーション方法 */
  simulationMethod: 'montecarlo' | 'historical';
};

type YearlyData = {
  /** シミュレーションの年 */
  year: number;
  /** 年齢 */
  age: number;
  /** 資産額の中央値 */
  median: number;
  /** 資産額の上位10% */
  p90: number;
  /** 資産額の上位25% */
  p75: number;
  /** 資産額の下位25% */
  p25: number;
  /** 資産額の下位10% */
  p10: number;
  /** 株式の中央値 */
  medianStock: number;
  /** 仮想通貨の中央値 */
  medianCrypto: number;
  /** 現金の中央値 */
  medianCash: number;
};

// --- Monte Carlo Simulation Logic ---
/**
 * モンテカルロシミュレーションを実行します。
 * @param params シミュレーションのパラメータ
 * @returns シミュレーション結果の配列
 */
const runMonteCarloSimulation = (params: SimulationParams): YearlyData[] => {
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

      //if (stockValue < 0) stockValue = 0;
      //if (cryptoValue < 0) cryptoValue = 0;
      //if (cashValue < 0) cashValue = 0;

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
const runHistoricalSimulation = (params: SimulationParams): YearlyData[] => {
  console.log('Starting historical simulation with params:', params);
  console.log('Historical data lengths:', { sp500: sp500Returns.length, inflation: japanInflationRates.length, crypto: cryptoReturns.length });

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
  const historicalDataLength = sp500Returns.length;

  console.log('Simulation period:', simulationPeriod, 'Historical data length:', historicalDataLength);

  // 複数の開始年でシミュレーションを実行（最大10パターン）
  const maxStartYears = Math.min(10, historicalDataLength);
  const actualStartYears = simulationPeriod <= historicalDataLength ? maxStartYears : Math.min(5, historicalDataLength);
  const allSimulations: number[][] = [];
  const allStockSimulations: number[][] = [];
  const allCryptoSimulations: number[][] = [];
  const allCashSimulations: number[][] = [];

  console.log('Running', actualStartYears, 'simulations');

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

      // 過去データを使用してリターンを適用
      const stockReturn = sp500Returns[dataIndex] || 0;
      const cryptoReturn = cryptoReturns[dataIndex] || 0;
      const inflationRate = japanInflationRates[dataIndex] || 0.02;

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

// --- Settings Management ---
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

// --- UI Components ---
/**
 * シミュレーション設定の入力パネルコンポーネントです。
 * @param params シミュレーションのパラメータ
 * @param setParams パラメータを更新する関数
 * @param onSimulate シミュレーションを実行する関数
 */
const InputPanel = ({ params, setParams, onSimulate }: { params: SimulationParams, setParams: (p: SimulationParams) => void, onSimulate: () => void }) => {
  /**
   * 万円単位を円単位に変換するための定数
   */
  const JPY_UNIT = 10000;

  /**
   * 保存された設定一覧の状態
   */
  const [savedSettings, setSavedSettings] = useState<SavedSetting[]>([]);

  /**
   * 設定保存用の名前入力の状態
   */
  const [saveSettingName, setSaveSettingName] = useState('');

  /**
   * 設定管理パネルの表示状態
   */
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);

  /**
   * コンポーネント初期化時に保存された設定を読み込み
   */
  useEffect(() => {
    setSavedSettings(getSavedSettings());
  }, []);

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
        let maxAge = 120;
        if (params.simulationMethod === 'historical') {
          maxAge = Math.min(120, params.initialAge + 30);
        }
        const clampedValue = Math.min(Math.max(numValue, params.initialAge + 1), maxAge);
        setParams({ ...params, [field]: clampedValue });
      } else if (field === 'initialAge') {
        // 初期年齢が変更された場合、終了年齢も調整
        const newParams = { ...params, [field]: numValue };
        let maxAge = 120;
        if (params.simulationMethod === 'historical') {
          maxAge = Math.min(120, numValue + 30);
        }
        if (newParams.endAge <= numValue || newParams.endAge > maxAge) {
          newParams.endAge = Math.min(numValue + 1, maxAge);
        }
        setParams(newParams);
      } else {
        setParams({ ...params, [field]: numValue });
      }
    }
  };

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
    setParams(setting.params);
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
    <div className="w-[300px] p-5 border rounded-lg" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
      <h2 className="text-lg font-bold mt-0 mb-4">シミュレーション設定</h2>

      {/* 設定管理パネル */}
      <div className="mb-5 p-3 border rounded bg-gray-50 dark:bg-gray-800">
        <button
          onClick={() => setShowSettingsPanel(!showSettingsPanel)}
          className="w-full p-2 text-sm font-bold bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          {showSettingsPanel ? '設定管理を閉じる' : '設定管理を開く'}
        </button>

        {showSettingsPanel && (
          <div className="mt-3">
            {/* 設定保存 */}
            <div className="mb-3">
              <label className="block mb-1 text-sm font-bold">設定を保存</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={saveSettingName}
                  onChange={e => setSaveSettingName(e.target.value)}
                  placeholder="設定名を入力"
                  className="flex-1 p-1 text-sm border rounded"
                />
                <button
                  onClick={handleSaveSetting}
                  className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition"
                >
                  保存
                </button>
              </div>
            </div>

            {/* 保存された設定一覧 */}
            <div>
              <label className="block mb-2 text-sm font-bold">保存された設定</label>
              {savedSettings.length === 0 ? (
                <p className="text-sm text-gray-500">保存された設定はありません</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {savedSettings.map((setting) => (
                    <div key={setting.name} className="flex items-center gap-2 p-2 border rounded bg-white dark:bg-gray-700">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{setting.name}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(setting.createdAt).toLocaleDateString('ja-JP')}
                        </div>
                      </div>
                      <button
                        onClick={() => handleLoadSetting(setting)}
                        className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                      >
                        読込
                      </button>
                      <button
                        onClick={() => handleDeleteSetting(setting.name)}
                        className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition"
                      >
                        削除
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mb-5">
        <h3 className="text-base font-bold mb-3">シミュレーション方法</h3>
        <label className="block mb-1 font-bold">シミュレーション方法</label>
        <select
          value={params.simulationMethod}
          onChange={e => {
            const newMethod = e.target.value as 'montecarlo' | 'historical';
            const newParams = { ...params, simulationMethod: newMethod };

            // ヒストリカル法に変更した場合、終了年齢を制限
            if (newMethod === 'historical') {
              const maxAge = Math.min(120, params.initialAge + 30);
              if (params.endAge > maxAge) {
                newParams.endAge = maxAge;
              }
            }

            setParams(newParams);
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
          <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded text-sm">
            <p className="font-bold mb-2">ヒストリカル法について：</p>
            <p>• S&P500の過去30年データを使用（1994-2023年）</p>
            <p>• 日本のインフレ率も過去データを適用</p>
            <p>• 複数の開始年でシミュレーション実行</p>
            <p>• 実際の市場変動パターンを再現</p>
            <p>• 仮想通貨：2014年以前は株式リターンを適用</p>
            <p className="text-orange-600 dark:text-orange-400 font-bold">※ 最大30年間のシミュレーション</p>
          </div>
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
          max={params.simulationMethod === 'historical' ? Math.min(120, params.initialAge + 30) : 120}
          value={params.endAge}
          onChange={e => handleChange('endAge', e.target.value)}
          className="w-full p-2 border rounded box-border"
        />
        {params.simulationMethod === 'historical' && (
          <div className="mt-1 text-sm text-orange-600 dark:text-orange-400">
            ヒストリカル法では最大30年間のシミュレーションが可能です
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
        <select value={params.liquidationPriority} onChange={e => setParams({ ...params, liquidationPriority: e.target.value as 'crypto' | 'stock' })} className="w-full p-2 border rounded box-border">
          <option value="crypto">仮想通貨</option>
          <option value="stock">株式</option>
        </select>
        <label className="block mb-1 font-bold">仕事をリタイアする年齢</label>
        <input type="number" value={params.retirementAge} onChange={e => handleChange('retirementAge', e.target.value)} className="w-full p-2 border rounded box-border" />
        <label className="block mb-1 font-bold">ローン年数</label>
        <input type="number" value={params.loanDuration} onChange={e => handleChange('loanDuration', e.target.value)} className="w-full p-2 border rounded box-border" />
        <label className="block mb-1 font-bold">年間医療・介護費が発生する年齢</label>
        <input type="number" value={params.medicalCareStartAge} onChange={e => handleChange('medicalCareStartAge', e.target.value)} className="w-full p-2 border rounded box-border" />
        <label className="block mb-1 font-bold">娯楽費が減少し始める年齢</label>
        <input type="number" value={params.entertainmentExpensesDeclineStartAge} onChange={e => handleChange('entertainmentExpensesDeclineStartAge', e.target.value)} className="w-full p-2 border rounded box-border" />
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

/**
 * 資産推移のグラフコンポーネントです。
 * @param data グラフに表示するデータ
 */
const AssetChart = ({ data }: { data: YearlyData[] }) => {
  /**
   * Y軸の目盛りを万円単位でフォーマットする関数
   * @param tick 目盛りの値
   * @returns フォーマットされた文字列
   */
  const formatYAxis = (tick: number) => `${(tick / 1000000).toLocaleString()}`;

  return (
    <div className="w-full h-[500px] mb-5">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="age" name="年齢" />
          <YAxis tickFormatter={formatYAxis} />
          <Tooltip formatter={(value: number) => `${(value / 10000).toLocaleString()}万円`} />
          <Legend />
          <Line type="monotone" dataKey="median" stroke="#8884d8" name="資産額中央値" dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="p90" stroke="#82ca9d" name="上位10%" dot={false} />
          <Line type="monotone" dataKey="p75" stroke="#a4de6c" name="上位25%" dot={false} strokeDasharray="5 5" />
          <Line type="monotone" dataKey="p25" stroke="#ffb347" name="下位25%" dot={false} strokeDasharray="5 5" />
          <Line type="monotone" dataKey="p10" stroke="#ffc658" name="下位10%" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * 資産別推移のグラフコンポーネントです。
 * @param data グラフに表示するデータ
 */
const AssetBreakdownChart = ({ data }: { data: YearlyData[] }) => {
  /**
   * Y軸の目盛りを万円単位でフォーマットする関数
   * @param tick 目盛りの値
   * @returns フォーマットされた文字列
   */
  const formatYAxis = (tick: number) => `${(tick / 1000000).toLocaleString()}`;

  return (
    <div className="w-full h-[500px] mb-15">
      <h2 className="text-xl font-bold mb-3">資産別推移（中央値）</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="age" name="年齢" />
          <YAxis tickFormatter={formatYAxis} />
          <Tooltip formatter={(value: number) => `${(value / 10000).toLocaleString()}万円`} />
          <Legend />
          <Line type="monotone" dataKey="medianCash" stroke="#ff7300" name="現金" dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="medianCrypto" stroke="#00c49f" name="仮想通貨" dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="medianStock" stroke="#0088fe" name="株式" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * アプリケーションのメインコンポーネントです。
 */
function App() {
  /**
   * シミュレーションのパラメータを管理する状態
   */
  const [params, setParams] = useState<SimulationParams>({
    initialAge: 30,
    retirementAge: 65,
    endAge: 100,
    loanDuration: 35,
    medicalCareStartAge: 75,
    entertainmentExpensesDeclineStartAge: 75,
    inflationRate: 0.01,
    investmentReturnRate: 0.05,
    investmentRisk: 0.15,
    cryptoReturnRate: 0.12,
    cryptoRisk: 0.35,
    stockTaxRate: 1.1,
    cryptoTaxRate: 1.3,
    cashUpperLimit: 20000000,
    cashLowerLimit: 0,
    cryptoLowerLimit: 0,
    stockLowerLimit: 0,
    liquidationPriority: 'crypto',
    initialStockValue: 0,
    initialCryptoValue: 0,
    initialCashValue: 5000000,
    livingExpenses: 2000000,
    entertainmentExpenses: 500000,
    housingMaintenance: 600000,
    medicalCare: 750000,
    housingLoan: 1800000,
    salary: 3000000,
    realEstateIncome: 0,
    numSimulations: 1000,
    simulationMethod: 'montecarlo',
  });

  /**
   * シミュレーション結果のデータを管理する状態
   */
  const [simulationData, setSimulationData] = useState<YearlyData[] | null>(null);

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

  /**
   * シミュレーションを実行し、結果を状態に保存する関数
   */
  const handleSimulate = () => {
    const data = params.simulationMethod === 'montecarlo'
      ? runMonteCarloSimulation(params)
      : runHistoricalSimulation(params);
    setSimulationData(data);
  };

  /**
   * シミュレーション期間
   */
  const simulationPeriod = useMemo(() => params.endAge - params.initialAge, [params.endAge, params.initialAge]);

  /**
   * 5年ごとのシミュレーション結果のサマリーデータ
   */
  const summaryData = useMemo(() => {
    if (!simulationData) return [];
    return simulationData.filter(d => d.year % 5 === 0 || d.year === simulationPeriod);
  }, [simulationData, simulationPeriod]);

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
        <InputPanel params={params} setParams={setParams} onSimulate={handleSimulate} />
        <div className="flex-1 flex flex-col">
          {simulationData ? (
            <>
              <AssetChart data={simulationData} />
              <AssetBreakdownChart data={simulationData} />
              <div className="w-full overflow-x-auto">
                <h2 className="text-xl font-bold mb-3">シミュレーション結果（5年ごと）</h2>
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-2 text-right">年齢</th>
                      <th className="border p-2 text-right">上位10%</th>
                      <th className="border p-2 text-right">上位25%</th>
                      <th className="border p-2 text-right">資産額中央値</th>
                      <th className="border p-2 text-right">下位25%</th>
                      <th className="border p-2 text-right">下位10%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaryData.map(d => (
                      <tr key={d.year}>
                        <td className="border p-2 text-right">{d.age}歳</td>
                        <td className="border p-2 text-right">{Math.round(d.p90 / 10000).toLocaleString()}万円</td>
                        <td className="border p-2 text-right">{Math.round(d.p75 / 10000).toLocaleString()}万円</td>
                        <td className="border p-2 text-right">{Math.round(d.median / 10000).toLocaleString()}万円</td>
                        <td className="border p-2 text-right">{Math.round(d.p25 / 10000).toLocaleString()}万円</td>
                        <td className="border p-2 text-right">{Math.round(d.p10 / 10000).toLocaleString()}万円</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
