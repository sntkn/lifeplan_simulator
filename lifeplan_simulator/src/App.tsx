import { useState, useMemo, useEffect } from 'react';
import './App.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- Types ---
type SimulationParams = {
  // Basic Info
  initialAge: number;
  inflationRate: number;
  investmentReturnRate: number;
  investmentRisk: number;
  stockTaxRate: number;
  cryptoTaxRate: number;
  cashUpperLimit: number;
  cashLowerLimit: number;
  cryptoLowerLimit: number;

  // Initial Assets
  initialStockValue: number;
  initialCryptoValue: number;
  initialCashValue: number;

  // Annual Expenses
  livingExpenses: number;
  entertainmentExpenses: number;
  housingMaintenance: number;
  medicalCare: number;
  housingLoan: number;

  // Annual Income
  salary: number;
  realEstateIncome: number;

  // Monte Carlo specific
  numSimulations: number;
};

type YearlyData = {
  year: number;
  age: number;
  median: number;
  p90: number;
  p10: number;
};

// --- Monte Carlo Simulation Logic ---
const runMonteCarloSimulation = (params: SimulationParams): YearlyData[] => {
  const {
    initialAge,
    inflationRate,
    investmentReturnRate,
    investmentRisk,
    stockTaxRate,
    cryptoTaxRate,
    cashUpperLimit,
    cashLowerLimit,
    cryptoLowerLimit,
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

  const simulationPeriod = 100 - initialAge;
  const results: number[][] = [];

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

    for (let year = 1; year <= simulationPeriod; year++) {
      const currentAge = initialAge + year - 1;

      // Apply investment returns (stochastic)
      const randomFactor = Math.random() * 2 - 1; // -1 to 1
      const annualReturn = investmentReturnRate + randomFactor * investmentRisk;
      stockValue *= (1 + annualReturn);
      cryptoValue *= (1 + annualReturn);

      // Income
      const currentSalary = currentAge <= 55 ? salary : 0;
      const income = currentSalary + currentRealEstateIncome;

      // Expenses
      if (currentAge >= 75) {
        currentEntertainmentExpenses *= 0.9;
      }
      const expenses =
        currentLivingExpenses +
        currentEntertainmentExpenses +
        currentHousingMaintenance +
        (currentAge >= 75 ? currentMedicalCare : 0) +
        (year - 1 < 30 ? housingLoan : 0);

      // Balance and rebalancing
      const balance = income - expenses;
      cashValue += balance;

      if (cashValue > cashUpperLimit) {
        const surplus = cashValue - cashUpperLimit;
        stockValue += surplus;
        cashValue = cashUpperLimit;
      }

      if (cashValue < cashLowerLimit) {
        const deficit = cashLowerLimit - cashValue;
        // To get 'deficit' in cash, we need to sell more than 'deficit' worth of assets due to tax.
        // The tax rate parameter is a multiplier for how much asset to sell.
        // e.g., stockTaxRate = 1.1 means for 1 yen deficit, sell 1.1 yen of stock.
        if (cryptoValue - deficit * cryptoTaxRate >= cryptoLowerLimit) {
          cryptoValue -= deficit * cryptoTaxRate;
          cashValue += deficit;
        } else {
          stockValue -= deficit * stockTaxRate;
          cashValue += deficit;
        }
      }
      
      //if (stockValue < 0) stockValue = 0;
      //if (cryptoValue < 0) cryptoValue = 0;
      //if (cashValue < 0) cashValue = 0;

      const totalAssets = stockValue + cryptoValue + cashValue;
      yearlyTotalAssets.push(totalAssets);

      // Apply inflation for next year
      currentLivingExpenses *= (1 + inflationRate);
      currentEntertainmentExpenses *= (1 + inflationRate);
      currentHousingMaintenance *= (1 + inflationRate);
      currentMedicalCare *= (1 + inflationRate);
      currentRealEstateIncome *= (1 + inflationRate);
    }
    results.push(yearlyTotalAssets);
  }

  // --- Process results for charting ---
  const chartData: YearlyData[] = [];
  for (let year = 0; year <= simulationPeriod; year++) {
    const yearlyOutcomes = results.map(sim => sim[year]);
    yearlyOutcomes.sort((a, b) => a - b);

    const yearData: YearlyData = {
      year: year,
      age: initialAge + year,
      median: yearlyOutcomes[Math.floor(numSimulations / 2)],
      p90: yearlyOutcomes[Math.floor(numSimulations * 0.9)],
      p10: yearlyOutcomes[Math.floor(numSimulations * 0.1)],
    };
    chartData.push(yearData);
  }

  return chartData;
};


