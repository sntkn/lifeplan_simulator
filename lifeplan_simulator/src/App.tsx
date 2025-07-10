import { useState, useMemo } from 'react';
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
      
      if (stockValue < 0) stockValue = 0;
      if (cryptoValue < 0) cryptoValue = 0;
      if (cashValue < 0) cashValue = 0;

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
  const handleChange = (field: keyof SimulationParams, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setParams({ ...params, [field]: numValue });
    }
  };

  return (
    <div className="input-section" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
      <h2>シミュレーション設定</h2>
      
      <div className="input-group">
        <h3>基本項目</h3>
        <label>初期年齢</label>
        <input type="number" value={params.initialAge} onChange={e => handleChange('initialAge', e.target.value)} />
        <label>インフレ率</label>
        <input type="number" step="0.01" value={params.inflationRate} onChange={e => handleChange('inflationRate', e.target.value)} />
        <label>期待リターン（年率）</label>
        <input type="number" step="0.01" value={params.investmentReturnRate} onChange={e => handleChange('investmentReturnRate', e.target.value)} />
        <label>リスク（標準偏差）</label>
        <input type="number" step="0.01" value={params.investmentRisk} onChange={e => handleChange('investmentRisk', e.target.value)} />
        <label>株売却時のコスト（税金等）</label>
        <input type="number" step="0.01" value={params.stockTaxRate} onChange={e => handleChange('stockTaxRate', e.target.value)} />
        <label>仮想通貨売却時のコスト（税金等）</label>
        <input type="number" step="0.01" value={params.cryptoTaxRate} onChange={e => handleChange('cryptoTaxRate', e.target.value)} />
        <label>現金保有の上限</label>
        <input type="number" value={params.cashUpperLimit} onChange={e => handleChange('cashUpperLimit', e.target.value)} />
        <label>現金保有の下限</label>
        <input type="number" value={params.cashLowerLimit} onChange={e => handleChange('cashLowerLimit', e.target.value)} />
        <label>仮想通貨保有の下限</label>
        <input type="number" value={params.cryptoLowerLimit} onChange={e => handleChange('cryptoLowerLimit', e.target.value)} />
      </div>

      <div className="input-group">
        <h3>資産初期値</h3>
        <label>株保有額</label>
        <input type="number" value={params.initialStockValue} onChange={e => handleChange('initialStockValue', e.target.value)} />
        <label>仮想通貨保有額</label>
        <input type="number" value={params.initialCryptoValue} onChange={e => handleChange('initialCryptoValue', e.target.value)} />
        <label>現金</label>
        <input type="number" value={params.initialCashValue} onChange={e => handleChange('initialCashValue', e.target.value)} />
      </div>

      <div className="input-group">
        <h3>年間支出</h3>
        <label>生活費</label>
        <input type="number" value={params.livingExpenses} onChange={e => handleChange('livingExpenses', e.target.value)} />
        <label>娯楽費</label>
        <input type="number" value={params.entertainmentExpenses} onChange={e => handleChange('entertainmentExpenses', e.target.value)} />
        <label>住宅維持費</label>
        <input type="number" value={params.housingMaintenance} onChange={e => handleChange('housingMaintenance', e.target.value)} />
        <label>医療・介護費</label>
        <input type="number" value={params.medicalCare} onChange={e => handleChange('medicalCare', e.target.value)} />
        <label>住宅ローン</label>
        <input type="number" value={params.housingLoan} onChange={e => handleChange('housingLoan', e.target.value)} />
      </div>

      <div className="input-group">
        <h3>年間収入</h3>
        <label>給与所得</label>
        <input type="number" value={params.salary} onChange={e => handleChange('salary', e.target.value)} />
        <label>不動産所得</label>
        <input type="number" value={params.realEstateIncome} onChange={e => handleChange('realEstateIncome', e.target.value)} />
      </div>

      <div className="input-group">
        <h3>モンテカルロ設定</h3>
        <label>シミュレーション回数</label>
        <input type="number" value={params.numSimulations} onChange={e => handleChange('numSimulations', e.target.value)} />
      </div>

      <div className="simulation-controls">
        <button onClick={onSimulate}>シミュレーション実行</button>
      </div>
    </div>
  );
};

const AssetChart = ({ data }: { data: YearlyData[] }) => {
  const formatYAxis = (tick: number) => `${(tick / 10000).toLocaleString()}万円`;

  return (
    <div className="graph-section">
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
    <div className="App">
      <h1>老後資産推移モンテカルロシミュレーター</h1>
      <div className="container">
        <InputPanel params={params} setParams={setParams} onSimulate={handleSimulate} />
        <div className="main-content">
          {simulationData ? (
            <>
              <AssetChart data={simulationData} />
              <div className="result-section">
                <h2>シミュレーション結果（5年ごと）</h2>
                <table>
                  <thead>
                    <tr>
                      <th>年齢</th>
                      <th>資産額中央値</th>
                      <th>上位10%</th>
                      <th>下位10%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaryData.map(d => (
                      <tr key={d.year}>
                        <td>{d.age}歳</td>
                        <td>{Math.round(d.median / 10000).toLocaleString()}万円</td>
                        <td>{Math.round(d.p90 / 10000).toLocaleString()}万円</td>
                        <td>{Math.round(d.p10 / 10000).toLocaleString()}万円</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="graph-section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p>左のパネルで設定を入力し、「シミュレーション実行」ボタンを押してください。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
