import { runMonteCarloSimulation } from '../utils/simulationEngine';
import type { SimulationParams, YearlyData } from '../types/simulation';

const deterministicParams: SimulationParams = {
  initialAge: 30,
  endAge: 31,
  retirementAge: 65,
  loanDuration: 0,
  medicalCareStartAge: 75,
  entertainmentExpensesDeclineStartAge: 75,
  entertainmentExpensesDeclineRate: 0,
  inflationRate: 0,
  investmentReturnRate: 0,
  investmentRisk: 0,
  cryptoReturnRate: 0,
  cryptoRisk: 0,
  stockTaxRate: 0,
  cryptoTaxRate: 0,
  cashUpperLimit: Number.MAX_SAFE_INTEGER,
  cashLowerLimit: 0,
  cryptoLowerLimit: 0,
  stockLowerLimit: 0,
  liquidationPriority: 'crypto',
  cashOverflowPriority: 'crypto',
  initialStockValue: 0,
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
  stockRegion: 'sp500'
};

const runScenario = (overrides: Partial<SimulationParams>): YearlyData[] =>
  runMonteCarloSimulation({
    ...deterministicParams,
    ...overrides
  });

describe('Simulation Engine Deterministic Scenarios', () => {
  test('stops salary after retirement age while continuing expenses', () => {
    const result = runScenario({
      initialAge: 64,
      endAge: 66,
      retirementAge: 64,
      initialCashValue: 1000,
      salary: 1000,
      livingExpenses: 300
    });

    expect(result[0]).toMatchObject({
      age: 64,
      medianCash: 1000,
      median: 1000
    });
    expect(result[1]).toMatchObject({
      age: 65,
      medianCash: 1700,
      median: 1700
    });
    expect(result[2]).toMatchObject({
      age: 66,
      medianCash: 1400,
      median: 1400
    });
  });

  test('moves cash above upper limit into stock when stock overflow is selected', () => {
    const result = runScenario({
      initialCashValue: 2000,
      cashUpperLimit: 1000,
      cashOverflowPriority: 'stock'
    });

    expect(result[1]).toMatchObject({
      medianCash: 1000,
      medianStock: 1000,
      medianCrypto: 0,
      median: 2000
    });
  });

  test('moves cash above upper limit into crypto when crypto overflow is selected', () => {
    const result = runScenario({
      initialCashValue: 2000,
      cashUpperLimit: 1000,
      cashOverflowPriority: 'crypto'
    });

    expect(result[1]).toMatchObject({
      medianCash: 1000,
      medianStock: 0,
      medianCrypto: 1000,
      median: 2000
    });
  });

  test('liquidates stock first when stock priority covers the cash deficit', () => {
    const result = runScenario({
      initialStockValue: 2000,
      initialCryptoValue: 2000,
      initialCashValue: 0,
      cashLowerLimit: 1000,
      liquidationPriority: 'stock'
    });

    expect(result[1]).toMatchObject({
      medianCash: 1000,
      medianStock: 1000,
      medianCrypto: 2000,
      median: 4000
    });
  });

  test('liquidates crypto first when crypto priority covers the cash deficit', () => {
    const result = runScenario({
      initialStockValue: 2000,
      initialCryptoValue: 2000,
      initialCashValue: 0,
      cashLowerLimit: 1000,
      liquidationPriority: 'crypto'
    });

    expect(result[1]).toMatchObject({
      medianCash: 1000,
      medianStock: 2000,
      medianCrypto: 1000,
      median: 4000
    });
  });

  test('continues liquidation to the second asset when the first priority asset reaches its lower limit', () => {
    const result = runScenario({
      initialStockValue: 2000,
      initialCryptoValue: 2000,
      initialCashValue: 0,
      cashLowerLimit: 1000,
      stockLowerLimit: 1500,
      liquidationPriority: 'stock'
    });

    expect(result[1]).toMatchObject({
      medianCash: 1000,
      medianStock: 1500,
      medianCrypto: 1500,
      median: 4000
    });
  });

  test('applies stock tax to gross liquidation needed for the cash lower limit', () => {
    const result = runScenario({
      initialStockValue: 2000,
      initialCashValue: 0,
      cashLowerLimit: 1000,
      stockTaxRate: 0.2,
      liquidationPriority: 'stock'
    });

    expect(result[1].medianCash).toBeCloseTo(1000);
    expect(result[1].medianStock).toBeCloseTo(750);
    expect(result[1].medianCrypto).toBeCloseTo(0);
    expect(result[1].median).toBeCloseTo(1750);
  });

  test('applies crypto tax to gross liquidation needed for the cash lower limit', () => {
    const result = runScenario({
      initialCryptoValue: 2000,
      initialCashValue: 0,
      cashLowerLimit: 1000,
      cryptoTaxRate: 0.25,
      liquidationPriority: 'crypto'
    });

    expect(result[1].medianCash).toBeCloseTo(1000);
    expect(result[1].medianStock).toBeCloseTo(0);
    expect(result[1].medianCrypto).toBeCloseTo(666.6666666667);
    expect(result[1].median).toBeCloseTo(1666.6666666667);
  });
});
