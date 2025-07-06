import React, { useState } from 'react';
import './App.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function App() {
  // Basic Info
  const [age, setAge] = useState(30);
  const [inflationRate, setInflationRate] = useState(1.02);
  const [investmentReturnRate, setInvestmentReturnRate] = useState(1.07);
  const [stockTaxRate, setStockTaxRate] = useState(1.1);
  const [cryptoTaxRate, setCryptoTaxRate] = useState(1.3);
  const [cashUpperLimit, setCashUpperLimit] = useState(20000000);
  const [cashLowerLimit, setCashLowerLimit] = useState(15000000);
  const [cryptoLowerLimit, setCryptoLowerLimit] = useState(10000000);

  // Initial Assets
  const [stockValue, setStockValue] = useState(125000000);
  const [cryptoValue, setCryptoValue] = useState(50000000);
  const [cashValue, setCashValue] = useState(50000000);

  // Annual Expenses
  const [livingExpenses, setLivingExpenses] = useState(3000000);
  const [entertainmentExpenses, setEntertainmentExpenses] = useState(1000000);
  const [housingMaintenance, setHousingMaintenance] = useState(600000);
  const [medicalCare, setMedicalCare] = useState(750000);
  const [housingLoan, setHousingLoan] = useState(210000);

  // Annual Income
  const [salary, setSalary] = useState(4500000);
  const [realEstateIncome, setRealEstateIncome] = useState(1000000);

  const [simulationResult, setSimulationResult] = useState<any[]>([]);

  const calculate = () => {
    let currentAge = age;
    let currentStockValue = stockValue;
    let currentCryptoValue = cryptoValue;
    let currentCashValue = cashValue;
    let currentLivingExpenses = livingExpenses;
    let currentEntertainmentExpenses = entertainmentExpenses;
    let currentHousingMaintenance = housingMaintenance;
    let currentMedicalCare = medicalCare;
    let currentRealEstateIncome = realEstateIncome;

    const results = [];

    for (let i = 0; i < 100 - age; i++) {
      const currentSalary = currentAge <= 55 ? salary : 0;
      const income = currentSalary + currentRealEstateIncome;

      if (currentAge >= 75) {
        currentEntertainmentExpenses *= 0.9;
      }
      const expenses =
        currentLivingExpenses +
        currentEntertainmentExpenses +
        currentHousingMaintenance +
        (currentAge >= 75 ? currentMedicalCare : 0) +
        (i < 30 ? housingLoan : 0);

      const balance = income - expenses;
      currentCashValue += balance;

      if (currentCashValue > cashUpperLimit) {
        const surplus = currentCashValue - cashUpperLimit;
        currentStockValue += surplus;
        currentCashValue = cashUpperLimit;
      }

      if (currentCashValue < cashLowerLimit) {
        const deficit = cashLowerLimit - currentCashValue;
        if (currentCryptoValue - deficit * cryptoTaxRate >= cryptoLowerLimit) {
          currentCryptoValue -= deficit * cryptoTaxRate;
          currentCashValue += deficit;
        } else {
          currentStockValue -= deficit * stockTaxRate;
          currentCashValue += deficit;
        }
      }

      const totalAssets = currentStockValue + currentCryptoValue + currentCashValue;

      results.push({
        age: currentAge,
        salary: currentSalary,
        realEstateIncome: Math.round(currentRealEstateIncome),
        income: Math.round(income),
        livingExpenses: Math.round(currentLivingExpenses),
        entertainmentExpenses: Math.round(currentEntertainmentExpenses),
        housingMaintenance: Math.round(currentHousingMaintenance),
        medicalCare: currentAge >= 75 ? Math.round(currentMedicalCare) : 0,
        housingLoan: i < 30 ? housingLoan : 0,
        expenses: Math.round(expenses),
        balance: Math.round(balance),
        stockValue: Math.round(currentStockValue),
        cryptoValue: Math.round(currentCryptoValue),
        cashValue: Math.round(currentCashValue),
        totalAssets: Math.round(totalAssets),
      });

      currentAge++;
      currentLivingExpenses *= inflationRate;
      currentEntertainmentExpenses *= inflationRate;
      currentHousingMaintenance *= inflationRate;
      currentMedicalCare *= inflationRate;
      currentRealEstateIncome *= inflationRate;
      currentStockValue *= investmentReturnRate;
      currentCryptoValue *= investmentReturnRate;
    }
    setSimulationResult(results);
  };

  const formatYAxis = (tickItem: number) => {
    return (tickItem / 10000).toLocaleString();
  };

  return (
    <div className="App">
      <h1>ライフプランシミュレーター</h1>

      <div className="input-section">
        <h2>基本項目</h2>
        <label>年齢: <input type="number" value={age} onChange={e => setAge(Number(e.target.value))} /></label>
        <label>インフレ率: <input type="number" step="0.01" value={inflationRate} onChange={e => setInflationRate(Number(e.target.value))} /></label>
        <label>投資名目リターン: <input type="number" step="0.01" value={investmentReturnRate} onChange={e => setInvestmentReturnRate(Number(e.target.value))} /></label>
        <label>株を取り崩す際の税率: <input type="number" step="0.01" value={stockTaxRate} onChange={e => setStockTaxRate(Number(e.target.value))} /></label>
        <label>仮想通貨を取り崩す際の税率: <input type="number" step="0.01" value={cryptoTaxRate} onChange={e => setCryptoTaxRate(Number(e.target.value))} /></label>
        <label>現金保有の上限金額: <input type="number" value={cashUpperLimit} onChange={e => setCashUpperLimit(Number(e.target.value))} /></label>
        <label>現金保有の下限金額: <input type="number" value={cashLowerLimit} onChange={e => setCashLowerLimit(Number(e.target.value))} /></label>
        <label>仮想通貨保有の下限金額: <input type="number" value={cryptoLowerLimit} onChange={e => setCryptoLowerLimit(Number(e.target.value))} /></label>

        <h2>資産初期値</h2>
        <label>株保有額: <input type="number" value={stockValue} onChange={e => setStockValue(Number(e.target.value))} /></label>
        <label>仮想通貨保有額: <input type="number" value={cryptoValue} onChange={e => setCryptoValue(Number(e.target.value))} /></label>
        <label>現金: <input type="number" value={cashValue} onChange={e => setCashValue(Number(e.target.value))} /></label>

        <h2>年間支出項目</h2>
        <label>生活費: <input type="number" value={livingExpenses} onChange={e => setLivingExpenses(Number(e.target.value))} /></label>
        <label>娯楽費: <input type="number" value={entertainmentExpenses} onChange={e => setEntertainmentExpenses(Number(e.target.value))} /></label>
        <label>住宅維持費: <input type="number" value={housingMaintenance} onChange={e => setHousingMaintenance(Number(e.target.value))} /></label>
        <label>医療・介護費: <input type="number" value={medicalCare} onChange={e => setMedicalCare(Number(e.target.value))} /></label>
        <label>住宅ローン: <input type="number" value={housingLoan} onChange={e => setHousingLoan(Number(e.target.value))} /></label>

        <h2>年間収入項目</h2>
        <label>給与所得: <input type="number" value={salary} onChange={e => setSalary(Number(e.target.value))} /></label>
        <label>不動産所得: <input type="number" value={realEstateIncome} onChange={e => setRealEstateIncome(Number(e.target.value))} /></label>
      </div>

      <button onClick={calculate}>計算実行</button>

      {simulationResult.length > 0 && (
        <>
          <div className="result-section">
            <h2>計算結果</h2>
            <table>
              <thead>
                <tr>
                  <th>年齢</th>
                  <th>給与所得</th>
                  <th>不動産所得</th>
                  <th>収入合計</th>
                  <th>生活費</th>
                  <th>娯楽費</th>
                  <th>住宅維持費</th>
                  <th>医療・介護費</th>
                  <th>住宅ローン</th>
                  <th>支出合計</th>
                  <th>収支</th>
                  <th>株評価額</th>
                  <th>仮想通貨評価額</th>
                  <th>現金</th>
                  <th>総資産残高</th>
                </tr>
              </thead>
              <tbody>
                {simulationResult.map((res, index) => (
                  <tr key={index}>
                    <td>{res.age}</td>
                    <td>{res.salary.toLocaleString()}</td>
                    <td>{res.realEstateIncome.toLocaleString()}</td>
                    <td>{res.income.toLocaleString()}</td>
                    <td>{res.livingExpenses.toLocaleString()}</td>
                    <td>{res.entertainmentExpenses.toLocaleString()}</td>
                    <td>{res.housingMaintenance.toLocaleString()}</td>
                    <td>{res.medicalCare.toLocaleString()}</td>
                    <td>{res.housingLoan.toLocaleString()}</td>
                    <td>{res.expenses.toLocaleString()}</td>
                    <td>{res.balance.toLocaleString()}</td>
                    <td>{res.stockValue.toLocaleString()}</td>
                    <td>{res.cryptoValue.toLocaleString()}</td>
                    <td>{res.cashValue.toLocaleString()}</td>
                    <td>{res.totalAssets.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="graph-section">
            <h2>グラフ</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={simulationResult}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="age" />
                <YAxis tickFormatter={formatYAxis} />
                <Tooltip formatter={(value: number) => `${(value / 10000).toLocaleString()}万円`} />
                <Legend />
                <Bar dataKey="totalAssets" fill="#8884d8" name="総資産残高（万円）" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
