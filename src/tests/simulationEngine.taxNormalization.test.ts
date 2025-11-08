import { runMonteCarloSimulation } from '../utils/simulationEngine';
import type { SimulationParams } from '../types/simulation';

const baseParams = (overrides: Partial<SimulationParams> = {}): SimulationParams => ({
  initialAge: 30,
  retirementAge: 65,
  endAge: 31, // 1年分の短い期間にして決定的にする
  loanDuration: 0,
  medicalCareStartAge: 75,
  entertainmentExpensesDeclineStartAge: 75,
  entertainmentExpensesDeclineRate: 0.0,
  inflationRate: 0,
  investmentReturnRate: 0, // リターン・リスクを 0 にして決定的に
  investmentRisk: 0,
  cryptoReturnRate: 0,
  cryptoRisk: 0,
  stockTaxRate: 0.1,
  cryptoTaxRate: 0.13,
  cashUpperLimit: 1e12,
  cashLowerLimit: 0,
  cryptoLowerLimit: 0,
  stockLowerLimit: 0,
  liquidationPriority: 'stock',
  initialStockValue: 100000,
  initialCryptoValue: 0,
  initialCashValue: 0,
  livingExpenses: 0,
  entertainmentExpenses: 0,
  housingMaintenance: 0,
  medicalCare: 0,
  housingLoan: 0,
  salary: 0,
  realEstateIncome: 0,
  numSimulations: 1,
  simulationMethod: 'montecarlo',
  inflationRegion: 'japan',
  stockRegion: 'sp500',
  ...overrides,
});

test('tax multiplier (1.1/1.13) equals fraction (0.1/0.13) after normalization', () => {
  const paramsFraction = baseParams();
  const paramsMultiplier = baseParams({
    stockTaxRate: 1.1,   // 1.1 -> 10%
    cryptoTaxRate: 1.13, // 1.13 -> 13%
  });

  const resultFraction = runMonteCarloSimulation(paramsFraction);
  const resultMultiplier = runMonteCarloSimulation(paramsMultiplier);

  expect(resultMultiplier).toEqual(resultFraction);
});