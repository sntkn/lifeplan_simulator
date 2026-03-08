import { __simulationTestUtils } from '../utils/simulationEngine';
import type { SimulationParams } from '../types/simulation';

const { calculatePercentileValue, processSimulationResults } = __simulationTestUtils;

const baseParams: SimulationParams = {
  initialAge: 30,
  endAge: 33,
  retirementAge: 60,
  loanDuration: 0,
  medicalCareStartAge: 80,
  entertainmentExpensesDeclineStartAge: 80,
  entertainmentExpensesDeclineRate: 0.1,
  inflationRate: 0.02,
  investmentReturnRate: 0.05,
  investmentRisk: 0.1,
  cryptoReturnRate: 0.05,
  cryptoRisk: 0.1,
  stockTaxRate: 0.1,
  cryptoTaxRate: 0.1,
  cashUpperLimit: 1000000,
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

const generateOutcomeSeries = (baseValue: number): number[] => [
  baseValue,
  baseValue + 10,
  baseValue + 20,
  baseValue + 30,
];

describe('calculatePercentileValue', () => {
  test('handles empty and single element arrays', () => {
    expect(calculatePercentileValue([], 0.5)).toBe(0);
    expect(calculatePercentileValue([123], 0.1)).toBe(123);
  });

  test('returns spread percentiles for sorted series', () => {
    const sortedValues = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
    expect(calculatePercentileValue(sortedValues, 0.1)).toBeLessThan(calculatePercentileValue(sortedValues, 0.5));
    expect(calculatePercentileValue(sortedValues, 0.9)).toBeGreaterThan(calculatePercentileValue(sortedValues, 0.5));
  });
});

describe('processSimulationResults percentiles', () => {
  test('derives percentiles using sorted yearly outcomes', () => {
    const simulationPeriod = baseParams.endAge - baseParams.initialAge;
    const totalSimulations: number[][] = [];

    for (let i = 1; i <= 10; i++) {
      totalSimulations.push(generateOutcomeSeries(i * 100));
    }

    const params = { ...baseParams };
    const chartData = processSimulationResults(
      totalSimulations,
      totalSimulations,
      totalSimulations,
      totalSimulations,
      params
    );

    expect(chartData).toHaveLength(simulationPeriod + 1);

    const firstYearValues = totalSimulations.map(sim => sim[0]);
    const sortedFirstYearValues = [...firstYearValues].sort((a, b) => a - b);

    const expectedP10 = calculatePercentileValue(sortedFirstYearValues, 0.1);
    const expectedMedian = calculatePercentileValue(sortedFirstYearValues, 0.5);
    const expectedP90 = calculatePercentileValue(sortedFirstYearValues, 0.9);

    expect(chartData[0].p10).toBe(expectedP10);
    expect(chartData[0].median).toBe(expectedMedian);
    expect(chartData[0].p90).toBe(expectedP90);
    expect(chartData[0].p10).toBeLessThan(chartData[0].median);
    expect(chartData[0].median).toBeLessThan(chartData[0].p90);
  });
});