// --- UI Components ---
const InputPanel = ({ params, setParams, onSimulate }: { params: SimulationParams, setParams: (p: SimulationParams) => void, onSimulate: () => void }) => {
  const JPY_UNIT = 10000;

  const handleManYenChange = (field: keyof SimulationParams, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setParams({ ...params, [field]: numValue * JPY_UNIT });
    }
  };

  const handleChange = (field: keyof SimulationParams, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setParams({ ...params, [field]: numValue });
    }
  };

  return (
    <div className="w-[300px] p-5 border rounded-lg" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
      <h2 className="text-lg font-bold mt-0 mb-4">シミュレーション設定</h2>
      
      <div className="mb-5">
        <h3 className="text-base font-bold mb-3">基本項目</h3>
        <label className="block mb-1 font-bold">初期年齢</label>
        <input type="number" value={params.initialAge} onChange={e => handleChange('initialAge', e.target.value)} className="w-full p-2 border rounded box-border" />
        <label className="block mb-1 font-bold">インフレ率</label>
        <input type="number" step="0.01" value={params.inflationRate} onChange={e => handleChange('inflationRate', e.target.value)} className="w-full p-2 border rounded box-border" />
        <label className="block mb-1 font-bold">期待リターン（年率）</label>
        <input type="number" step="0.01" value={params.investmentReturnRate} onChange={e => handleChange('investmentReturnRate', e.target.value)} className="w-full p-2 border rounded box-border" />
        <label className="block mb-1 font-bold">リスク（標準偏差）</label>
        <input type="number" step="0.01" value={params.investmentRisk} onChange={e => handleChange('investmentRisk', e.target.value)} className="w-full p-2 border rounded box-border" />
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

      <div className="mb-5">
        <h3 className="text-base font-bold mb-3">モンテカルロ設定</h3>
        <label className="block mb-1 font-bold">シミュレーション回数</label>
        <input type="number" value={params.numSimulations} onChange={e => handleChange('numSimulations', e.target.value)} className="w-full p-2 border rounded box-border" />
      </div>

      <div className="mt-5">
        <button onClick={onSimulate} className="w-full p-2.5 border rounded-t-full rounded-b-full cursor-pointer text-base">シミュレーション実行</button>
      </div>
    </div>
  );
};

const AssetChart = ({ data }: { data: YearlyData[] }) => {
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
          <Line type="monotone" dataKey="median" stroke="#8884d8" name="資産額中央値" dot={false} />
          <Line type="monotone" dataKey="p90" stroke="#82ca9d" name="上位10%" dot={false} />
          <Line type="monotone" dataKey="p10" stroke="#ffc658" name="下位10%" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// --- Main App Component ---
function App() {
  const [params, setParams] = useState<SimulationParams>({
    initialAge: 30,
    inflationRate: 0.02,
    investmentReturnRate: 0.07,
    investmentRisk: 0.15,
    stockTaxRate: 1.1,
    cryptoTaxRate: 1.3,
    cashUpperLimit: 20000000,
    cashLowerLimit: 15000000,
    cryptoLowerLimit: 10000000,
    initialStockValue: 125000000,
    initialCryptoValue: 50000000,
    initialCashValue: 50000000,
    livingExpenses: 3000000,
    entertainmentExpenses: 1000000,
    housingMaintenance: 600000,
    medicalCare: 750000,
    housingLoan: 210000,
    salary: 4500000,
    realEstateIncome: 1000000,
    numSimulations: 1000,
  });

  const [simulationData, setSimulationData] = useState<YearlyData[] | null>(null);

  // ダークモード切り替え
  const [dark, setDark] = useState(true);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);
  const toggleDarkMode = () => setDark(d => !d);

  const handleSimulate = () => {
    const data = runMonteCarloSimulation(params);
    setSimulationData(data);
  };

  const simulationPeriod = useMemo(() => 100 - params.initialAge, [params.initialAge]);

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
              <div className="w-full overflow-x-auto">
                <h2 className="text-xl font-bold mb-3">シミュレーション結果（5年ごと）</h2>
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-2 text-right">年齢</th>
                      <th className="border p-2 text-right">資産額中央値</th>
                      <th className="border p-2 text-right">上位10%</th>
                      <th className="border p-2 text-right">下位10%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaryData.map(d => (
                      <tr key={d.year}>
                        <td className="border p-2 text-right">{d.age}歳</td>
                        <td className="border p-2 text-right">{Math.round(d.median / 10000).toLocaleString()}万円</td>
                        <td className="border p-2 text-right">{Math.round(d.p90 / 10000).toLocaleString()}万円</td>
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
