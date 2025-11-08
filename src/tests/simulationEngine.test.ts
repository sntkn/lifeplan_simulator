/**
 * Simulation Engine Tests
 */

import { runMonteCarloSimulation, runHistoricalSimulation } from '../utils/simulationEngine';
import type { SimulationParams } from '../types/simulation';

const baseParams: SimulationParams = {
  initialAge: 30,
  endAge: 35,
  retirementAge: 65,
  loanDuration: 0,
  medicalCareStartAge: 75,
  entertainmentExpensesDeclineStartAge: 75,
  entertainmentExpensesDeclineRate: 0.1,
  inflationRate: 0.02,
  investmentReturnRate: 0.05,
  investmentRisk: 0.15,
  cryptoReturnRate: 0.10,
  cryptoRisk: 0.30,
  stockTaxRate: 0.10,
  cryptoTaxRate: 0.30,
  cashUpperLimit: 10000000,
  cashLowerLimit: 1000000,
  cryptoLowerLimit: 0,
  stockLowerLimit: 0,
  liquidationPriority: 'crypto',
  initialStockValue: 5000000,
  initialCryptoValue: 1000000,
  initialCashValue: 2000000,
  livingExpenses: 2000000,
  entertainmentExpenses: 500000,
  housingMaintenance: 300000,
  medicalCare: 500000,
  housingLoan: 0,
  salary: 4000000,
  realEstateIncome: 0,
  numSimulations: 100,
  simulationMethod: 'montecarlo',
  inflationRegion: 'japan',
  stockRegion: 'sp500'
};

describe('Monte Carlo Simulation', () => {
  test('returns yearly data array', () => {
    const result = runMonteCarloSimulation(baseParams);
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(6); // 5 years + initial year
  });

  test('includes all required fields in yearly data', () => {
    const result = runMonteCarloSimulation(baseParams);
    const firstYear = result[0];

    expect(firstYear).toHaveProperty('year');
    expect(firstYear).toHaveProperty('age');
    expect(firstYear).toHaveProperty('median');
    expect(firstYear).toHaveProperty('p90');
    expect(firstYear).toHaveProperty('p75');
    expect(firstYear).toHaveProperty('p25');
    expect(firstYear).toHaveProperty('p10');
    expect(firstYear).toHaveProperty('medianStock');
    expect(firstYear).toHaveProperty('medianCrypto');
    expect(firstYear).toHaveProperty('medianCash');
  });

  test('ages increment correctly', () => {
    const result = runMonteCarloSimulation(baseParams);
    expect(result[0].age).toBe(30);
    expect(result[1].age).toBe(31);
    expect(result[5].age).toBe(35);
  });

  test('handles zero risk scenario', () => {
    const zeroRiskParams = {
      ...baseParams,
      investmentRisk: 0,
      cryptoRisk: 0
    };
    const result = runMonteCarloSimulation(zeroRiskParams);
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBeGreaterThan(0);
  });

  test('handles high inflation scenario', () => {
    const highInflationParams = {
      ...baseParams,
      inflationRate: 0.10
    };
    const result = runMonteCarloSimulation(highInflationParams);
    expect(result).toBeInstanceOf(Array);
  });

  test('handles retirement age transition', () => {
    const retirementParams = {
      ...baseParams,
      initialAge: 63,
      endAge: 67,
      retirementAge: 65
    };
    const result = runMonteCarloSimulation(retirementParams);
    expect(result).toBeInstanceOf(Array);
  });

  test('handles loan duration', () => {
    const loanParams = {
      ...baseParams,
      loanDuration: 3,
      housingLoan: 1000000
    };
    const result = runMonteCarloSimulation(loanParams);
    expect(result).toBeInstanceOf(Array);
  });

  test('handles medical care start age', () => {
    const medicalParams = {
      ...baseParams,
      initialAge: 73,
      endAge: 77,
      medicalCareStartAge: 75
    };
    const result = runMonteCarloSimulation(medicalParams);
    expect(result).toBeInstanceOf(Array);
  });

  test('handles entertainment decline', () => {
    const entertainmentParams = {
      ...baseParams,
      initialAge: 73,
      endAge: 77,
      entertainmentExpensesDeclineStartAge: 75,
      entertainmentExpensesDeclineRate: 0.2
    };
    const result = runMonteCarloSimulation(entertainmentParams);
    expect(result).toBeInstanceOf(Array);
  });

  test('handles cash upper limit rebalancing', () => {
    const highCashParams = {
      ...baseParams,
      initialCashValue: 15000000,
      cashUpperLimit: 10000000
    };
    const result = runMonteCarloSimulation(highCashParams);
    expect(result).toBeInstanceOf(Array);
  });

  test('handles cash lower limit liquidation', () => {
    const lowCashParams = {
      ...baseParams,
      initialCashValue: 500000,
      cashLowerLimit: 2000000,
      salary: 0
    };
    const result = runMonteCarloSimulation(lowCashParams);
    expect(result).toBeInstanceOf(Array);
  });

  test('handles stock liquidation priority', () => {
    const stockPriorityParams = {
      ...baseParams,
      liquidationPriority: 'stock' as const
    };
    const result = runMonteCarloSimulation(stockPriorityParams);
    expect(result).toBeInstanceOf(Array);
  });

  test('handles random liquidation priority', () => {
    const randomPriorityParams = {
      ...baseParams,
      liquidationPriority: 'random' as const
    };
    const result = runMonteCarloSimulation(randomPriorityParams);
    expect(result).toBeInstanceOf(Array);
  });

  test('handles asset lower limits', () => {
    const lowerLimitParams = {
      ...baseParams,
      stockLowerLimit: 1000000,
      cryptoLowerLimit: 500000
    };
    const result = runMonteCarloSimulation(lowerLimitParams);
    expect(result).toBeInstanceOf(Array);
  });

  test('handles real estate income', () => {
    const realEstateParams = {
      ...baseParams,
      realEstateIncome: 1000000
    };
    const result = runMonteCarloSimulation(realEstateParams);
    expect(result).toBeInstanceOf(Array);
  });
});

