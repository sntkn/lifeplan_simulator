import { useState, useMemo } from 'react';
import './App.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- Types ---
type SimulationParams = {
  initialAge: number;
  simulationPeriod: number;
  initialAssets: number;
  annualInvestment: number;
  investmentReturnRate: number;
  investmentRisk: number;
  annualLivingExpenses: number;
  inflationRate: number;
  numSimulations: number;
};

type YearlyData = {
  year: number;
  age: number;
  [key: string]: number;
};

// --- Monte Carlo Simulation Logic ---
const runMonteCarloSimulation = (params: SimulationParams): YearlyData[] => {
  const { 
    initialAge, simulationPeriod, initialAssets, annualInvestment, 
    investmentReturnRate, investmentRisk, annualLivingExpenses, 
    inflationRate, numSimulations 
  } = params;

  const results: number[][] = [];

  for (let i = 0; i < numSimulations; i++) {
    let assets = initialAssets;
    let livingExpenses = annualLivingExpenses;
    const yearlyAssets: number[] = [assets];

    for (let year = 1; year <= simulationPeriod; year++) {
      const randomFactor = Math.random() * 2 - 1; // -1 to 1
      const annualReturn = investmentReturnRate + randomFactor * investmentRisk;
      assets = assets * (1 + annualReturn) + annualInvestment - livingExpenses;
      if (assets < 0) assets = 0;
      
      livingExpenses *= (1 + inflationRate);
      yearlyAssets.push(assets);
    }
    results.push(yearlyAssets);
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
    <div className="input-section">
      <h2>シミュレーション設定</h2>
      <div className="input-group">
        <label>初期年齢</label>
        <input type="number" value={params.initialAge} onChange={e => handleChange('initialAge', e.target.value)} />
      </div>
      <div className="input-group">
        <label>シミュレーション期間（年）</label>
        <input type="number" value={params.simulationPeriod} onChange={e => handleChange('simulationPeriod', e.target.value)} />
      </div>
      <div className="input-group">
        <label>初期資産額</label>
        <input type="number" value={params.initialAssets} onChange={e => handleChange('initialAssets', e.target.value)} />
      </div>
      <div className="input-group">
        <label>年間投資額</label>
        <input type="number" value={params.annualInvestment} onChange={e => handleChange('annualInvestment', e.target.value)} />
      </div>
      <div className="input-group">
        <label>期待リターン（年率）</label>
        <input type="number" step="0.01" value={params.investmentReturnRate} onChange={e => handleChange('investmentReturnRate', e.target.value)} />
      </div>
      <div className="input-group">
        <label>リスク（標準偏差）</label>
        <input type="number" step="0.01" value={params.investmentRisk} onChange={e => handleChange('investmentRisk', e.target.value)} />
      </div>
      <div className="input-group">
        <label>年間生活費</label>
        <input type="number" value={params.annualLivingExpenses} onChange={e => handleChange('annualLivingExpenses', e.target.value)} />
      </div>
      <div className="input-group">
        <label>インフレ率（年率）</label>
        <input type="number" step="0.01" value={params.inflationRate} onChange={e => handleChange('inflationRate', e.target.value)} />
      </div>
      <div className="input-group">
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
    simulationPeriod: 40,
    initialAssets: 10000000,
    annualInvestment: 1200000,
    investmentReturnRate: 0.05,
    investmentRisk: 0.15,
    annualLivingExpenses: 4000000,
    inflationRate: 0.02,
    numSimulations: 1000,
  });

  const [simulationData, setSimulationData] = useState<YearlyData[] | null>(null);

  const handleSimulate = () => {
    const data = runMonteCarloSimulation(params);
    setSimulationData(data);
  };

  const summaryData = useMemo(() => {
    if (!simulationData) return [];
    return simulationData.filter(d => d.year % 5 === 0 || d.year === params.simulationPeriod);
  }, [simulationData, params.simulationPeriod]);

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