describe('Historical Simulation', () => {
  test('returns yearly data array', () => {
    const historicalParams = {
      ...baseParams,
      simulationMethod: 'historical' as const
    };
    const result = runHistoricalSimulation(historicalParams);
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(6);
  });

  test('uses sp500 stock data', () => {
    const sp500Params = {
      ...baseParams,
      stockRegion: 'sp500' as const
    };
    const result = runHistoricalSimulation(sp500Params);
    expect(result).toBeInstanceOf(Array);
  });

  test('uses nikkei stock data', () => {
    const nikkeiParams = {
      ...baseParams,
      stockRegion: 'nikkei' as const
    };
    const result = runHistoricalSimulation(nikkeiParams);
    expect(result).toBeInstanceOf(Array);
  });

  test('uses world stock data', () => {
    const worldParams = {
      ...baseParams,
      stockRegion: 'world' as const
    };
    const result = runHistoricalSimulation(worldParams);
    expect(result).toBeInstanceOf(Array);
  });

  test('uses japan inflation data', () => {
    const japanParams = {
      ...baseParams,
      inflationRegion: 'japan' as const
    };
    const result = runHistoricalSimulation(japanParams);
    expect(result).toBeInstanceOf(Array);
  });

  test('uses us inflation data', () => {
    const usParams = {
      ...baseParams,
      inflationRegion: 'us' as const
    };
    const result = runHistoricalSimulation(usParams);
    expect(result).toBeInstanceOf(Array);
  });

  test('uses world inflation data', () => {
    const worldParams = {
      ...baseParams,
      inflationRegion: 'world' as const
    };
    const result = runHistoricalSimulation(worldParams);
    expect(result).toBeInstanceOf(Array);
  });

  test('handles long simulation period with cyclic data', () => {
    const longParams = {
      ...baseParams,
      initialAge: 30,
      endAge: 100 // 70 years, exceeds 30 years of historical data
    };
    const result = runHistoricalSimulation(longParams);
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(71);
  });

  test('handles very long simulation period', () => {
    const veryLongParams = {
      ...baseParams,
      initialAge: 30,
      endAge: 120 // 90 years
    };
    const result = runHistoricalSimulation(veryLongParams);
    expect(result).toBeInstanceOf(Array);
  });

  test('validates simulation period', () => {
    const invalidParams = {
      ...baseParams,
      initialAge: 30,
      endAge: 131 // Over 100 years
    };
    const result = runHistoricalSimulation(invalidParams);
    expect(result).toEqual([]);
  });
});

describe('Tax Handling', () => {
  test('applies stock tax on liquidation', () => {
    const taxParams = {
      ...baseParams,
      stockTaxRate: 0.20,
      initialCashValue: 0,
      cashLowerLimit: 1000000,
      salary: 0
    };
    const result = runMonteCarloSimulation(taxParams);
    expect(result).toBeInstanceOf(Array);
  });

  test('applies crypto tax on liquidation', () => {
    const taxParams = {
      ...baseParams,
      cryptoTaxRate: 0.30,
      initialCashValue: 0,
      cashLowerLimit: 1000000,
      salary: 0,
      liquidationPriority: 'crypto' as const
    };
    const result = runMonteCarloSimulation(taxParams);
    expect(result).toBeInstanceOf(Array);
  });

  test('handles zero tax rate', () => {
    const zeroTaxParams = {
      ...baseParams,
      stockTaxRate: 0,
      cryptoTaxRate: 0
    };
    const result = runMonteCarloSimulation(zeroTaxParams);
    expect(result).toBeInstanceOf(Array);
  });

  test('handles high tax rate', () => {
    const highTaxParams = {
      ...baseParams,
      stockTaxRate: 0.50,
      cryptoTaxRate: 0.55
    };
    const result = runMonteCarloSimulation(highTaxParams);
    expect(result).toBeInstanceOf(Array);
  });
});

describe('Edge Cases', () => {
  test('handles zero initial assets', () => {
    const zeroAssetsParams = {
      ...baseParams,
      initialStockValue: 0,
      initialCryptoValue: 0,
      initialCashValue: 0
    };
    const result = runMonteCarloSimulation(zeroAssetsParams);
    expect(result).toBeInstanceOf(Array);
  });

  test('handles zero expenses', () => {
    const zeroExpensesParams = {
      ...baseParams,
      livingExpenses: 0,
      entertainmentExpenses: 0,
      housingMaintenance: 0,
      medicalCare: 0
    };
    const result = runMonteCarloSimulation(zeroExpensesParams);
    expect(result).toBeInstanceOf(Array);
  });

  test('handles zero income', () => {
    const zeroIncomeParams = {
      ...baseParams,
      salary: 0,
      realEstateIncome: 0
    };
    const result = runMonteCarloSimulation(zeroIncomeParams);
    expect(result).toBeInstanceOf(Array);
  });

  test('handles single year simulation', () => {
    const singleYearParams = {
      ...baseParams,
      initialAge: 30,
      endAge: 31
    };
    const result = runMonteCarloSimulation(singleYearParams);
    expect(result.length).toBe(2);
  });

  test('handles negative returns scenario', () => {
    const negativeReturnParams = {
      ...baseParams,
      investmentReturnRate: -0.10,
      cryptoReturnRate: -0.20
    };
    const result = runMonteCarloSimulation(negativeReturnParams);
    expect(result).toBeInstanceOf(Array);
  });
});
